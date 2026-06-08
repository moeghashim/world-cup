import test from 'node:test'
import assert from 'node:assert/strict'
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { ApiRequest, ApiResponse } from '../api/_lib/http.js'
import type { MatchStage, TournamentMatch } from '../api/_lib/tournament-data.js'

process.env.NODE_ENV = 'test'
delete process.env.PRIMARY_DB_CONNECTION_STRING
delete process.env.FOOTBALL_DATA_ORG_TOKEN
delete process.env.API_FOOTBALL_KEY

const {
  GROUP_PICK_POINTS,
  KNOCKOUT_POINTS,
  computeStandings,
} = await import('../api/_lib/scoring.js')
const {
  getLiveResultsProvider,
  normalizeApiFootballResults,
  normalizeFootballDataResults,
} = await import('../api/_lib/live-results.js')
const { default: standingsHandler } = await import('../api/standings.js')
const { DICT } = await import('../src/floodlights/i18n/dictionaries.js')

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
    redirect() {},
    setHeader(name: string, value: string | string[]) {
      captured.headers[name.toLowerCase()] = value
    },
  }
}

function match(
  id: string,
  matchNumber: number,
  stage: MatchStage,
  homeTeamCode: string | null,
  awayTeamCode: string | null,
  kickoffAt = '2026-06-11T19:00:00.000Z',
): TournamentMatch {
  return {
    id,
    matchNumber,
    stage,
    round: stage,
    groupCode: stage === 'group' ? 'A' : null,
    groupName: stage === 'group' ? 'Group A' : null,
    homeTeamCode,
    awayTeamCode,
    homeTeamName: homeTeamCode ?? 'Home',
    awayTeamName: awayTeamCode ?? 'Away',
    homePlaceholder: homeTeamCode ? null : 'Home',
    awayPlaceholder: awayTeamCode ? null : 'Away',
    kickoffAt,
    kickoffLocalDate: kickoffAt.slice(0, 10),
    kickoffLocalTime: '13:00',
    kickoffTimezone: 'UTC',
    venue: 'Test Stadium',
    status: 'scheduled',
  }
}

async function readSourceFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name)
      if (entry.isDirectory()) return readSourceFiles(path)
      if (!/\.(ts|tsx|js|jsx|css|html)$/.test(entry.name)) return []
      return [await readFile(path, 'utf8')]
    }),
  )
  return files.flat()
}

test('scorer is idempotent and applies exact v0.4 scoring math only', () => {
  const matches = [
    match('match-1', 1, 'group', 'MEX', 'RSA'),
    match('match-2', 2, 'group', 'KOR', 'CZE'),
    match('match-3', 3, 'group', 'CAN', 'BIH'),
    match('match-73', 73, 'round_of_32', 'MEX', 'RSA'),
    match('match-89', 89, 'round_of_16', 'MEX', 'BRA'),
    match('match-97', 97, 'quarter_final', 'MEX', 'FRA'),
    match('match-101', 101, 'semi_final', 'MEX', 'ENG'),
    match('match-104', 104, 'final', 'MEX', 'ARG'),
  ]
  const results = [
    { matchId: 'match-1', homeScore: 2, awayScore: 0, status: 'finished' },
    { matchId: 'match-2', homeScore: 1, awayScore: 1, status: 'finished' },
    { matchId: 'match-3', homeScore: 0, awayScore: 1, status: 'finished' },
    { matchId: 'match-73', homeScore: 2, awayScore: 0, status: 'finished' },
    { matchId: 'match-89', homeScore: 1, awayScore: 0, status: 'finished' },
    { matchId: 'match-97', homeScore: 1, awayScore: 0, status: 'finished' },
    { matchId: 'match-101', homeScore: 1, awayScore: 0, status: 'finished' },
    { matchId: 'match-104', homeScore: 1, awayScore: 0, status: 'finished' },
  ]
  const input = {
    matches,
    results,
    brackets: [
      {
        userId: 'user-1',
        locked: true,
        data: {
          ko: {
            r0m0: 'MEX',
            r1m0: 'MEX',
            r2m0: 'MEX',
            r3m0: 'MEX',
            r4m0: 'MEX',
          },
        },
      },
    ],
    groupPicks: [
      { userId: 'user-1', matchId: 'match-1', pick: 'a', lockedAt: '2026-06-11T19:00:00.000Z' },
      { userId: 'user-1', matchId: 'match-2', pick: 'd', lockedAt: '2026-06-12T02:00:00.000Z' },
      { userId: 'user-1', matchId: 'match-3', pick: 'home', lockedAt: '2026-06-18T16:00:00.000Z' },
    ],
  }

  const first = computeStandings(input)
  const second = computeStandings(input)
  const standing = first[0]
  const expectedKnockout = KNOCKOUT_POINTS.reduce((total, value) => total + value, 0)
  const expectedGroup = GROUP_PICK_POINTS * 2

  assert.deepEqual(second, first)
  assert.equal(standing.points, expectedKnockout + expectedGroup)
  assert.equal(standing.breakdown.group.points, expectedGroup)
  assert.equal(standing.breakdown.knockout.points, expectedKnockout)
  assert.equal(standing.breakdown.predictions.points, 0)
  assert.equal(standing.breakdown.predictions.scored, false)
})

