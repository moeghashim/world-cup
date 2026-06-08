import type { StandingRow } from '../../db/types.js'
import {
  getLiveResultsProvider,
  liveResultsAttribution,
} from './live-results.js'

type JsonRecord = Record<string, unknown>

export type StandingEntry = {
  rank: number
  handle: string
  points: number
  champion: string | null
  updatedAt: string
}

export type StandingsResponse = {
  standings: StandingEntry[]
  me: StandingEntry | null
  source: {
    fallback: boolean
    provider: string
    attribution: string | null
    generatedAt: string
  }
}

type StandingQueryRow = {
  rank?: number | string | null
  handle: string | null
  points: number
  bracket_data: unknown
  updated_at: string
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

function championFromBracket(data: unknown): string | null {
  const record = dataRecord(data)
  if (!record || !isRecord(record.ko)) return null
  const champion = record.ko.r4m0
  return typeof champion === 'string' && champion.trim() ? champion : null
}

function isoStringFromDatabase(value: string | Date): string {
  return value instanceof Date ? value.toISOString() : value
}

function shapeRows(
  rows: StandingQueryRow[],
  startRank = 1,
): StandingEntry[] {
  return rows
    .filter((row) => typeof row.handle === 'string' && row.handle.trim())
    .map((row, index) => ({
      rank: Number(row.rank ?? startRank + index),
      handle: row.handle as string,
      points: Number(row.points),
      champion: championFromBracket(row.bracket_data),
      updatedAt: isoStringFromDatabase(row.updated_at),
    }))
}

function emptyStandings(): StandingsResponse {
  const provider = getLiveResultsProvider()
  return {
    standings: [],
    me: null,
    source: {
      fallback: true,
      provider,
      attribution: liveResultsAttribution(provider),
      generatedAt: new Date().toISOString(),
    },
  }
}

export async function loadStandings(userId?: string): Promise<StandingsResponse> {
  if (!process.env.PRIMARY_DB_CONNECTION_STRING) {
    return emptyStandings()
  }

  const { sql } = await import('./db.js')
  const rows = (await sql.query(
    `
      select
        users.handle,
        standings.points,
        brackets.data as bracket_data,
        standings.updated_at::text as updated_at
      from standings
      join users on users.id = standings.user_id
      left join brackets on brackets.user_id = standings.user_id
      where users.handle is not null
      order by standings.points desc, standings.updated_at asc
      limit 100
    `,
    [],
  )) as StandingQueryRow[]

  const standings = shapeRows(rows)
  let me: StandingEntry | null = null
  if (userId) {
    const userRows = (await sql.query(
      `
        with current_user_standing as (
          select
            users.handle,
            coalesce(standings.points, 0)::int as points,
            brackets.data as bracket_data,
            coalesce(standings.updated_at, users.updated_at)::text as updated_at
          from users
          left join standings on standings.user_id = users.id
          left join brackets on brackets.user_id = users.id
          where users.id = $1
          limit 1
        )
        select
          current_user_standing.*,
          (
            select count(*)::int + 1
            from standings
            where standings.points > current_user_standing.points
          ) as rank
        from current_user_standing
      `,
      [userId],
    )) as StandingQueryRow[]
    me = shapeRows(userRows)[0] ?? null
  }

  const provider = getLiveResultsProvider()
  return {
    standings,
    me,
    source: {
      fallback: false,
      provider,
      attribution: liveResultsAttribution(provider),
      generatedAt: new Date().toISOString(),
    },
  }
}

export function standingFromRow(row: StandingRow): {
  points: number
  breakdown: unknown
} {
  return {
    points: row.points,
    breakdown: row.breakdown,
  }
}
