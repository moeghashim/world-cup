import test from 'node:test'
import assert from 'node:assert/strict'

const {
  normalize,
  normalizeGroupRank,
  rankGroupTeam,
} = await import('../src/floodlights/lib/bracket.js')

test('saved malformed group ranks are sanitized before rendering', () => {
  const state = normalize({
    groups: {
      C: ['_', '', 'not-a-team', 'BRA'],
    },
    thirds: ['C'],
    ko: {},
    locked: false,
  })

  assert.deepEqual(state.groups.C, ['BRA'])
  assert.deepEqual(state.thirds, [])
})

test('clicking a fourth-place team replaces the wildcard slot', () => {
  const groups = {
    C: ['MAR', 'HAI', 'SCO'],
  }

  assert.deepEqual(rankGroupTeam(groups, 'C', 'BRA'), ['MAR', 'HAI', 'BRA'])
})

test('group ranking still supports normal append and truncate behavior', () => {
  assert.deepEqual(rankGroupTeam({}, 'C', 'BRA'), ['BRA'])
  assert.deepEqual(rankGroupTeam({ C: ['BRA', 'MAR'] }, 'C', 'HAI'), ['BRA', 'MAR', 'HAI'])
  assert.deepEqual(rankGroupTeam({ C: ['BRA', 'MAR', 'HAI'] }, 'C', 'MAR'), ['BRA'])
  assert.equal(rankGroupTeam({ C: ['BRA'] }, 'C', 'MEX'), null)
  assert.deepEqual(normalizeGroupRank('C', ['BRA', 'BRA', 'MAR', 'HAI']), ['BRA', 'MAR', 'HAI'])
})
