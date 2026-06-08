export type UserRow = {
  id: string
  auth0_user_id: string
  workos_user_id: string | null
  email: string
  handle: string | null
  country_at_signup: string | null
  created_at: string
  updated_at: string
}

export type BracketRow = {
  user_id: string
  data: unknown
  locked: boolean
  updated_at: string
}

export type GroupPickRow = {
  user_id: string
  match_id: string
  pick: string
  locked_at: string | null
  updated_at: string
}

export type PredictionRow = {
  user_id: string
  match_id: string
  home_score: number
  away_score: number
  locked_at: string | null
  updated_at: string
}

export type TournamentGroupRow = {
  code: string
  name: string
  sort_order: number
  source: string
  updated_at: string
}

export type TeamRow = {
  code: string
  name: string
  slug: string
  group_code: string
  group_name: string
  group_seed: number
  colors: unknown
  localized_names: unknown
  source: string
  updated_at: string
}

export type MatchRow = {
  id: string
  match_number: number
  stage: string
  round: string
  group_code: string | null
  group_name: string | null
  home_team_code: string | null
  away_team_code: string | null
  home_team_name: string
  away_team_name: string
  home_placeholder: string | null
  away_placeholder: string | null
  kickoff_at: string
  kickoff_local_date: string
  kickoff_local_time: string
  kickoff_timezone: string
  venue: string
  status: string
  source: unknown
  updated_at: string
}

export type HostRow = {
  id: string
  slug: string
  join_code: string
  name: string
  owner_user_id: string
  created_at: string
  updated_at: string
}

export type HostMemberRow = {
  host_id: string
  user_id: string
  joined_at: string
}
