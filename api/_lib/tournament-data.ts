import type {
  MatchRow,
  TeamRow,
  TournamentGroupRow,
} from '../../db/types.js'

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
  source: string
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
    kickoffAt: row.kickoff_at,
    kickoffLocalDate: row.kickoff_local_date,
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
