import type { BracketRow, GroupPickRow, MatchRow, ResultRow } from '../../db/types.js'
import { mapMatchRow } from './tournament-data.js'
import type { MatchStage, TournamentMatch } from './tournament-data.js'

export const GROUP_PICK_POINTS = 10
export const KNOCKOUT_POINTS = [10, 20, 40, 80, 160] as const

type JsonRecord = Record<string, unknown>

export type ScoringResult = {
  matchId: string
  homeScore: number | null
  awayScore: number | null
  winner: 'home' | 'away' | null
  status: string
}

export type ScoringBracket = {
  userId: string
  data: unknown
  locked: boolean
}

export type ScoringGroupPick = {
  userId: string
  matchId: string
  pick: string
  lockedAt: string | null
}

export type GroupScoringLine = {
  matchId: string
  pick: string
  result: string | null
  points: number
}

export type KnockoutScoringLine = {
  matchId: string
  key: string
  round: 'R32' | 'R16' | 'QF' | 'SF' | 'Final'
  pick: string | null
  winner: string | null
  points: number
}

export type StandingBreakdown = {
  group: {
    points: number
    correct: number
    total: number
    matches: GroupScoringLine[]
  }
  knockout: {
    points: number
    correct: number
    total: number
    matches: KnockoutScoringLine[]
  }
  predictions: {
    points: 0
    scored: false
  }
}

export type ComputedStanding = {
  userId: string
  points: number
  breakdown: StandingBreakdown
}

type ScoringInput = {
  matches: TournamentMatch[]
  results: ScoringResult[]
  brackets: ScoringBracket[]
  groupPicks: ScoringGroupPick[]
}

const ROUND_LABELS: KnockoutScoringLine['round'][] = [
  'R32',
  'R16',
  'QF',
  'SF',
  'Final',
]

