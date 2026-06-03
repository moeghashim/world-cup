import {
  worldCupFixtures,
  type TournamentFixture,
} from './worldCupSchedule.js'

export function getFixtureKickoffMs(fixture: TournamentFixture) {
  return new Date(`${fixture.date}T${fixture.timeET}:00-04:00`).getTime()
}

export function getUpcomingHomepageFixtures(limit = 8, now = new Date()) {
  const sortedFixtures = [...worldCupFixtures].sort(
    (first, second) => getFixtureKickoffMs(first) - getFixtureKickoffMs(second),
  )
  const futureFixtures = sortedFixtures.filter(
    (fixture) => getFixtureKickoffMs(fixture) >= now.getTime(),
  )
  const fixturePool = futureFixtures.length ? futureFixtures : sortedFixtures

  return fixturePool.slice(0, limit)
}
