import type { ResultRow } from '../../db/types.js'
import { fetchResults, getLiveResultsProvider } from './live-results.js'
import type { NormalizedResult } from './live-results.js'
import { loadTournamentData, type TournamentMatch } from './tournament-data.js'

export type CachedResult = {
  matchId: string
  homeScore: number | null
  awayScore: number | null
  winner: 'home' | 'away' | null
  status: string
  finishedAt: string | null
  source: string
  updatedAt: string
}

export type ResultIngestSummary = {
  provider: string
  fetched: number
  cached: number
  skipped: boolean
  activeMatchIds: string[]
}

function isoStringFromDatabase(value: string | Date | null): string | null {
  if (!value) return null
  return value instanceof Date ? value.toISOString() : value
}

function mapResultRow(row: ResultRow): CachedResult {
  return {
    matchId: row.match_id,
    homeScore: row.home_score,
    awayScore: row.away_score,
    winner: row.winner,
    status: row.status,
    finishedAt: isoStringFromDatabase(row.finished_at),
    source: row.source,
    updatedAt: isoStringFromDatabase(row.updated_at) ?? new Date().toISOString(),
  }
}

function activeMatchIds(matches: TournamentMatch[], now: Date): string[] {
  return matches
    .filter((match) => {
      const kickoff = new Date(match.kickoffAt)
      const windowEnd = new Date(kickoff.getTime() + 150 * 60_000)
      return now >= kickoff && now <= windowEnd
    })
    .map((match) => match.id)
}

export async function loadCachedResults(): Promise<CachedResult[]> {
  if (!process.env.PRIMARY_DB_CONNECTION_STRING) return []
  const { sql } = await import('./db.js')
  const rows = (await sql.query(
    'select * from results order by match_id asc',
    [],
  )) as ResultRow[]

  return rows.map(mapResultRow)
}

export async function upsertResults(results: NormalizedResult[]): Promise<number> {
  if (!process.env.PRIMARY_DB_CONNECTION_STRING) return 0
  const { sql } = await import('./db.js')
  for (const result of results) {
    await sql.query(
      `
        insert into results (
          match_id,
          home_score,
          away_score,
          winner,
          status,
          finished_at,
          source,
          updated_at
        )
        values ($1, $2, $3, $4, $5, $6::timestamptz, $7, now())
        on conflict (match_id) do update
          set home_score = excluded.home_score,
              away_score = excluded.away_score,
              winner = excluded.winner,
              status = excluded.status,
              finished_at = excluded.finished_at,
              source = excluded.source,
              updated_at = now()
      `,
      [
        result.matchId,
        result.homeScore,
        result.awayScore,
        result.winner,
        result.status,
        result.finishedAt,
        result.source,
      ],
    )
  }

  return results.length
}

export async function pollAndCacheResults(now = new Date()): Promise<ResultIngestSummary> {
  const data = await loadTournamentData()
  const activeIds = activeMatchIds(data.matches, now)

  if (activeIds.length === 0 || !process.env.PRIMARY_DB_CONNECTION_STRING) {
    return {
      provider: getLiveResultsProvider(),
      fetched: 0,
      cached: 0,
      skipped: true,
      activeMatchIds: [],
    }
  }

  const fetched = await fetchResults()
  const activeSet = new Set(activeIds)
  const relevant = fetched.filter((result) => activeSet.has(result.matchId))
  const cached = await upsertResults(relevant)

  return {
    provider: getLiveResultsProvider(),
    fetched: fetched.length,
    cached,
    skipped: false,
    activeMatchIds: activeIds,
  }
}

export async function refreshFixtureCache(): Promise<{
  groups: number
  teams: number
  matches: number
  fallback: boolean
}> {
  const data = await loadTournamentData()
  return {
    groups: data.groups.length,
    teams: data.teams.length,
    matches: data.matches.length,
    fallback: data.source.fallback,
  }
}