const STAGE_ROUND: Partial<Record<MatchStage, number>> = {
  round_of_32: 0,
  round_of_16: 1,
  quarter_final: 2,
  semi_final: 3,
  final: 4,
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function dataRecord(value: unknown): JsonRecord | null {
  if (isRecord(value)) return value
  if (typeof value !== 'string' || !value.trim()) return null

  try {
    const parsed = JSON.parse(value) as unknown
    return isRecord(parsed) ? parsed : null
  } catch {
    return null
  }
}

function koFromData(data: unknown): JsonRecord {
  const record = dataRecord(data)
  return isRecord(record?.ko) ? record.ko : {}
}

function stringFromRecord(record: JsonRecord, key: string): string | null {
  const value = record[key]
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function finishedResultByMatch(results: ScoringResult[]): Map<string, ScoringResult> {
  return new Map(
    results
      .filter(
        (result) =>
          result.status === 'finished' &&
          result.homeScore !== null &&
          result.awayScore !== null,
      )
      .map((result) => [result.matchId, result]),
  )
}

function actualOutcome(
  match: TournamentMatch,
  result: ScoringResult | undefined,
): string | null {
  if (!result || result.homeScore === null || result.awayScore === null) return null
  if (result.homeScore === result.awayScore) return 'draw'
  return result.homeScore > result.awayScore
    ? match.homeTeamCode ?? 'home'
    : match.awayTeamCode ?? 'away'
}

function pickOutcome(match: TournamentMatch, pick: string): string | null {
  switch (pick) {
    case 'a':
    case 'home':
      return match.homeTeamCode ?? 'home'
    case 'b':
    case 'away':
      return match.awayTeamCode ?? 'away'
    case 'd':
    case 'draw':
      return 'draw'
    default:
      return pick
  }
}

function actualWinner(
  match: TournamentMatch,
  result: ScoringResult | undefined,
): string | null {
  if (!result) return null
  if (result.winner === 'home') return match.homeTeamCode
  if (result.winner === 'away') return match.awayTeamCode
  if (result.homeScore === null || result.awayScore === null) return null
  if (result.homeScore === result.awayScore) return null
  return result.homeScore > result.awayScore
    ? match.homeTeamCode
    : match.awayTeamCode
}

function knockoutMatches(matches: TournamentMatch[]): KnockoutScoringLine[] {
  const byStage = new Map<number, TournamentMatch[]>()
  for (const match of matches) {
    const round = STAGE_ROUND[match.stage]
    if (round === undefined) continue
    const stageMatches = byStage.get(round) ?? []
    stageMatches.push(match)
    byStage.set(round, stageMatches)
  }

  return [...byStage.entries()].flatMap(([round, stageMatches]) =>
    stageMatches
      .sort((a, b) => a.matchNumber - b.matchNumber)
      .map((match, index) => ({
        matchId: match.id,
        key: `r${round}m${index}`,
        round: ROUND_LABELS[round],
        pick: null,
        winner: null,
        points: 0,
      })),
  )
}

function emptyBreakdown(): StandingBreakdown {
  return {
    group: {
      points: 0,
      correct: 0,
      total: 0,
      matches: [],
    },
    knockout: {
      points: 0,
      correct: 0,
      total: 0,
      matches: [],
    },
    predictions: {
      points: 0,
      scored: false,
    },
  }
}

export function computeStandings(input: ScoringInput): ComputedStanding[] {
  const finishedResults = finishedResultByMatch(input.results)
  const matches = new Map(input.matches.map((match) => [match.id, match]))
  const userIds = new Set<string>()
  for (const bracket of input.brackets) if (bracket.locked) userIds.add(bracket.userId)
  for (const pick of input.groupPicks) if (pick.lockedAt) userIds.add(pick.userId)

  const brackets = new Map(
    input.brackets
      .filter((bracket) => bracket.locked)
      .map((bracket) => [bracket.userId, bracket]),
  )
  const groupPicksByUser = new Map<string, ScoringGroupPick[]>()
  for (const pick of input.groupPicks) {
    if (!pick.lockedAt) continue
    const userPicks = groupPicksByUser.get(pick.userId) ?? []
    userPicks.push(pick)
    groupPicksByUser.set(pick.userId, userPicks)
  }
  const koSchedule = knockoutMatches(input.matches)

  return [...userIds].sort().map((userId) => {
    const breakdown = emptyBreakdown()

    for (const pick of groupPicksByUser.get(userId) ?? []) {
      const match = matches.get(pick.matchId)
      const result = match ? finishedResults.get(match.id) : undefined
      const actual = match ? actualOutcome(match, result) : null
      const selected = match ? pickOutcome(match, pick.pick) : null
      const points = actual && selected === actual ? GROUP_PICK_POINTS : 0

      breakdown.group.matches.push({
        matchId: pick.matchId,
        pick: pick.pick,
        result: actual,
        points,
      })
      breakdown.group.points += points
      breakdown.group.correct += points > 0 ? 1 : 0
      breakdown.group.total += actual ? 1 : 0
    }

    const bracket = brackets.get(userId)
    const ko = bracket ? koFromData(bracket.data) : {}
    for (const scheduled of koSchedule) {
      const match = matches.get(scheduled.matchId)
      const result = match ? finishedResults.get(match.id) : undefined
      const winner = match ? actualWinner(match, result) : null
      const roundIndex = Number(scheduled.key.charAt(1))
      const pick = stringFromRecord(ko, scheduled.key)
      const points =
        winner && pick === winner ? KNOCKOUT_POINTS[roundIndex] ?? 0 : 0

      breakdown.knockout.matches.push({
        ...scheduled,
        pick,
        winner,
        points,
      })
      breakdown.knockout.points += points
      breakdown.knockout.correct += points > 0 ? 1 : 0
      breakdown.knockout.total += winner ? 1 : 0
    }

    return {
      userId,
      points: breakdown.group.points + breakdown.knockout.points,
      breakdown,
    }
  })
}

function mapResultRow(row: ResultRow): ScoringResult {
  return {
    matchId: row.match_id,
    homeScore: row.home_score,
    awayScore: row.away_score,
    winner: row.winner,
    status: row.status,
  }
}

function mapBracketRow(row: BracketRow): ScoringBracket {
  return {
    userId: row.user_id,
    data: row.data,
    locked: row.locked,
  }
}

function mapGroupPickRow(row: GroupPickRow): ScoringGroupPick {
  return {
    userId: row.user_id,
    matchId: row.match_id,
    pick: row.pick,
    lockedAt: row.locked_at,
  }
}

export async function computeStandingsFromDatabase(): Promise<ComputedStanding[]> {
  const { sql } = await import('./db.js')
  const [matchRows, resultRows, bracketRows, groupPickRows] = await Promise.all([
    sql.query('select * from matches order by match_number asc', []) as unknown as Promise<MatchRow[]>,
    sql.query('select * from results order by match_id asc', []) as unknown as Promise<ResultRow[]>,
    sql.query('select * from brackets where locked = true', []) as unknown as Promise<BracketRow[]>,
    sql.query('select * from group_picks where locked_at is not null', []) as unknown as Promise<GroupPickRow[]>,
  ])

  return computeStandings({
    matches: matchRows.map(mapMatchRow),
    results: resultRows.map(mapResultRow),
    brackets: bracketRows.map(mapBracketRow),
    groupPicks: groupPickRows.map(mapGroupPickRow),
  })
}

export async function persistStandings(standings: ComputedStanding[]): Promise<number> {
  const { sql } = await import('./db.js')
  for (const standing of standings) {
    await sql.query(
      `
        insert into standings (user_id, points, breakdown, updated_at)
        values ($1, $2, $3::jsonb, now())
        on conflict (user_id) do update
          set points = excluded.points,
              breakdown = excluded.breakdown,
              updated_at = now()
      `,
      [
        standing.userId,
        standing.points,
        JSON.stringify(standing.breakdown),
      ],
    )
  }

  return standings.length
}

export async function scoreAndPersistStandings(): Promise<{
  scored: number
  totalPoints: number
}> {
  const standings = await computeStandingsFromDatabase()
  await persistStandings(standings)

  return {
    scored: standings.length,
    totalPoints: standings.reduce((total, standing) => total + standing.points, 0),
  }
}
