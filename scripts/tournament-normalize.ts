import { readFile } from 'node:fs/promises'

const SOURCE_FILE = new URL('../db/openfootball/worldcup-2026.json', import.meta.url)

export const OPENFOOTBALL_SOURCE_URL =
  'https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json'
export const OPENFOOTBALL_SOURCE_NAME = 'openfootball/worldcup.json'
export const OPENFOOTBALL_LICENSE = 'CC0 1.0 Universal'
export const OPENFOOTBALL_VERIFIED_AT = '2026-06-08'

type OpenfootballMatch = {
  round: string
  num?: number
  date: string
  time: string
  team1: string
  team2: string
  group?: string
  ground: string
}

type OpenfootballData = {
  name: string
  matches: OpenfootballMatch[]
}

export type NormalizedGroup = {
  code: string
  name: string
  sortOrder: number
}

export type NormalizedTeam = {
  code: string
  name: string
  slug: string
  groupCode: string
  groupName: string
  groupSeed: number
  colors: Record<string, string>
  localizedNames: Record<string, string>
}

export type NormalizedMatch = {
  id: string
  matchNumber: number
  stage:
    | 'group'
    | 'round_of_32'
    | 'round_of_16'
    | 'quarter_final'
    | 'semi_final'
    | 'third_place'
    | 'final'
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
  status: 'scheduled'
  source: OpenfootballMatch
}

export type TournamentCounts = {
  totalFixtures: number
  groupFixtures: number
  groups: number
  teams: number
}

export type NormalizedTournament = {
  name: string
  groups: NormalizedGroup[]
  teams: NormalizedTeam[]
  matches: NormalizedMatch[]
  counts: TournamentCounts
  source: {
    url: string
    name: string
    license: string
    verifiedAt: string
  }
}

type TeamMetadata = {
  code: string
  ar: string
  color: string
}

const TEAM_METADATA: Record<string, TeamMetadata> = {
  Algeria: { code: 'DZA', ar: 'الجزائر', color: '#1E9E5A' },
  Argentina: { code: 'ARG', ar: 'الأرجنتين', color: '#5C9CE6' },
  Australia: { code: 'AUS', ar: 'أستراليا', color: '#E6A817' },
  Austria: { code: 'AUT', ar: 'النمسا', color: '#D81E2C' },
  Belgium: { code: 'BEL', ar: 'بلجيكا', color: '#D21F3C' },
  'Bosnia & Herzegovina': {
    code: 'BIH',
    ar: 'البوسنة والهرسك',
    color: '#2D6CC0',
  },
  Brazil: { code: 'BRA', ar: 'البرازيل', color: '#F4D300' },
  Canada: { code: 'CAN', ar: 'كندا', color: '#E03131' },
  'Cape Verde': { code: 'CPV', ar: 'الرأس الأخضر', color: '#2D6CC0' },
  Colombia: { code: 'COL', ar: 'كولومبيا', color: '#E6B800' },
  Croatia: { code: 'CRO', ar: 'كرواتيا', color: '#3667C8' },
  Curaçao: { code: 'CUW', ar: 'كوراساو', color: '#2D6CC0' },
  'Czech Republic': {
    code: 'CZE',
    ar: 'التشيك',
    color: '#2D6CC0',
  },
  'DR Congo': { code: 'COD', ar: 'جمهورية الكونغو الديمقراطية', color: '#2BA84A' },
  Ecuador: { code: 'ECU', ar: 'الإكوادور', color: '#E6B800' },
  Egypt: { code: 'EGY', ar: 'مصر', color: '#C0392B' },
  England: { code: 'ENG', ar: 'إنجلترا', color: '#E8203A' },
  France: { code: 'FRA', ar: 'فرنسا', color: '#2A4BC6' },
  Germany: { code: 'GER', ar: 'ألمانيا', color: '#9AA3B2' },
  Ghana: { code: 'GHA', ar: 'غانا', color: '#2BA84A' },
  Haiti: { code: 'HAI', ar: 'هايتي', color: '#2D6CC0' },
  Iran: { code: 'IRN', ar: 'إيران', color: '#1E9E5A' },
  Iraq: { code: 'IRQ', ar: 'العراق', color: '#1E9E5A' },
  'Ivory Coast': { code: 'CIV', ar: 'ساحل العاج', color: '#E67018' },
  Japan: { code: 'JPN', ar: 'اليابان', color: '#2740A6' },
  Jordan: { code: 'JOR', ar: 'الأردن', color: '#8E2434' },
  Mexico: { code: 'MEX', ar: 'المكسيك', color: '#16A34A' },
  Morocco: { code: 'MAR', ar: 'المغرب', color: '#C0392B' },
  Netherlands: { code: 'NED', ar: 'هولندا', color: '#F47B20' },
  'New Zealand': { code: 'NZL', ar: 'نيوزيلندا', color: '#2C3E50' },
  Norway: { code: 'NOR', ar: 'النرويج', color: '#C0392B' },
  Panama: { code: 'PAN', ar: 'بنما', color: '#A41E34' },
  Paraguay: { code: 'PAR', ar: 'باراغواي', color: '#C0392B' },
  Portugal: { code: 'POR', ar: 'البرتغال', color: '#0E8A5F' },
  Qatar: { code: 'QAT', ar: 'قطر', color: '#7A1F3D' },
  'Saudi Arabia': { code: 'KSA', ar: 'السعودية', color: '#0E7A3D' },
  Scotland: { code: 'SCO', ar: 'اسكتلندا', color: '#2D6CC0' },
  Senegal: { code: 'SEN', ar: 'السنغال', color: '#22B765' },
  'South Africa': {
    code: 'RSA',
    ar: 'جنوب أفريقيا',
    color: '#1E9E5A',
  },
  'South Korea': {
    code: 'KOR',
    ar: 'كوريا الجنوبية',
    color: '#3E84E0',
  },
  Spain: { code: 'ESP', ar: 'إسبانيا', color: '#D81E2C' },
  Sweden: { code: 'SWE', ar: 'السويد', color: '#2D6CC0' },
  Switzerland: { code: 'SUI', ar: 'سويسرا', color: '#D81E2C' },
  Tunisia: { code: 'TUN', ar: 'تونس', color: '#C0392B' },
  Turkey: { code: 'TUR', ar: 'تركيا', color: '#C0392B' },
  Uruguay: { code: 'URU', ar: 'الأوروغواي', color: '#4AA3DF' },
  USA: { code: 'USA', ar: 'الولايات المتحدة', color: '#3B63D6' },
  Uzbekistan: { code: 'UZB', ar: 'أوزبكستان', color: '#1E9E8A' },
}

