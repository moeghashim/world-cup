import test from 'node:test'
import assert from 'node:assert/strict'
import type { ApiResponse } from '../api/_lib/http.js'

process.env.NODE_ENV = 'test'
delete process.env.PRIMARY_DB_CONNECTION_STRING

const { HttpError } = await import('../api/_lib/http.js')
const {
  assertBracketOpen,
  assertMatchesOpen,
} = await import('../api/_lib/pick-locks.js')
const { default: fixturesHandler } = await import('../api/data/fixtures.js')
const {
  GROUPS,
  GROUP_KEYS,
  MATCHES,
  R32_TEMPLATE,
  TEAMS,
} = await import('../src/floodlights/data.js')
const {
  kickoffToUtcIso,
  normalizeOpenfootballData,
} = await import('../scripts/tournament-normalize.js')

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

function isPickLocked(error: unknown): boolean {
  return error instanceof HttpError && error.code === 'pick_locked'
}

test('normalizes the vendored openfootball tournament snapshot', async () => {
  const tournament = await normalizeOpenfootballData()

  assert.equal(tournament.counts.totalFixtures, 104)
  assert.equal(tournament.counts.groupFixtures, 72)
  assert.equal(tournament.counts.groups, 12)
  assert.equal(tournament.counts.teams, 48)
  assert.equal(
    kickoffToUtcIso('2026-06-11', '13:00 UTC-6'),
    '2026-06-11T19:00:00.000Z',
  )
  assert.deepEqual(
    tournament.groups.map((group) => group.code),
    GROUP_KEYS,
  )
})

test('Floodlights real data constants are internally consistent', () => {
  const teamCodes = new Set(Object.keys(TEAMS))
  const groupedTeams = new Set(Object.values(GROUPS).flat())

  assert.equal(teamCodes.size, 48)
  assert.equal(GROUP_KEYS.length, 12)
  assert.equal(groupedTeams.size, 48)
  assert.deepEqual(
    [...groupedTeams].filter((code) => !teamCodes.has(code)),
    [],
  )
  assert.equal(R32_TEMPLATE.length, 16)
  assert.deepEqual(
    R32_TEMPLATE.flat()
      .filter((ref) => ref.p === 'T')
      .map((ref) => ref.i),
    [0, 1, 2, 3, 4, 5, 6, 7],
  )
  assert.deepEqual(
    MATCHES.map((match) => `${match.id}:${match.a}-${match.b}`),
    ['match-1:MEX-RSA', 'match-2:KOR-CZE', 'match-7:CAN-BIH'],
  )
})

test('fixtures API returns our server-side fallback when Neon is unavailable', async () => {
  const response = createResponse()
  await fixturesHandler({ method: 'GET', headers: {} }, response)

  const body = response.captured.body as {
    groups: unknown[]
    teams: unknown[]
    matches: unknown[]
    locks: { bracketLocksAt: string; firstMatchId: string }
    source: { fallback: boolean }
  }

  assert.equal(response.captured.statusCode, 200)
  assert.equal(body.groups.length, 12)
  assert.equal(body.teams.length, 48)
  assert.equal(body.matches.length, 104)
  assert.equal(body.locks.bracketLocksAt, '2026-06-11T19:00:00.000Z')
  assert.equal(body.locks.firstMatchId, 'match-1')
  assert.equal(body.source.fallback, true)
})

test('match locks are per-match while bracket locks at first kickoff', async () => {
  const beforeFirstKickoff = {
    headers: { 'x-worldcup-now': '2026-06-11T18:59:59.000Z' },
  }
  const atFirstKickoff = {
    headers: { 'x-worldcup-now': '2026-06-11T19:00:00.000Z' },
  }
  const betweenFirstAndSecondKickoff = {
    headers: { 'x-worldcup-now': '2026-06-11T20:00:00.000Z' },
  }

  await assertMatchesOpen(['match-1'], beforeFirstKickoff)
  await assertBracketOpen(beforeFirstKickoff)
  await assertMatchesOpen(['match-2'], betweenFirstAndSecondKickoff)

  await assert.rejects(
    () => assertMatchesOpen(['match-1'], atFirstKickoff),
    isPickLocked,
  )
  await assert.rejects(
    () => assertBracketOpen(atFirstKickoff),
    isPickLocked,
  )
})

test('group picks reject unknown or knockout match IDs', async () => {
  const beforeFirstKickoff = {
    headers: { 'x-worldcup-now': '2026-06-11T18:59:59.000Z' },
  }

  await assert.rejects(
    () => assertMatchesOpen(['missing-match'], beforeFirstKickoff),
    /Unknown match ID/,
  )
  await assert.rejects(
    () => assertMatchesOpen(['match-73'], beforeFirstKickoff, { groupOnly: true }),
    /Group picks can only use group-stage matches/,
  )
})