test('provider adapters normalize football-data and api-football payloads to the same match result', () => {
  const matches = [
    match('match-1', 1, 'group', 'MEX', 'RSA', '2026-06-11T19:00:00.000Z'),
  ]
  const footballData = normalizeFootballDataResults(
    {
      matches: [
        {
          id: 100,
          utcDate: '2026-06-11T19:00:00Z',
          status: 'FINISHED',
          homeTeam: { name: 'Mexico', tla: 'MEX' },
          awayTeam: { name: 'South Africa', tla: 'RSA' },
          score: { fullTime: { home: 2, away: 0 } },
          lastUpdated: '2026-06-11T21:00:00Z',
        },
      ],
    },
    matches,
  )
  const apiFootball = normalizeApiFootballResults(
    {
      response: [
        {
          fixture: {
            id: 200,
            date: '2026-06-11T19:00:00Z',
            status: { short: 'FT' },
          },
          teams: {
            home: { name: 'Mexico', code: 'MEX' },
            away: { name: 'South Africa', code: 'RSA' },
          },
          score: { fulltime: { home: 2, away: 0 } },
        },
      ],
    },
    matches,
  )

  assert.deepEqual(
    footballData.map(({ matchId, homeScore, awayScore, status }) => ({
      matchId,
      homeScore,
      awayScore,
      status,
    })),
    apiFootball.map(({ matchId, homeScore, awayScore, status }) => ({
      matchId,
      homeScore,
      awayScore,
      status,
    })),
  )
})

test('live results provider swaps by env with football-data as default', () => {
  delete process.env.LIVE_RESULTS_PROVIDER
  assert.equal(getLiveResultsProvider(), 'football-data')

  process.env.LIVE_RESULTS_PROVIDER = 'api-football'
  assert.equal(getLiveResultsProvider(), 'api-football')

  process.env.LIVE_RESULTS_PROVIDER = 'unknown'
  assert.equal(getLiveResultsProvider(), 'football-data')
})

test('standings API serves cached empty fallback without PII when database is unavailable', async () => {
  const response = createResponse()
  await standingsHandler({ method: 'GET', headers: {} } as ApiRequest, response)
  const serialized = JSON.stringify(response.captured.body)

  assert.equal(response.captured.statusCode, 200)
  assert.equal(response.captured.headers['cache-control'], 's-maxage=60, stale-while-revalidate=300')
  assert.doesNotMatch(serialized, /email/i)
  assert.doesNotMatch(serialized, /auth0/i)
  assert.doesNotMatch(serialized, /user_id/i)
  assert.doesNotMatch(serialized, /address/i)
})

test('client source reads only app APIs, never third-party live providers', async () => {
  const sources = (await readSourceFiles(join(process.cwd(), 'src'))).join('\n')

  assert.doesNotMatch(sources, /api\.football-data\.org/i)
  assert.doesNotMatch(sources, /football\.api-sports\.io/i)
  assert.doesNotMatch(sources, /FOOTBALL_DATA_ORG_TOKEN|API_FOOTBALL_KEY/)
})

test('new live-scoring i18n keys exist across all app languages', () => {
  const required = [
    'profile_points_h',
    'profile_points_p',
    'profile_points_rank',
    'profile_points_empty',
    'standings_attribution',
    'hosts_points_note',
  ]

  for (const lang of ['en', 'es', 'fr', 'pt', 'ar']) {
    const missing = Object.keys(DICT.en).filter((key) => !(key in DICT[lang]))
    assert.deepEqual(missing, [], `${lang} missing keys`)

    for (const key of required) {
      assert.equal(typeof DICT[lang][key], 'string', `${lang}.${key}`)
      assert.notEqual(DICT[lang][key], '', `${lang}.${key}`)
    }
  }
})
