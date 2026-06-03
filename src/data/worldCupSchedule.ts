import type { TeamKey } from './worldCup.js'

export type TournamentVenue = {
  id: string
  name: string
  city: string
  country: string
}

export type TournamentTeam = {
  name: string
  code: string
  group: string
  seedPot: number
  position: number
}

export type TournamentGroup = {
  id: string
  teams: TournamentTeam[]
}

export type TournamentFixture = {
  matchNumber: number
  date: string
  timeET: string
  venue: TournamentVenue
  group: string
  home: string
  away: string
  note?: string
}

export const TOURNAMENT_SOURCE_SNAPSHOT = {
  asOf: '2026-06-02',
  timeZone: 'ET',
  note:
    'Source snapshot for product prototyping. Verify teams, fixtures, venues, and kickoff times against official FIFA sources before any real prize campaign.',
  officialScheduleUrl:
    'https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/match-schedule-fixtures-results-teams-stadiums',
  scheduleSnapshotUrl: 'https://www.wccal.com/',
} as const

const teamCodes: Record<string, string> = {
  Algeria: 'ALG',
  Argentina: 'ARG',
  Australia: 'AUS',
  Austria: 'AUT',
  Belgium: 'BEL',
  'Bosnia and Herzegovina': 'BIH',
  Brazil: 'BRA',
  'Cabo Verde': 'CPV',
  Canada: 'CAN',
  Colombia: 'COL',
  Croatia: 'CRO',
  Curacao: 'CUW',
  Czechia: 'CZE',
  'DR Congo': 'COD',
  Ecuador: 'ECU',
  Egypt: 'EGY',
  England: 'ENG',
  France: 'FRA',
  Germany: 'GER',
  Ghana: 'GHA',
  Haiti: 'HAI',
  Iran: 'IRN',
  Iraq: 'IRQ',
  'Ivory Coast': 'CIV',
  Japan: 'JPN',
  Jordan: 'JOR',
  Mexico: 'MEX',
  Morocco: 'MAR',
  Netherlands: 'NED',
  'New Zealand': 'NZL',
  Norway: 'NOR',
  Panama: 'PAN',
  Paraguay: 'PAR',
  Portugal: 'POR',
  Qatar: 'QAT',
  'Saudi Arabia': 'KSA',
  Scotland: 'SCO',
  Senegal: 'SEN',
  'South Africa': 'RSA',
  'South Korea': 'KOR',
  Spain: 'ESP',
  Sweden: 'SWE',
  Switzerland: 'SUI',
  Tunisia: 'TUN',
  Türkiye: 'TUR',
  Uruguay: 'URU',
  USA: 'USA',
  Uzbekistan: 'UZB',
}

const groupRows = [
  [
    'A',
    [
      ['Mexico', 1],
      ['South Africa', 3],
      ['South Korea', 2],
      ['Czechia', 4],
    ],
  ],
  [
    'B',
    [
      ['Canada', 1],
      ['Bosnia and Herzegovina', 4],
      ['Qatar', 3],
      ['Switzerland', 2],
    ],
  ],
  [
    'C',
    [
      ['Brazil', 1],
      ['Morocco', 2],
      ['Haiti', 4],
      ['Scotland', 3],
    ],
  ],
  [
    'D',
    [
      ['USA', 1],
      ['Paraguay', 3],
      ['Australia', 2],
      ['Türkiye', 4],
    ],
  ],
  [
    'E',
    [
      ['Germany', 1],
      ['Curacao', 4],
      ['Ivory Coast', 3],
      ['Ecuador', 2],
    ],
  ],
  [
    'F',
    [
      ['Netherlands', 1],
      ['Japan', 2],
      ['Sweden', 4],
      ['Tunisia', 3],
    ],
  ],
  [
    'G',
    [
      ['Belgium', 1],
      ['Egypt', 3],
      ['Iran', 2],
      ['New Zealand', 4],
    ],
  ],
  [
    'H',
    [
      ['Spain', 1],
      ['Cabo Verde', 4],
      ['Saudi Arabia', 3],
      ['Uruguay', 2],
    ],
  ],
  [
    'I',
    [
      ['France', 1],
      ['Senegal', 2],
      ['Iraq', 4],
      ['Norway', 3],
    ],
  ],
  [
    'J',
    [
      ['Argentina', 1],
      ['Algeria', 3],
      ['Austria', 2],
      ['Jordan', 4],
    ],
  ],
  [
    'K',
    [
      ['Portugal', 1],
      ['DR Congo', 4],
      ['Uzbekistan', 3],
      ['Colombia', 2],
    ],
  ],
  [
    'L',
    [
      ['England', 1],
      ['Croatia', 2],
      ['Ghana', 4],
      ['Panama', 3],
    ],
  ],
] as const

