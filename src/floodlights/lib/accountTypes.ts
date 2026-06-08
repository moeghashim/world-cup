export type BracketPayload = {
  groups: Record<string, string[]>
  thirds: string[]
  ko: Record<string, string>
  locked: boolean
}

export type GroupPicksPayload = {
  picks: Record<string, string>
  locked: boolean
}

export type PredictionPayload = {
  matchId: string
  homeScore: number
  awayScore: number
  locked: boolean
}

export type AccountUser = {
  id: string
  email: string
  handle: string | null
  countryAtSignup: string | null
}

export type SessionPayload = {
  authenticated: boolean
  needsHandle: boolean
  user: AccountUser | null
}

export type PicksPayload = {
  bracket: BracketPayload | null
  groupPicks: GroupPicksPayload | null
  predictions: PredictionPayload[]
}

export type HostSummary = {
  id: string
  name: string
  slug: string
  code: string
  publicPath: string
  joinPath: string
  memberCount: number
}

export type HostLeaderboardMember = {
  handle: string
  champion: string | null
  points: number
  joinedAt: string
}

export type HostConsensusItem = {
  matchId: string
  pick: string
  count: number
}

export type PublicHost = HostSummary & {
  members: HostLeaderboardMember[]
  mostPickedChampion: string | null
  matchConsensus: HostConsensusItem[]
}

export type ApiErrorBody = {
  error?: {
    code: string
    message: string
  }
}
