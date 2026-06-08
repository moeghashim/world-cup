import test from 'node:test'
import assert from 'node:assert/strict'
import type { ApiRequest, ApiResponse } from '../api/_lib/http.js'

process.env.PRIMARY_DB_CONNECTION_STRING ||= 'postgres://user:pass@localhost/db'
process.env.AUTH0_CLIENT_ID ||= 'auth0-client-id'
process.env.AUTH0_CLIENT_SECRET ||= 'auth0-client-secret'
process.env.AUTH0_COOKIE_SECRET ||= 'test-auth0-cookie-secret-32-characters'
process.env.AUTH0_DOMAIN ||= 'worldcup2026.us.auth0.com'

const { HttpError, sendError } = await import('../api/_lib/http.js')
const {
  clearSessionCookie,
  getSessionCookie,
  setSessionCookie,
} = await import('../api/_lib/cookies.js')
const { createAppSession, verifyAppSession } = await import('../api/_lib/auth0.js')
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
const { default: startHandler } = await import('../api/auth/start.js')
const { default: passwordlessStartHandler } = await import(
  '../api/auth/passwordless-start.js'
)
const { default: nestedPasswordlessStartHandler } = await import(
  '../api/auth/passwordless/start.js'
)
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
  const encoded = encodeAuthState('/profile?setup=handle', 'state-nonce')

  assert.equal(getReturnTo(safe), '/pickem#group')
  assert.equal(getReturnTo(unsafe), '/pickem')
  assert.equal(decodeAuthState(encoded).returnTo, '/profile?setup=handle')
  assert.equal(decodeAuthState(encoded).nonce, 'state-nonce')
  assert.equal(
    getAuthRedirectUri(safe),
    'http://localhost:5173/api/auth/callback',
  )
})

test('auth start redirects to Auth0 and binds a nonce cookie', () => {
  const response = createResponse()
  startHandler(request({ query: { returnTo: '/pickem#group' } }), response)

  assert.equal(response.captured.statusCode, 302)
  const location = String(response.captured.headers.location)
  const redirectUrl = new URL(location)
  assert.equal(redirectUrl.hostname, 'worldcup2026.us.auth0.com')
  assert.equal(redirectUrl.pathname, '/authorize')
  assert.equal(redirectUrl.searchParams.get('client_id'), 'auth0-client-id')
  assert.equal(
    redirectUrl.searchParams.get('redirect_uri'),
    'http://localhost:5173/api/auth/callback',
  )

  const state = decodeAuthState(redirectUrl.searchParams.get('state'))
  assert.equal(state.returnTo, '/pickem#group')
  assert.ok(state.nonce)

  const cookie = String(response.captured.headers['set-cookie'])
  assert.match(cookie, /wwc_auth_state=/)
  assert.match(cookie, /HttpOnly/)
})

test('passwordless start asks Auth0 to send an email code', async () => {
  const originalFetch = globalThis.fetch
  let capturedUrl = ''
  let capturedBody: Record<string, unknown> = {}
  globalThis.fetch = (async (input, init) => {
    capturedUrl = String(input)
    capturedBody = JSON.parse(String(init?.body)) as Record<string, unknown>
    return new Response(JSON.stringify({ sent: true }), { status: 200 })
  }) as typeof fetch

  try {
    const response = createResponse()
    await passwordlessStartHandler(
      request({
        method: 'POST',
        body: { email: ' Moe@Babanuj.com ' },
      }),
      response,
    )

    assert.equal(response.captured.statusCode, 200)
    assert.equal(capturedUrl, 'https://worldcup2026.us.auth0.com/passwordless/start')
    assert.equal(capturedBody.connection, 'email')
    assert.equal(capturedBody.email, 'moe@babanuj.com')
    assert.equal(capturedBody.send, 'code')
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('passwordless start reports missing Auth0 email connection cleanly', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = (async () =>
    new Response(
      JSON.stringify({
        error: 'bad.connection',
        error_description: 'Connection does not exist',
      }),
      { status: 400 },
    )) as typeof fetch

  try {
    const response = createResponse()
    await passwordlessStartHandler(
      request({
        method: 'POST',
        body: { email: 'moe@babanuj.com' },
      }),
      response,
    )

    const serialized = JSON.stringify(response.captured.body)
    assert.equal(response.captured.statusCode, 503)
    assert.match(serialized, /auth_provider_not_ready/)
    assert.doesNotMatch(serialized, /moe@babanuj.com/)
    assert.doesNotMatch(serialized, /Connection does not exist/)
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('nested passwordless start route matches the frontend path', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = (async () =>
    new Response(JSON.stringify({ sent: true }), { status: 200 })) as typeof fetch

  try {
    const response = createResponse()
    await nestedPasswordlessStartHandler(
      request({
        method: 'POST',
        body: { email: 'moe@babanuj.com' },
      }),
      response,
    )

    assert.equal(response.captured.statusCode, 200)
    assert.deepEqual(response.captured.body, { sent: true })
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('passwordless start reports Auth0 delivery failures without leaking details', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = (async () =>
    new Response(
      JSON.stringify({
        error: 'auth0_error',
        error_description:
          'Failed Sending Notification: 550 5.1.8 Sender address rejected for moe@babanuj.com',
      }),
      { status: 500 },
    )) as typeof fetch

  try {
    const response = createResponse()
    await passwordlessStartHandler(
      request({
        method: 'POST',
        body: { email: 'moe@babanuj.com' },
      }),
      response,
    )

    const serialized = JSON.stringify(response.captured.body)
    assert.equal(response.captured.statusCode, 502)
    assert.match(serialized, /auth_email_delivery_failed/)
    assert.doesNotMatch(serialized, /moe@babanuj.com/)
    assert.doesNotMatch(serialized, /550 5\.1\.8/)
    assert.doesNotMatch(serialized, /Sender address rejected/)
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('passwordless start reports Auth0 rate limits clearly', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = (async () =>
    new Response(
      JSON.stringify({
        error: 'too_many_attempts',
        error_description: 'Too many attempts.',
      }),
      { status: 429 },
    )) as typeof fetch

  try {
    const response = createResponse()
    await passwordlessStartHandler(
      request({
        method: 'POST',
        body: { email: 'moe@babanuj.com' },
      }),
      response,
    )

    const serialized = JSON.stringify(response.captured.body)
    assert.equal(response.captured.statusCode, 429)
    assert.match(serialized, /auth_rate_limited/)
    assert.doesNotMatch(serialized, /moe@babanuj.com/)
  } finally {
    globalThis.fetch = originalFetch
  }
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
  assert.equal(Array.isArray(secureCookie), true)
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

test('app session cookie contains only a signed Auth0 subject', () => {
  const session = createAppSession('auth0|user-123', 1_800_000_000)
  const verified = verifyAppSession(session)

  assert.equal(verified?.sub, 'auth0|user-123')
  assert.doesNotMatch(session, /email/i)
  assert.equal(verifyAppSession(`${session}tampered`), null)
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
