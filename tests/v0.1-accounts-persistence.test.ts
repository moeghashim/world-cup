import test from 'node:test'
import assert from 'node:assert/strict'
import type { ApiRequest, ApiResponse } from '../api/_lib/http.js'

process.env.PRIMARY_DB_CONNECTION_STRING ||= 'postgres://user:pass@localhost/db'

const { HttpError, sendError } = await import('../api/_lib/http.js')
const {
  clearSessionCookie,
  getSessionCookie,
  setSessionCookie,
} = await import('../api/_lib/cookies.js')
const {
  decodeAuthState,
  encodeAuthState,
  getAuthRedirectUri,
  getReturnTo,
} = await import('../api/_lib/request-url.js')
const { validateHandle } = await import('../api/_lib/users.js')
const {
  validateBracketPayload,
  validateGroupPicksPayload,
  validatePredictionPayload,
} = await import('../api/_lib/picks.js')
const {
  hasBracketPicksForMigration,
  hasGroupPicksForMigration,
} = await import('../src/floodlights/lib/accountMigration.js')
const { default: bracketHandler } = await import('../api/picks/bracket.js')

type CapturedResponse = {
  statusCode: number
  body: unknown
  headers: Record<string, string | string[]>
}

function createResponse(): ApiResponse & { captured: CapturedResponse } {
  const captured: CapturedResponse = {
    statusCode: 200,
    body: null,
    headers: {},
  }

  return {
    captured,
    status(statusCode: number) {
      captured.statusCode = statusCode
      return this
    },
    json(body: unknown) {
      captured.body = body
    },
    redirect(statusOrUrl: number | string, url?: string) {
      captured.statusCode =
        typeof statusOrUrl === 'number' ? statusOrUrl : 302
      captured.headers.location =
        typeof statusOrUrl === 'string' ? statusOrUrl : url ?? ''
    },
    setHeader(name: string, value: string | string[]) {
      captured.headers[name.toLowerCase()] = value
    },
  }
}

function request(overrides: Partial<ApiRequest> = {}): ApiRequest {
  return {
    method: 'GET',
    headers: {
      host: 'localhost:5173',
      'x-forwarded-proto': 'http',
    },
    query: {},
    ...overrides,
  }
}

test('auth redirect state keeps only safe local return paths', () => {
  const safe = request({ query: { returnTo: '/pickem#group' } })
  const unsafe = request({ query: { returnTo: 'https://example.com' } })
  const encoded = encodeAuthState('/profile?setup=handle')

  assert.equal(getReturnTo(safe), '/pickem#group')
  assert.equal(getReturnTo(unsafe), '/pickem')
  assert.equal(decodeAuthState(encoded).returnTo, '/profile?setup=handle')
  assert.equal(
    getAuthRedirectUri(safe),
    'http://localhost:5173/api/auth/callback',
  )
})

test('session cookies are httpOnly and secure only off localhost', () => {
  const secureResponse = createResponse()
  const secureRequest = request({
    headers: {
      host: 'winworldcup2026.com',
      'x-forwarded-proto': 'https',
    },
  })
  setSessionCookie(secureResponse, secureRequest, 'sealed session value')

  const secureCookie = secureResponse.captured.headers['set-cookie']
  assert.equal(typeof secureCookie, 'string')
  assert.match(String(secureCookie), /wwc_session=sealed%20session%20value/)
  assert.match(String(secureCookie), /HttpOnly/)
  assert.match(String(secureCookie), /SameSite=Lax/)
  assert.match(String(secureCookie), /Secure/)
  assert.equal(
    getSessionCookie(
      request({ headers: { cookie: 'wwc_session=sealed%20session%20value' } }),
    ),
    'sealed session value',
  )

  const localResponse = createResponse()
  clearSessionCookie(localResponse, request())
  const localCookie = String(localResponse.captured.headers['set-cookie'])
  assert.match(localCookie, /Max-Age=0/)
  assert.doesNotMatch(localCookie, /Secure/)
})

test('handle validation accepts public handles and rejects invalid shapes', () => {
  assert.equal(validateHandle(' World Cup 2026 '), 'World-Cup-2026')
  assert.throws(() => validateHandle('ab'), HttpError)
  assert.throws(() => validateHandle('bad handle!'), HttpError)
})

test('pick validators accept the persisted v0.1 shapes', () => {
  assert.deepEqual(
    validateBracketPayload({
      groups: { A: ['MEX', 'KOR', 'CRO'] },
      thirds: ['A'],
      ko: { r0m0: 'MEX' },
      locked: true,
    }),
    {
      groups: { A: ['MEX', 'KOR', 'CRO'] },
      thirds: ['A'],
      ko: { r0m0: 'MEX' },
      locked: true,
    },
  )

  assert.deepEqual(
    validateGroupPicksPayload({ picks: { '0': 'a', '1': 'd' }, locked: false }),
    { picks: { '0': 'a', '1': 'd' }, locked: false },
  )

  assert.deepEqual(
    validatePredictionPayload({
      matchId: 'match-1',
      homeScore: 2,
      awayScore: 1,
      locked: true,
    }),
    { matchId: 'match-1', homeScore: 2, awayScore: 1, locked: true },
  )
})

test('pick validators reject malformed score payloads', () => {
  assert.throws(
    () =>
      validatePredictionPayload({
        matchId: 'match-1',
        homeScore: -1,
        awayScore: 1,
        locked: true,
      }),
    HttpError,
  )
})

test('anonymous migration helpers detect meaningful local picks only', () => {
  assert.equal(
    hasBracketPicksForMigration({
      groups: {},
      thirds: [],
      ko: {},
      locked: false,
    }),
    false,
  )
  assert.equal(
    hasBracketPicksForMigration({
      groups: { A: ['MEX'] },
      thirds: [],
      ko: {},
      locked: false,
    }),
    true,
  )
  assert.equal(
    hasGroupPicksForMigration({ picks: {}, locked: false }),
    false,
  )
  assert.equal(
    hasGroupPicksForMigration({ picks: { '0': 'a' }, locked: false }),
    true,
  )
})

test('non-auth pick APIs do not return email or token/session fields', async () => {
  const response = createResponse()
  await bracketHandler(request(), response)

  const body = response.captured.body
  const serialized = JSON.stringify(body)

  assert.equal(response.captured.statusCode, 401)
  assert.match(serialized, /not_authenticated/)
  assert.doesNotMatch(serialized, /email/i)
  assert.doesNotMatch(serialized, /token/i)
  assert.doesNotMatch(serialized, /session/i)
})

test('server error helper hides token and email data in generic responses', () => {
  const response = createResponse()
  sendError(response, new Error('token leaked for user@example.com'))

  const serialized = JSON.stringify(response.captured.body)

  assert.equal(response.captured.statusCode, 500)
  assert.doesNotMatch(serialized, /user@example.com/)
  assert.doesNotMatch(serialized, /token leaked/)
})