const venueById = {
  atl: {
    id: 'atl',
    name: 'Mercedes-Benz Stadium',
    city: 'Atlanta',
    country: 'USA',
  },
  bos: {
    id: 'bos',
    name: 'Gillette Stadium',
    city: 'Boston',
    country: 'USA',
  },
  dal: {
    id: 'dal',
    name: 'AT&T Stadium',
    city: 'Dallas',
    country: 'USA',
  },
  gdl: {
    id: 'gdl',
    name: 'Estadio Akron',
    city: 'Guadalajara',
    country: 'Mexico',
  },
  hou: {
    id: 'hou',
    name: 'NRG Stadium',
    city: 'Houston',
    country: 'USA',
  },
  kc: {
    id: 'kc',
    name: 'Arrowhead Stadium',
    city: 'Kansas City',
    country: 'USA',
  },
  la: {
    id: 'la',
    name: 'SoFi Stadium',
    city: 'Los Angeles',
    country: 'USA',
  },
  mex: {
    id: 'mex',
    name: 'Estadio Azteca',
    city: 'Mexico City',
    country: 'Mexico',
  },
  mia: {
    id: 'mia',
    name: 'Hard Rock Stadium',
    city: 'Miami',
    country: 'USA',
  },
  mty: {
    id: 'mty',
    name: 'Estadio BBVA',
    city: 'Monterrey',
    country: 'Mexico',
  },
  nyj: {
    id: 'nyj',
    name: 'MetLife Stadium',
    city: 'New York/New Jersey',
    country: 'USA',
  },
  phi: {
    id: 'phi',
    name: 'Lincoln Financial Field',
    city: 'Philadelphia',
    country: 'USA',
  },
  sea: {
    id: 'sea',
    name: 'Lumen Field',
    city: 'Seattle',
    country: 'USA',
  },
  sf: {
    id: 'sf',
    name: "Levi's Stadium",
    city: 'San Francisco Bay Area',
    country: 'USA',
  },
  tor: {
    id: 'tor',
    name: 'BMO Field',
    city: 'Toronto',
    country: 'Canada',
  },
  van: {
    id: 'van',
    name: 'BC Place',
    city: 'Vancouver',
    country: 'Canada',
  },
} satisfies Record<string, TournamentVenue>

type TournamentVenueId = keyof typeof venueById
type FixtureRow = readonly [
  number,
  string,
  string,
  TournamentVenueId,
  string,
  string,
  string,
  string?,
]

