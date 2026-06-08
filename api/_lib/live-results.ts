import { loadTournamentData, type TournamentMatch } from './tournament-data.js'

export type LiveResultsProvider = 'football-data' | 'api-football'

export type NormalizedResultStatus =
  | 'scheduled'
  | 'live'
  | 'finished'
  | 'postponed'
  | 'cancelled'
  | 'unknown'

export type NormalizedResult = {
  matchId: string
  homeScore: number | null
  awayScore: number | null
  status: NormalizedResultStatus
  finishedAt: string | null
  source: LiveResultsProvider
  providerMatchId: string | null
  updatedAt: string
}

type ProviderMatchCandidate = {
  providerMatchId: string | null
  utcDate: string | null
  homeName: string | null
  awayName: string | null
  homeCode: string | null
  awayCode: string | null
}

type FootballDataMatch = {
  id?: number | string
  utcDate?: string
  status?: string
  homeTeam?: { name?: string | null; tla?: string | null }
  awayTeam?: { name?: string | null; tla?: string | null }
  score?: {
    winner?: string | null
    fullTime?: { home?: number | null; away?: number | null }
  }
  lastUpdated?: string
}

type FootballDataPayload = {
  matches?: FootballDataMatch[]
}

type ApiFootballFixture = {
  fixture?: {
    id?: number | string
    date?: string
    status?: { short?: string | null; long?: string | null }
  }
  teams?: {
    home?: { name?: string | null; code?: string | null }
    away?: { name?: string | null; code?: string | null }
  }
  goals?: { home?: number | null; away?: number | null }
  score?: {
    fulltime?: { home?: number | null; away?: number | null }
    extratime?: { home?: number | null; away?: number | null }
    penalty?: { home?: number | null; away?: number | null }
  }
}

type ApiFootballPayload = {
  response?: ApiFootballFixture[]
}

