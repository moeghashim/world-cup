import test from 'node:test'
import assert from 'node:assert/strict'
import { HttpError } from '../api/_lib/http.js'

process.env.PRIMARY_DB_CONNECTION_STRING ||= 'postgres://user:pass@localhost/db'

const {
  normalizeHostName,
  normalizeHostSlug,
  normalizeJoinCode,
  shapeHostForPublicApi,
  slugifyHostName,
} = await import('../api/_lib/hosts.js')
const accountMigration = await import('../src/floodlights/lib/accountMigration.js')

test('host slugs and codes normalize to shareable public identifiers', () => {
  assert.equal(slugifyHostName('  Moe’s Match Cafe 2026! '), 'moes-match-cafe-2026')
  assert.equal(normalizeHostSlug('/h/moes-match-cafe-2026?join=ABC123'), 'moes-match-cafe-2026')
  assert.equal(normalizeJoinCode(' ab-12 c3 '), 'AB12C3')
  assert.equal(normalizeHostName('  Match   Night  '), 'Match Night')

  assert.throws(() => normalizeHostName('x'), HttpError)
  assert.throws(() => normalizeHostSlug('bad slug!'), HttpError)
  assert.throws(() => normalizeJoinCode('abc'), HttpError)
})

test('public host response keeps member data handle-only', () => {
  const publicHost = shapeHostForPublicApi({
    id: 'host-1',
    name: 'Match Night',
    slug: 'match-night',
    code: 'AB12C3',
    publicPath: '/h/match-night',
    joinPath: '/h/match-night?join=AB12C3',
    memberCount: 2,
    mostPickedChampion: 'ARG',
    matchConsensus: [
      { matchId: 'match-1', pick: 'home', count: 2 },
    ],
    members: [
      {
        handle: 'moe2026',
        champion: 'ARG',
        points: 0,
        joinedAt: '2026-06-08T00:00:00.000Z',
      },
      {
        handle: 'guest-host',
        champion: null,
        points: 0,
        joinedAt: '2026-06-08T00:10:00.000Z',
      },
    ],
  })

  const serialized = JSON.stringify(publicHost)

  assert.equal(publicHost.members[0].handle, 'moe2026')
  assert.equal(publicHost.members[0].points, 0)
  assert.doesNotMatch(serialized, /email/i)
  assert.doesNotMatch(serialized, /address/i)
  assert.doesNotMatch(serialized, /auth0/i)
  assert.doesNotMatch(serialized, /user_id/i)
})

test('home prediction migration only accepts locked prediction payloads', () => {
  assert.equal(accountMigration.hasPredictionForMigration(null), false)
  assert.equal(
    accountMigration.hasPredictionForMigration({
      matchId: 'match-1',
      homeScore: 1,
      awayScore: 0,
      locked: false,
    }),
    false,
  )
  assert.equal(
    accountMigration.hasPredictionForMigration({
      matchId: 'match-1',
      homeScore: 1,
      awayScore: 0,
      locked: true,
    }),
    true,
  )
})