const fixtureRows: readonly FixtureRow[] = [
  [1, '2026-06-11', '15:00', 'mex', 'A', 'Mexico', 'South Africa', 'Opening Match'],
  [2, '2026-06-11', '22:00', 'gdl', 'A', 'South Korea', 'Czechia'],
  [3, '2026-06-12', '15:00', 'tor', 'B', 'Canada', 'Bosnia and Herzegovina'],
  [4, '2026-06-12', '21:00', 'la', 'D', 'USA', 'Paraguay'],
  [5, '2026-06-13', '21:00', 'bos', 'C', 'Haiti', 'Scotland'],
  [6, '2026-06-13', '00:00', 'sf', 'B', 'Qatar', 'Switzerland'],
  [7, '2026-06-13', '18:00', 'nyj', 'C', 'Brazil', 'Morocco'],
  [8, '2026-06-14', '15:00', 'van', 'D', 'Australia', 'Türkiye'],
  [9, '2026-06-14', '19:00', 'phi', 'E', 'Ivory Coast', 'Ecuador'],
  [10, '2026-06-14', '13:00', 'hou', 'E', 'Germany', 'Curacao'],
  [11, '2026-06-14', '16:00', 'dal', 'F', 'Netherlands', 'Japan'],
  [12, '2026-06-14', '22:00', 'mty', 'F', 'Sweden', 'Tunisia'],
  [13, '2026-06-15', '18:00', 'mia', 'H', 'Saudi Arabia', 'Uruguay'],
  [14, '2026-06-15', '12:00', 'atl', 'H', 'Spain', 'Cabo Verde'],
  [15, '2026-06-15', '21:00', 'la', 'G', 'Iran', 'New Zealand'],
  [16, '2026-06-15', '15:00', 'sea', 'G', 'Belgium', 'Egypt'],
  [17, '2026-06-16', '15:00', 'nyj', 'I', 'France', 'Senegal'],
  [18, '2026-06-16', '15:00', 'bos', 'I', 'Iraq', 'Norway'],
  [19, '2026-06-16', '21:00', 'kc', 'J', 'Argentina', 'Algeria'],
  [20, '2026-06-17', '00:00', 'sf', 'J', 'Austria', 'Jordan'],
  [21, '2026-06-17', '19:00', 'tor', 'L', 'Ghana', 'Panama'],
  [22, '2026-06-17', '16:00', 'dal', 'L', 'England', 'Croatia'],
  [23, '2026-06-17', '13:00', 'hou', 'K', 'Portugal', 'DR Congo'],
  [24, '2026-06-17', '22:00', 'mex', 'K', 'Uzbekistan', 'Colombia'],
  [25, '2026-06-18', '12:00', 'atl', 'A', 'Czechia', 'South Africa'],
  [26, '2026-06-18', '12:00', 'la', 'B', 'Switzerland', 'Bosnia and Herzegovina'],
  [27, '2026-06-18', '18:00', 'van', 'B', 'Canada', 'Qatar'],
  [28, '2026-06-18', '21:00', 'gdl', 'A', 'Mexico', 'South Korea'],
  [29, '2026-06-19', '21:00', 'phi', 'C', 'Brazil', 'Haiti'],
  [30, '2026-06-19', '18:00', 'bos', 'C', 'Scotland', 'Morocco'],
  [31, '2026-06-19', '00:00', 'sf', 'D', 'Türkiye', 'Paraguay'],
  [32, '2026-06-19', '15:00', 'sea', 'D', 'USA', 'Australia'],
  [33, '2026-06-20', '16:00', 'tor', 'E', 'Germany', 'Ivory Coast'],
  [34, '2026-06-20', '20:00', 'kc', 'E', 'Ecuador', 'Curacao'],
  [35, '2026-06-20', '13:00', 'hou', 'F', 'Netherlands', 'Sweden'],
  [36, '2026-06-20', '00:00', 'mty', 'F', 'Tunisia', 'Japan'],
  [37, '2026-06-21', '18:00', 'mia', 'H', 'Uruguay', 'Cabo Verde'],
  [38, '2026-06-21', '12:00', 'atl', 'H', 'Spain', 'Saudi Arabia'],
  [39, '2026-06-21', '15:00', 'la', 'G', 'Belgium', 'Iran'],
  [40, '2026-06-21', '21:00', 'van', 'G', 'New Zealand', 'Egypt'],
  [41, '2026-06-22', '20:00', 'nyj', 'I', 'Norway', 'Senegal'],
  [42, '2026-06-22', '17:00', 'phi', 'I', 'France', 'Iraq'],
  [43, '2026-06-22', '13:00', 'dal', 'J', 'Argentina', 'Austria'],
  [44, '2026-06-22', '23:00', 'sf', 'J', 'Jordan', 'Algeria'],
  [45, '2026-06-23', '16:00', 'bos', 'L', 'England', 'Ghana'],
  [46, '2026-06-23', '19:00', 'tor', 'L', 'Panama', 'Croatia'],
  [47, '2026-06-23', '13:00', 'hou', 'K', 'Portugal', 'Uzbekistan'],
  [48, '2026-06-23', '22:00', 'gdl', 'K', 'Colombia', 'DR Congo'],
  [49, '2026-06-24', '18:00', 'mia', 'C', 'Scotland', 'Brazil'],
  [50, '2026-06-24', '15:00', 'atl', 'C', 'Morocco', 'Haiti'],
  [51, '2026-06-24', '15:00', 'van', 'B', 'Switzerland', 'Canada'],
  [52, '2026-06-24', '15:00', 'sea', 'B', 'Bosnia and Herzegovina', 'Qatar'],
  [53, '2026-06-24', '21:00', 'mex', 'A', 'Czechia', 'Mexico'],
  [54, '2026-06-24', '21:00', 'mty', 'A', 'South Africa', 'South Korea'],
  [55, '2026-06-25', '16:00', 'phi', 'E', 'Curacao', 'Ivory Coast'],
  [56, '2026-06-25', '16:00', 'nyj', 'E', 'Ecuador', 'Germany'],
  [57, '2026-06-25', '19:00', 'dal', 'F', 'Tunisia', 'Netherlands'],
  [58, '2026-06-25', '19:00', 'kc', 'F', 'Japan', 'Sweden'],
  [59, '2026-06-25', '22:00', 'la', 'D', 'Türkiye', 'USA'],
  [60, '2026-06-25', '22:00', 'sf', 'D', 'Paraguay', 'Australia'],
  [61, '2026-06-26', '15:00', 'bos', 'I', 'Norway', 'France'],
  [62, '2026-06-26', '15:00', 'tor', 'I', 'Senegal', 'Iraq'],
  [63, '2026-06-26', '23:00', 'sea', 'G', 'Egypt', 'Iran'],
  [64, '2026-06-26', '23:00', 'van', 'G', 'New Zealand', 'Belgium'],
  [65, '2026-06-26', '20:00', 'hou', 'H', 'Cabo Verde', 'Saudi Arabia'],
  [66, '2026-06-26', '20:00', 'gdl', 'H', 'Uruguay', 'Spain'],
  [67, '2026-06-27', '17:00', 'nyj', 'L', 'Panama', 'England'],
  [68, '2026-06-27', '17:00', 'phi', 'L', 'Croatia', 'Ghana'],
  [69, '2026-06-27', '22:00', 'kc', 'J', 'Algeria', 'Austria'],
  [70, '2026-06-27', '22:00', 'dal', 'J', 'Jordan', 'Argentina'],
  [71, '2026-06-27', '19:30', 'mia', 'K', 'Colombia', 'Portugal'],
  [72, '2026-06-27', '19:30', 'atl', 'K', 'DR Congo', 'Uzbekistan'],
]

