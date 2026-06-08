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