function groupCodeFromName(groupName: string): string {
  const match = /^Group ([A-L])$/.exec(groupName)
  if (!match) {
    throw new Error(`Unsupported group name: ${groupName}`)
  }
  return match[1]
}

function sortGroupCode(a: string, b: string): number {
  return a.localeCompare(b, 'en')
}

function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function stageFromRound(round: string): NormalizedMatch['stage'] {
  if (round.startsWith('Matchday')) return 'group'
  if (round === 'Round of 32') return 'round_of_32'
  if (round === 'Round of 16') return 'round_of_16'
  if (round === 'Quarter-final') return 'quarter_final'
  if (round === 'Semi-final') return 'semi_final'
  if (round === 'Match for third place') return 'third_place'
  if (round === 'Final') return 'final'
  throw new Error(`Unsupported match round: ${round}`)
}

function splitKickoffTime(time: string): {
  localTime: string
  timezone: string
  offsetMinutes: number
} {
  const match = /^(\d{1,2}:\d{2})(?:\s+(UTC)([+-]\d{1,2})(?::?(\d{2}))?)?$/.exec(time)
  if (!match) {
    throw new Error(`Unsupported kickoff time: ${time}`)
  }

  const localTime = match[1]
  const timezoneLabel = match[2]
  const offsetHours = match[3]
  const offsetMinuteText = match[4]

  if (!timezoneLabel || !offsetHours) {
    return {
      localTime,
      timezone: 'UTC',
      offsetMinutes: 0,
    }
  }

  const sign = offsetHours.startsWith('-') ? -1 : 1
  const hourValue = Math.abs(Number(offsetHours))
  const minuteValue = Number(offsetMinuteText ?? 0)

  if (!Number.isFinite(hourValue) || !Number.isFinite(minuteValue)) {
    throw new Error(`Unsupported UTC offset in kickoff time: ${time}`)
  }

  return {
    localTime,
    timezone: `${timezoneLabel}${offsetHours}`,
    offsetMinutes: sign * (hourValue * 60 + minuteValue),
  }
}

export function kickoffToUtcIso(date: string, time: string): string {
  const [year, month, day] = date.split('-').map(Number)
  const { localTime, offsetMinutes } = splitKickoffTime(time)
  const [hour, minute] = localTime.split(':').map(Number)

  const localAsUtc = Date.UTC(year, month - 1, day, hour, minute)
  return new Date(localAsUtc - offsetMinutes * 60_000).toISOString()
}

function resolveTeamMetadata(teamName: string): TeamMetadata {
  const metadata = TEAM_METADATA[teamName]
  if (!metadata) {
    throw new Error(`No stable team metadata for openfootball team: ${teamName}`)
  }
  return metadata
}

function isActualTeamName(teamName: string): boolean {
  return teamName in TEAM_METADATA
}