function normalizedName(value: string | null | undefined): string {
  return (value ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function dateBucket(value: string | null | undefined): string {
  if (!value) return ''
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return ''
  return parsed.toISOString().slice(0, 16)
}

function numberOrNull(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function matchCandidate(
  candidate: ProviderMatchCandidate,
  matches: TournamentMatch[],
): TournamentMatch | null {
  const byId = candidate.providerMatchId
    ? matches.find((match) => match.id === candidate.providerMatchId)
    : null
  if (byId) return byId

  const candidateDate = dateBucket(candidate.utcDate)
  const candidateHome = normalizedName(candidate.homeName ?? candidate.homeCode)
  const candidateAway = normalizedName(candidate.awayName ?? candidate.awayCode)
  const candidateHomeCode = normalizedName(candidate.homeCode)
  const candidateAwayCode = normalizedName(candidate.awayCode)

  const exactTeam = matches.find((match) => {
    const sameDate = dateBucket(match.kickoffAt) === candidateDate
    if (!sameDate) return false

    const homeMatches =
      normalizedName(match.homeTeamCode) === candidateHomeCode ||
      normalizedName(match.homeTeamName) === candidateHome
    const awayMatches =
      normalizedName(match.awayTeamCode) === candidateAwayCode ||
      normalizedName(match.awayTeamName) === candidateAway

    return homeMatches && awayMatches
  })
  if (exactTeam) return exactTeam

  return matches.find((match) => dateBucket(match.kickoffAt) === candidateDate) ?? null
}

function footballDataStatus(value: string | undefined): NormalizedResultStatus {
  switch ((value ?? '').toUpperCase()) {
    case 'FINISHED':
      return 'finished'
    case 'IN_PLAY':
    case 'PAUSED':
    case 'LIVE':
      return 'live'
    case 'POSTPONED':
      return 'postponed'
    case 'CANCELLED':
      return 'cancelled'
    case 'TIMED':
    case 'SCHEDULED':
      return 'scheduled'
    default:
      return 'unknown'
  }
}

function apiFootballStatus(value: string | null | undefined): NormalizedResultStatus {
  switch ((value ?? '').toUpperCase()) {
    case 'FT':
    case 'AET':
    case 'PEN':
      return 'finished'
    case '1H':
    case 'HT':
    case '2H':
    case 'ET':
    case 'P':
    case 'BT':
      return 'live'
    case 'PST':
      return 'postponed'
    case 'CANC':
    case 'ABD':
      return 'cancelled'
    case 'NS':
    case 'TBD':
      return 'scheduled'
    default:
      return 'unknown'
  }
}

function resultDate(status: NormalizedResultStatus, utcDate: string | null | undefined): string | null {
  if (status !== 'finished') return null
  const parsed = new Date(utcDate ?? '')
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString()
}

export function getLiveResultsProvider(): LiveResultsProvider {
  return process.env.LIVE_RESULTS_PROVIDER === 'api-football'
    ? 'api-football'
    : 'football-data'
}

export function liveResultsAttribution(provider = getLiveResultsProvider()): string | null {
  return provider === 'football-data'
    ? 'Football data provided by the Football-Data.org API.'
    : null
}

export function normalizeFootballDataResults(
  payload: FootballDataPayload,
  matches: TournamentMatch[],
): NormalizedResult[] {
  const now = new Date().toISOString()

  return (payload.matches ?? []).flatMap((match): NormalizedResult[] => {
    const tournamentMatch = matchCandidate(
      {
        providerMatchId: match.id == null ? null : String(match.id),
        utcDate: match.utcDate ?? null,
        homeName: match.homeTeam?.name ?? null,
        awayName: match.awayTeam?.name ?? null,
        homeCode: match.homeTeam?.tla ?? null,
        awayCode: match.awayTeam?.tla ?? null,
      },
      matches,
    )
    if (!tournamentMatch) return []

    const status = footballDataStatus(match.status)
    return [
      {
        matchId: tournamentMatch.id,
        homeScore: numberOrNull(match.score?.fullTime?.home),
        awayScore: numberOrNull(match.score?.fullTime?.away),
        status,
        finishedAt: resultDate(status, match.lastUpdated ?? match.utcDate),
        source: 'football-data',
        providerMatchId: match.id == null ? null : String(match.id),
        updatedAt: match.lastUpdated ?? now,
      },
    ]
  })
}

export function normalizeApiFootballResults(
  payload: ApiFootballPayload,
  matches: TournamentMatch[],
): NormalizedResult[] {
  const now = new Date().toISOString()

  return (payload.response ?? []).flatMap((fixture): NormalizedResult[] => {
    const tournamentMatch = matchCandidate(
      {
        providerMatchId:
          fixture.fixture?.id == null ? null : String(fixture.fixture.id),
        utcDate: fixture.fixture?.date ?? null,
        homeName: fixture.teams?.home?.name ?? null,
        awayName: fixture.teams?.away?.name ?? null,
        homeCode: fixture.teams?.home?.code ?? null,
        awayCode: fixture.teams?.away?.code ?? null,
      },
      matches,
    )
    if (!tournamentMatch) return []

    const status = apiFootballStatus(fixture.fixture?.status?.short)
    const extraHome = numberOrNull(fixture.score?.extratime?.home)
    const extraAway = numberOrNull(fixture.score?.extratime?.away)
    const fullHome = numberOrNull(fixture.score?.fulltime?.home)
    const fullAway = numberOrNull(fixture.score?.fulltime?.away)

    return [
      {
        matchId: tournamentMatch.id,
        homeScore: extraHome ?? fullHome ?? numberOrNull(fixture.goals?.home),
        awayScore: extraAway ?? fullAway ?? numberOrNull(fixture.goals?.away),
        status,
        finishedAt: resultDate(status, fixture.fixture?.date),
        source: 'api-football',
        providerMatchId:
          fixture.fixture?.id == null ? null : String(fixture.fixture.id),
        updatedAt: now,
      },
    ]
  })
}

async function fetchFootballData(matches: TournamentMatch[]): Promise<NormalizedResult[]> {
  const token = process.env.FOOTBALL_DATA_ORG_TOKEN
  if (!token) return []

  const response = await fetch(
    'https://api.football-data.org/v4/competitions/WC/matches?season=2026',
    {
      headers: {
        'X-Auth-Token': token,
      },
    },
  )
  if (!response.ok) {
    throw new Error(`football-data request failed: ${response.status}`)
  }

  return normalizeFootballDataResults((await response.json()) as FootballDataPayload, matches)
}

async function fetchApiFootball(matches: TournamentMatch[]): Promise<NormalizedResult[]> {
  const key = process.env.API_FOOTBALL_KEY
  if (!key) return []

  const response = await fetch(
    'https://v3.football.api-sports.io/fixtures?league=1&season=2026',
    {
      headers: {
        'x-apisports-key': key,
      },
    },
  )
  if (!response.ok) {
    throw new Error(`api-football request failed: ${response.status}`)
  }

  return normalizeApiFootballResults((await response.json()) as ApiFootballPayload, matches)
}

export async function fetchResults(): Promise<NormalizedResult[]> {
  const { matches } = await loadTournamentData()
  return getLiveResultsProvider() === 'api-football'
    ? fetchApiFootball(matches)
    : fetchFootballData(matches)
}
