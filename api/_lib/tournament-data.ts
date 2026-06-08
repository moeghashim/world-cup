import type {
  MatchRow,
  TeamRow,
  TournamentGroupRow,
} from '../../db/types.js'
import { STATIC_TOURNAMENT_DATA } from './tournament-static.js'

export type MatchStage =
  | 'group'
  | 'round_of_32'
  | 'round_of_16'
  | 'quarter_final'
  | 'semi_final'
  | 'third_place'
  | 'final'

export type TournamentGroup = {
  code: string
  name: string
  sortOrder: number
}

export type TournamentTeam = {
  code: string
  name: string
  slug: string
  groupCode: string
  groupName: string
  groupSeed: number
  colors: Record<string, string>
  localizedNames: Record<string, string>
}

export type TournamentMatch = {
  id: string
  matchNumber: number
  stage: MatchStage
  round: string
  groupCode: string | null
  groupName: string | null
  homeTeamCode: string | null
  awayTeamCode: string | null
  homeTeamName: string
  awayTeamName: string
  homePlaceholder: string | null
  awayPlaceholder: string | null
  kickoffAt: string
  kickoffLocalDate: string
  kickoffLocalTime: string
  kickoffTimezone: string
  venue: string
  status: string
}

export type TournamentSourceMetadata = {
  url: string
  name: string
  license: string
  verifiedAt: string
  fallback: boolean
}

export type TournamentLockMetadata = {
  bracketLocksAt: string
  firstMatchId: string
}

export type TournamentDataResponse = {
  groups: TournamentGroup[]
  teams: TournamentTeam[]
  matches: TournamentMatch[]
  locks: TournamentLockMetadata
  source: TournamentSourceMetadata
}

const CACHE_TTL_MS = 60_000
const SOURCE_METADATA: Omit<TournamentSourceMetadata, 'fallback'> = {
  url: 'https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json',
  name: 'openfootball/worldcup.json',
  license: 'CC0 1.0 Universal',
  verifiedAt: '2026-06-08',
}

let cachedTournamentData:
  | {
      expiresAt: number
      data: TournamentDataResponse
    }
  | null = null

function recordFromUnknown(value: unknown): Record<string, string> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return {}
  }

  return Object.entries(value).reduce<Record<string, string>>(
    (record, [key, entry]) => {
      if (typeof entry === 'string') record[key] = entry
      return record
    },
    {},
  )
}

function normalizeStage(value: string): MatchStage {
  const stages = new Set<MatchStage>([
    'group',
    'round_of_32',
    'round_of_16',
    'quarter_final',
    'semi_final',
    'third_place',
    'final',
  ])

  if (stages.has(value as MatchStage)) {
    return value as MatchStage
  }

  return 'group'
}

function isoStringFromDatabase(value: string | Date): string {
  return value instanceof Date ? value.toISOString() : value
}

function dateStringFromDatabase(value: string | Date): string {
  return value instanceof Date ? value.toISOString().slice(0, 10) : value
}

export function mapTournamentGroupRow(
  row: TournamentGroupRow,
): TournamentGroup {
  return {
    code: row.code,
    name: row.name,
    sortOrder: row.sort_order,
  }
}

export function mapTeamRow(row: TeamRow): TournamentTeam {
  return {
    code: row.code,
    name: row.name,
    slug: row.slug,
    groupCode: row.group_code,
    groupName: row.group_name,
    groupSeed: row.group_seed,
    colors: recordFromUnknown(row.colors),
    localizedNames: recordFromUnknown(row.localized_names),
  }
}

export function mapMatchRow(row: MatchRow): TournamentMatch {
  return {
    id: row.id,
    matchNumber: row.match_number,
    stage: normalizeStage(row.stage),
    round: row.round,
    groupCode: row.group_code,
    groupName: row.group_name,
    homeTeamCode: row.home_team_code,
    awayTeamCode: row.away_team_code,
    homeTeamName: row.home_team_name,
    awayTeamName: row.away_team_name,
    homePlaceholder: row.home_placeholder,
    awayPlaceholder: row.away_placeholder,
    kickoffAt: isoStringFromDatabase(row.kickoff_at),
    kickoffLocalDate: dateStringFromDatabase(row.kickoff_local_date),
    kickoffLocalTime: row.kickoff_local_time,
    kickoffTimezone: row.kickoff_timezone,
    venue: row.venue,
    status: row.status,
  }
}

export function getTournamentLockMetadata(
  matches: TournamentMatch[],
): TournamentLockMetadata {
  const firstMatch = [...matches].sort((a, b) =>
    a.kickoffAt.localeCompare(b.kickoffAt),
  )[0]

  if (!firstMatch) {
    throw new Error('Tournament data must include at least one match.')
  }

  return {
    bracketLocksAt: firstMatch.kickoffAt,
    firstMatchId: firstMatch.id,
  }
}

async function loadTournamentDataFromDatabase():
  Promise<TournamentDataResponse | null> {
  const connectionString = process.env.PRIMARY_DB_CONNECTION_STRING
  if (!connectionString) return null

  try {
    const { neon } = await import('@neondatabase/serverless')
    const sql = neon(connectionString)
    const [groupRows, teamRows, matchRows] = await Promise.all([
      sql.query(
        'select * from tournament_groups order by sort_order asc',
        [],
      ) as unknown as Promise<TournamentGroupRow[]>,
      sql.query(
        'select * from teams order by group_code asc, group_seed asc',
        [],
      ) as unknown as Promise<TeamRow[]>,
      sql.query(
        'select * from matches order by match_number asc',
        [],
      ) as unknown as Promise<MatchRow[]>,
    ])

    if (
      groupRows.length !== 12 ||
      teamRows.length !== 48 ||
      matchRows.length !== 104
    ) {
      return null
    }

    const matches = matchRows.map(mapMatchRow)
    return {
      groups: groupRows.map(mapTournamentGroupRow),
      teams: teamRows.map(mapTeamRow),
      matches,
      locks: getTournamentLockMetadata(matches),
      source: {
        ...SOURCE_METADATA,
        fallback: false,
      },
    }
  } catch {
    return null
  }
}

export async function loadTournamentData(): Promise<TournamentDataResponse> {
  const now = Date.now()

  if (cachedTournamentData && cachedTournamentData.expiresAt > now) {
    return cachedTournamentData.data
  }

  const data = (await loadTournamentDataFromDatabase()) ?? STATIC_TOURNAMENT_DATA
  cachedTournamentData = {
    expiresAt: now + CACHE_TTL_MS,
    data,
  }

  return data
}