export const supporterTeamScheduleNames: Partial<Record<TeamKey, string>> = {
  argentina: 'Argentina',
  brazil: 'Brazil',
  england: 'England',
  france: 'France',
  japan: 'Japan',
  morocco: 'Morocco',
  spain: 'Spain',
  usa: 'USA',
}

export const worldCupGroups: TournamentGroup[] = groupRows.map(
  ([group, teams]) => ({
    id: group,
    teams: teams.map(([name, seedPot], index) => ({
      name,
      code: teamCodes[name],
      group,
      seedPot,
      position: index + 1,
    })),
  }),
)

export const worldCupTeams = worldCupGroups.flatMap((group) => group.teams)

export const worldCupFixtures: TournamentFixture[] = fixtureRows.map(
  ([matchNumber, date, timeET, venueId, group, home, away, note]) => ({
    matchNumber,
    date,
    timeET,
    venue: venueById[venueId],
    group,
    home,
    away,
    note,
  }),
)

export function getTournamentTeamCode(teamName: string) {
  return teamCodes[teamName] ?? teamName.slice(0, 3).toUpperCase()
}

export function getTournamentTeamSchedule(teamName: string) {
  return worldCupFixtures.filter(
    (fixture) => fixture.home === teamName || fixture.away === teamName,
  )
}

export function formatFixtureDate(date: string) {
  const [year, month, day] = date.split('-').map(Number)

  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
    year: 'numeric',
  }).format(new Date(Date.UTC(year, month - 1, day)))
}

export function formatTimeET(time: string) {
  const [hour, minute] = time.split(':').map(Number)
  const period = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour

  return `${displayHour}:${String(minute).padStart(2, '0')} ${period} ET`
}