function buildGroups(matches: OpenfootballMatch[]): NormalizedGroup[] {
  const groupCodes = new Set<string>()
  for (const match of matches) {
    if (match.group) groupCodes.add(groupCodeFromName(match.group))
  }

  return [...groupCodes].sort(sortGroupCode).map((code) => ({
    code,
    name: `Group ${code}`,
    sortOrder: code.charCodeAt(0) - 64,
  }))
}

function buildTeams(matches: OpenfootballMatch[]): NormalizedTeam[] {
  const teamOrderByGroup = new Map<string, string[]>()

  for (const match of matches) {
    if (!match.group) continue

    const groupCode = groupCodeFromName(match.group)
    const teamNames = teamOrderByGroup.get(groupCode) ?? []

    for (const teamName of [match.team1, match.team2]) {
      resolveTeamMetadata(teamName)
      if (!teamNames.includes(teamName)) teamNames.push(teamName)
    }

    teamOrderByGroup.set(groupCode, teamNames)
  }

  return [...teamOrderByGroup.entries()]
    .sort(([a], [b]) => sortGroupCode(a, b))
    .flatMap(([groupCode, teamNames]) =>
      teamNames.map((teamName, index) => {
        const metadata = resolveTeamMetadata(teamName)
        return {
          code: metadata.code,
          name: teamName,
          slug: slugify(teamName),
          groupCode,
          groupName: `Group ${groupCode}`,
          groupSeed: index + 1,
          colors: {
            primary: metadata.color,
          },
          localizedNames: {
            ar: metadata.ar,
          },
        }
      }),
    )
}

function placeholderFor(teamName: string): string | null {
  return isActualTeamName(teamName) ? null : teamName
}

function teamCodeFor(teamName: string): string | null {
  return isActualTeamName(teamName) ? resolveTeamMetadata(teamName).code : null
}

function buildMatches(matches: OpenfootballMatch[]): NormalizedMatch[] {
  return matches.map((match, index) => {
    const kickoff = splitKickoffTime(match.time)
    const groupCode = match.group ? groupCodeFromName(match.group) : null
    const matchNumber = match.num ?? index + 1

    return {
      id: `match-${matchNumber}`,
      matchNumber,
      stage: stageFromRound(match.round),
      round: match.round,
      groupCode,
      groupName: match.group ?? null,
      homeTeamCode: teamCodeFor(match.team1),
      awayTeamCode: teamCodeFor(match.team2),
      homeTeamName: match.team1,
      awayTeamName: match.team2,
      homePlaceholder: placeholderFor(match.team1),
      awayPlaceholder: placeholderFor(match.team2),
      kickoffAt: kickoffToUtcIso(match.date, match.time),
      kickoffLocalDate: match.date,
      kickoffLocalTime: kickoff.localTime,
      kickoffTimezone: kickoff.timezone,
      venue: match.ground,
      status: 'scheduled',
      source: match,
    }
  })
}

function validateTournament(tournament: NormalizedTournament): void {
  const groupMatches = tournament.matches.filter((match) => match.stage === 'group')
  const teamCodes = new Set(tournament.teams.map((team) => team.code))

  if (tournament.matches.length !== 104) {
    throw new Error(`Expected 104 fixtures, found ${tournament.matches.length}.`)
  }

  if (groupMatches.length !== 72) {
    throw new Error(`Expected 72 group fixtures, found ${groupMatches.length}.`)
  }

  if (tournament.groups.length !== 12) {
    throw new Error(`Expected 12 groups, found ${tournament.groups.length}.`)
  }

  if (teamCodes.size !== 48 || tournament.teams.length !== 48) {
    throw new Error(`Expected 48 teams, found ${teamCodes.size}.`)
  }

  for (const group of tournament.groups) {
    const groupTeamCount = tournament.teams.filter(
      (team) => team.groupCode === group.code,
    ).length
    if (groupTeamCount !== 4) {
      throw new Error(`Expected 4 teams in ${group.name}, found ${groupTeamCount}.`)
    }
  }
}

export async function loadOpenfootballJson(): Promise<OpenfootballData> {
  return JSON.parse(await readFile(SOURCE_FILE, 'utf8')) as OpenfootballData
}

export async function normalizeOpenfootballData(): Promise<NormalizedTournament> {
  const data = await loadOpenfootballJson()
  const groups = buildGroups(data.matches)
  const teams = buildTeams(data.matches)
  const matches = buildMatches(data.matches)

  const tournament: NormalizedTournament = {
    name: data.name,
    groups,
    teams,
    matches,
    counts: {
      totalFixtures: matches.length,
      groupFixtures: matches.filter((match) => match.stage === 'group').length,
      groups: groups.length,
      teams: teams.length,
    },
    source: {
      url: OPENFOOTBALL_SOURCE_URL,
      name: OPENFOOTBALL_SOURCE_NAME,
      license: OPENFOOTBALL_LICENSE,
      verifiedAt: OPENFOOTBALL_VERIFIED_AT,
    },
  }

  validateTournament(tournament)
  return tournament
}
