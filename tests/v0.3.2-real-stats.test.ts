import test from 'node:test'
import assert from 'node:assert/strict'
import type { ApiRequest, ApiResponse } from '../api/_lib/http.js'

process.env.NODE_ENV = 'test'
delete process.env.PRIMARY_DB_CONNECTION_STRING

const {
  buildCommunityStats,
  emptyCommunityStats,
} = await import('../api/_lib/community-stats.js')
const { default: communityHandler } = await import('../api/data/community.js')
const { formatStatNumber, pctForPick } = await import(
  '../src/floodlights/lib/communityStats.js'
)

type CapturedResponse = {
  statusCode: number
  body: unknown
  headers: Record<string, string | string[]>
}

type BracketData = {
  ko: Record<string, string>
}

function bracket(ko: Record<string, string>): BracketData {
  return { ko }
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
    redirect() {},
    setHeader(name: string, value: string | string[]) {
      captured.headers[name.toLowerCase()] = value
    },
  }
}

test('community stats aggregates locked players, champions, R32 consensus, and hosts', () => {
  const stats = buildCommunityStats({
    generatedAt: '2026-06-08T12:00:00.000Z',
    lockedPlayers: [
      { user_id: 'user-1' },
      { user_id: 'user-2' },
      { user_id: 'user-2' },
      { user_id: 'user-3' },
      { user_id: 'user-4' },
    ],
    hostMembers: [
      { user_id: 'user-2' },
      { user_id: 'user-4' },
      { user_id: 'user-4' },
    ],
    lockedBrackets: [
      {
        user_id: 'user-1',
        handle: 'alpha',
        data: bracket({
          r0m0: 'ARG',
          r0m1: 'BRA',
          r2m0: 'ARG',
          r2m1: 'BRA',
          r2m2: 'FRA',
          r2m3: 'ESP',
          r4m0: 'ARG',
        }),
        updated_at: '2026-06-08T11:00:00.000Z',
      },
      {
        user_id: 'user-2',
        handle: 'bravo',
        data: bracket({
          r0m0: 'ARG',
          r0m1: 'FRA',
          r2m0: 'ARG',
          r2m1: 'FRA',
          r2m2: 'ENG',
          r2m3: 'BRA',
          r4m0: 'ARG',
        }),
      },
      {
        user_id: 'user-3',
        handle: null,
        data: JSON.stringify(
          bracket({
            r0m0: 'BRA',
            r0m1: 'BRA',
            r2m0: 'BRA',
            r2m1: 'FRA',
            r2m2: 'ESP',
            r2m3: 'GER',
            r4m0: 'BRA',
          }),
        ),
      },
      {
        user_id: 'user-4',
        handle: '@charlie',
        data: bracket({
          r0m0: 'ARG',
          r0m1: 'FRA',
          r2m0: 'FRA',
          r2m1: 'ARG',
          r2m2: 'ESP',
          r2m3: 'POR',
          r4m0: 'FRA',
        }),
      },
    ],
  })

  assert.equal(stats.players, 4)
  assert.equal(stats.bracketsLocked, 4)
  assert.equal(stats.hostsJoined, 2)
  assert.deepEqual(stats.championDistribution, [
    { code: 'ARG', count: 2, pct: 50 },
    { code: 'BRA', count: 1, pct: 25 },
    { code: 'FRA', count: 1, pct: 25 },
  ])
  assert.deepEqual(stats.r32Consensus[0], {
    matchIndex: 0,
    favourite: 'ARG',
    pct: 75,
    total: 4,
    picks: [
      { code: 'ARG', count: 3, pct: 75 },
      { code: 'BRA', count: 1, pct: 25 },
    ],
  })
  assert.equal(stats.r32Consensus[1].favourite, 'BRA')
  assert.equal(stats.r32Consensus[1].pct, 50)
  assert.equal(pctForPick(stats.r32Consensus[1], 'FRA'), 50)
  assert.deepEqual(
    stats.communityBrackets.map((sample) => sample.handle),
    ['@alpha', '@bravo', '@charlie'],
  )
  assert.deepEqual(stats.communityBrackets[0].semis, ['ARG', 'BRA', 'FRA', 'ESP'])
})

test('community stats keeps zero data honest without NaN or division by zero', () => {
  const stats = emptyCommunityStats()
  const serialized = JSON.stringify(stats)

  assert.equal(stats.players, 0)
  assert.equal(stats.bracketsLocked, 0)
  assert.equal(stats.hostsJoined, 0)
  assert.deepEqual(stats.championDistribution, [])
  assert.equal(stats.r32Consensus.length, 16)
  assert.equal(stats.r32Consensus[0].favourite, null)
  assert.equal(stats.r32Consensus[0].pct, 0)
  assert.equal(stats.r32Consensus[0].total, 0)
  assert.doesNotMatch(serialized, /NaN|Infinity/)
  assert.equal(formatStatNumber('en', 0), '0')
})

test('community stats response remains handle-only and does not leak PII', () => {
  const stats = buildCommunityStats({
    lockedPlayers: [{ user_id: 'secret-user-id' }],
    hostMembers: [{ user_id: 'secret-user-id' }],
    lockedBrackets: [
      {
        user_id: 'secret-user-id',
        handle: 'privacy-check',
        data: {
          email: 'moe@example.com',
          auth0_user_id: 'auth0|secret',
          ko: {
            r0m0: 'ARG',
            r4m0: 'ARG',
          },
        },
      },
    ],
  })
  const serialized = JSON.stringify(stats)

  assert.match(serialized, /privacy-check/)
  assert.doesNotMatch(serialized, /moe@example\.com/)
  assert.doesNotMatch(serialized, /email/i)
  assert.doesNotMatch(serialized, /auth0/i)
  assert.doesNotMatch(serialized, /user_id/i)
  assert.doesNotMatch(serialized, /secret-user-id/)
})

test('community stats API serves cached empty aggregates without a database', async () => {
  const response = createResponse()
  await communityHandler({ method: 'GET', headers: {} } as ApiRequest, response)
  const body = response.captured.body as {
    players: number
    bracketsLocked: number
    hostsJoined: number
    source: { fallback: boolean }
  }

  assert.equal(response.captured.statusCode, 200)
  assert.equal(response.captured.headers['cache-control'], 's-maxage=60, stale-while-revalidate=300')
  assert.equal(body.players, 0)
  assert.equal(body.bracketsLocked, 0)
  assert.equal(body.hostsJoined, 0)
  assert.equal(body.source.fallback, true)
})
