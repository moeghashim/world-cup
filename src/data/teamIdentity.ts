import {
  getTournamentTeamSchedule,
  worldCupGroups,
  worldCupTeams,
  type TournamentFixture,
} from './worldCupSchedule'

export type TeamIdentity = {
  slug: string
  name: string
  code: string
  group: string
  knownAs: string
  supportLine: string
  knownFor: string
  sponsorAngle: string
  sourceUrls: string[]
}

const FIFA_QUALIFIED_TEAMS_URL =
  'https://www.fifa.com/en/articles/world-cup-2026-who-has-qualified'
const SOCCERPHILE_NICKNAMES_URL =
  'https://www.soccerphile.com/world-cup-2026/national-team-nicknames'
const SAUDI_GREEN_FALCONS_URL =
  'https://saudipedia.com/en/article/1079/society/sports/saudi-senior-national-football-team'
const CURACAO_BLUE_WAVE_URL = 'https://www.curacao.com/bluewave/pt/'
const UZBEKISTAN_WHITE_WOLVES_URL =
  'https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/teams/uzbekistan/'
const JFA_SAMURAI_BLUE_URL = 'https://www.jfa.jp/eng/samuraiblue/'
const SOCCEROOS_URL = 'https://www.socceroos.com.au/'

export const teamResearchSources = [
  {
    label: 'FIFA qualified teams',
    url: FIFA_QUALIFIED_TEAMS_URL,
  },
  {
    label: 'World Cup 2026 team nicknames',
    url: SOCCERPHILE_NICKNAMES_URL,
  },
  {
    label: 'Saudi Green Falcons source',
    url: SAUDI_GREEN_FALCONS_URL,
  },
  {
    label: 'Curaçao Blue Wave campaign',
    url: CURACAO_BLUE_WAVE_URL,
  },
  {
    label: 'Japan Samurai Blue source',
    url: JFA_SAMURAI_BLUE_URL,
  },
] as const

const teamByName = new Map(worldCupTeams.map((team) => [team.name, team]))

function teamSources(...sources: string[]) {
  return [FIFA_QUALIFIED_TEAMS_URL, SOCCERPHILE_NICKNAMES_URL, ...sources]
}

function defineTeamIdentity(
  identity: Omit<TeamIdentity, 'code' | 'group'>,
): TeamIdentity {
  const tournamentTeam = teamByName.get(identity.name)

  if (!tournamentTeam) {
    throw new Error(`Missing tournament team for identity: ${identity.name}`)
  }

  return {
    ...identity,
    code: tournamentTeam.code,
    group: tournamentTeam.group,
  }
}

export const TEAM_SPONSORSHIP_PRICING = {
  groupStageMatches: 3,
  matchSpotlightUsd: 10_000,
  rewardDropUsd: 5_000,
  teamSideSponsorSlotsPerMatch: 2,
  tournamentGroupStageMatches: 72,
} as const

export function formatUsd(amount: number) {
  return new Intl.NumberFormat('en-US', {
    currency: 'USD',
    maximumFractionDigits: 0,
    style: 'currency',
  }).format(amount)
}

export function getTeamSponsorshipMath(
  fixtureCount: number = TEAM_SPONSORSHIP_PRICING.groupStageMatches,
) {
  const matchSpotlightTotal =
    fixtureCount * TEAM_SPONSORSHIP_PRICING.matchSpotlightUsd
  const rewardDropTotal = fixtureCount * TEAM_SPONSORSHIP_PRICING.rewardDropUsd
  const teamPackageTotal = matchSpotlightTotal + rewardDropTotal
  const tournamentTeamSideSlots =
    TEAM_SPONSORSHIP_PRICING.tournamentGroupStageMatches *
    TEAM_SPONSORSHIP_PRICING.teamSideSponsorSlotsPerMatch

  return {
    fixtureCount,
    matchActivationUsd:
      TEAM_SPONSORSHIP_PRICING.matchSpotlightUsd +
      TEAM_SPONSORSHIP_PRICING.rewardDropUsd,
    matchSpotlightTotal,
    rewardDropTotal,
    teamPackageTotal,
    tournamentTeamSideSlots,
  }
}

export function getTeamFixtureSummary(identity: TeamIdentity) {
  return getTournamentTeamSchedule(identity.name)
}

export function getFixtureOpponent(
  fixture: TournamentFixture,
  teamName: string,
) {
  return fixture.home === teamName ? fixture.away : fixture.home
}

export const teamIdentities: TeamIdentity[] = [
  defineTeamIdentity({
    slug: 'mexico',
    name: 'Mexico',
    knownAs: 'El Tri',
    supportLine: 'Vamos Mexico',
    knownFor:
      'A green-white-red identity, El Tri shorthand, and one of the loudest host-nation fan bases in North America.',
    sponsorAngle:
      'Best for brands targeting bilingual North American watch parties, family gatherings, and high-volume host-city energy.',
    sourceUrls: teamSources(),
  }),
  defineTeamIdentity({
    slug: 'south-africa',
    name: 'South Africa',
    knownAs: 'Bafana Bafana',
    supportLine: 'Go Bafana Bafana',
    knownFor:
      'The Bafana Bafana identity, yellow-and-green matchday color, and the 2010 host-nation football memory.',
    sponsorAngle:
      'Best for brands that want a joyful, music-forward activation around a returning African contender.',
    sourceUrls: teamSources(),
  }),
  defineTeamIdentity({
    slug: 'south-korea',
    name: 'South Korea',
    knownAs: 'Taegeuk Warriors / Red Devils',
    supportLine: 'Daehan Minguk / 대한민국',
    knownFor:
      'Red supporter walls, Taegeuk Warriors identity, and disciplined tournament consistency.',
    sponsorAngle:
      'Best for tech, food, culture, beauty, and streaming campaigns aimed at globally connected Korean fans.',
    sourceUrls: teamSources(),
  }),
  defineTeamIdentity({
    slug: 'czechia',
    name: 'Czechia',
    knownAs: 'Narodak / The National Team',
    supportLine: 'Do toho, Cesi',
    knownFor:
      'A national-team-first identity, red-white-blue color culture, and resilient central European tournament support.',
    sponsorAngle:
      'Best for practical matchday offers, travel, beer-adjacent hospitality, and regional fan community campaigns.',
    sourceUrls: teamSources(),
  }),
  defineTeamIdentity({
    slug: 'canada',
    name: 'Canada',
    knownAs: 'The Canucks / Les Rouges',
    supportLine: 'Come on Canada / Allez les Rouges',
    knownFor:
      'Co-host energy, red-and-white fan identity, and a fast-growing national football audience.',
    sponsorAngle:
      'Best for North American national launches, winter-to-summer sports storytelling, and bilingual fan rewards.',
    sourceUrls: teamSources(),
  }),
  defineTeamIdentity({
    slug: 'bosnia-and-herzegovina',
    name: 'Bosnia and Herzegovina',
    knownAs: 'Zmajevi / The Dragons',
    supportLine: 'Naprijed Zmajevi',
    knownFor:
      'Dragon identity, blue-and-gold support, and a passionate diaspora following across Europe and North America.',
    sponsorAngle:
      'Best for diaspora watch parties, family rewards, travel, remittance, and community retail campaigns.',
    sourceUrls: teamSources(),
  }),
  defineTeamIdentity({
    slug: 'qatar',
    name: 'Qatar',
    knownAs: 'Al-Annabi / The Maroons',
    supportLine: 'Yalla Al-Annabi / يلا العنابي',
    knownFor:
      'Maroons identity, recent host-tournament visibility, and Gulf-region football investment.',
    sponsorAngle:
      'Best for premium travel, airline, hospitality, telecom, and Gulf-focused sponsor activations.',
    sourceUrls: teamSources(),
  }),
  defineTeamIdentity({
    slug: 'switzerland',
    name: 'Switzerland',
    knownAs: 'Nati / Rossocrociati',
    supportLine: 'Hopp Schwiiz',
    knownFor:
      'The Nati identity, red-and-white precision, and reliable tournament-level organization.',
    sponsorAngle:
      'Best for finance, travel, outdoor, watch, and precision-product campaigns around dependable performance.',
    sourceUrls: teamSources(),
  }),
  defineTeamIdentity({
    slug: 'brazil',
    name: 'Brazil',
    knownAs: 'Selecao / Canarinho',
    supportLine: 'Vai Brasil',
    knownFor:
      'Canary-yellow football culture, attacking flair, and the global shorthand of the Selecao.',
    sponsorAngle:
      'Best for high-reach consumer campaigns, music, apparel, food delivery, and expressive fan merchandise.',
    sourceUrls: teamSources(),
  }),
  defineTeamIdentity({
    slug: 'morocco',
    name: 'Morocco',
    knownAs: 'Atlas Lions / اسود الاطلس',
    supportLine: 'Dima Maghrib / ديما المغرب',
    knownFor:
      'Atlas Lions pride, red-green identity, and one of the most electric recent World Cup supporter runs.',
    sponsorAngle:
      'Best for North African diaspora campaigns, family viewing, travel, food, and culture-led rewards.',
    sourceUrls: teamSources(),
  }),
  defineTeamIdentity({
    slug: 'haiti',
    name: 'Haiti',
    knownAs: 'Les Grenadiers / Le Rouge et Bleu',
    supportLine: 'Allez les Grenadiers',
    knownFor:
      'Grenadiers identity, red-blue pride, and Caribbean resilience built around a devoted diaspora.',
    sponsorAngle:
      'Best for Caribbean community activations, remittance, music, food, and family-first sponsor drops.',
    sourceUrls: teamSources(),
  }),
  defineTeamIdentity({
    slug: 'scotland',
    name: 'Scotland',
    knownAs: 'The Tartan Army',
    supportLine: 'Come on Scotland',
    knownFor:
      'The Tartan Army supporter culture, dark-blue identity, and traveling fans known for noise and humor.',
    sponsorAngle:
      'Best for travel, pubs, hospitality, apparel, and supporter-trip reward campaigns.',
    sourceUrls: teamSources(),
  }),
  defineTeamIdentity({
    slug: 'usa',
    name: 'USA',
    knownAs: 'Stars and Stripes',
    supportLine: 'Go USA',
    knownFor:
      'Co-host status, red-white-blue supporter identity, and a fast-expanding soccer audience across many cities.',
    sponsorAngle:
      'Best for national brands, retail, fintech, food, streaming, and host-city sponsor campaigns.',
    sourceUrls: teamSources(),
  }),
  defineTeamIdentity({
    slug: 'paraguay',
    name: 'Paraguay',
    knownAs: 'La Albirroja / Los Guaranies',
    supportLine: 'Vamos Albirroja',
    knownFor:
      'Red-and-white Albirroja identity, Guarani cultural references, and hard-edged South American tournament support.',
    sponsorAngle:
      'Best for South American diaspora, beverage, food, and matchday retail campaigns.',
    sourceUrls: teamSources(),
  }),
  defineTeamIdentity({
    slug: 'australia',
    name: 'Australia',
    knownAs: 'The Socceroos',
    supportLine: 'Come on Socceroos',
    knownFor:
      'Socceroos identity, gold-and-green support, and a reputation for direct, physical tournament football.',
    sponsorAngle:
      'Best for travel, outdoor, sportswear, snacks, and English-language APAC fan activations.',
    sourceUrls: teamSources(SOCCEROOS_URL),
  }),
  defineTeamIdentity({
    slug: 'turkiye',
    name: 'Türkiye',
    knownAs: 'Ay-Yildizlilar / The Crescent-Stars',
    supportLine: 'Haydi Turkiye',
    knownFor:
      'Crescent-star identity, red-white intensity, and one of Europe’s loudest diaspora supporter bases.',
    sponsorAngle:
      'Best for diaspora community campaigns, food, travel, telecom, and high-energy matchday rewards.',
    sourceUrls: teamSources(),
  }),
  defineTeamIdentity({
    slug: 'germany',
    name: 'Germany',
    knownAs: 'Die Mannschaft / DFB-Team',
    supportLine: "Auf geht's Deutschland",
    knownFor:
      'Tournament pedigree, black-red-gold identity, and a fan culture built around efficiency and expectation.',
    sponsorAngle:
      'Best for automotive, software, consumer electronics, travel, and precision-performance product stories.',
    sourceUrls: teamSources(),
  }),
  defineTeamIdentity({
    slug: 'curacao',
    name: 'Curacao',
    knownAs: 'The Blue Wave / La Familia Azul',
    supportLine: 'Ride the Blue Wave / Ban Korsou',
    knownFor:
      'A historic first World Cup appearance, island-wide Blue Wave identity, and Caribbean color culture.',
    sponsorAngle:
      'Best for challenger-brand storytelling, tourism, music, travel, Caribbean retail, and underdog rewards.',
    sourceUrls: teamSources(CURACAO_BLUE_WAVE_URL),
  }),
  defineTeamIdentity({
    slug: 'ivory-coast',
    name: 'Ivory Coast',
    knownAs: 'Les Elephants',
    supportLine: 'Allez les Elephants',
    knownFor:
      'Elephants identity, orange-white-green support, and a heavyweight West African football tradition.',
    sponsorAngle:
      'Best for African diaspora campaigns, food, fashion, fintech, and bold product sampling.',
    sourceUrls: teamSources(),
  }),
  defineTeamIdentity({
    slug: 'ecuador',
    name: 'Ecuador',
    knownAs: 'La Tri',
    supportLine: 'Si se puede, Ecuador',
    knownFor:
      'La Tri identity, yellow-blue-red color, altitude-tested resilience, and growing South American momentum.',
    sponsorAngle:
      'Best for Hispanic-market campaigns, family viewing, food, travel, and youth-performance products.',
    sourceUrls: teamSources(),
  }),
  defineTeamIdentity({
    slug: 'netherlands',
    name: 'Netherlands',
    knownAs: 'Oranje',
    supportLine: 'Hup Holland Hup',
    knownFor:
      'Orange takeover visuals, total-football heritage, and traveling support that turns venues bright Oranje.',
    sponsorAngle:
      'Best for apparel, beer-adjacent hospitality, design, bikes, travel, and orange-themed reward drops.',
    sourceUrls: teamSources(),
  }),
  defineTeamIdentity({
    slug: 'japan',
    name: 'Japan',
    knownAs: 'Samurai Blue / サムライブルー',
    supportLine: 'Ganbare Nippon / がんばれ日本',
    knownFor:
      'Samurai Blue identity, organized supporter culture, and a reputation for disciplined, technical tournament football.',
    sponsorAngle:
      'Best for tech, gaming, anime-adjacent culture, convenience retail, and precise product experiences.',
    sourceUrls: teamSources(JFA_SAMURAI_BLUE_URL),
  }),
  defineTeamIdentity({
    slug: 'sweden',
    name: 'Sweden',
    knownAs: 'Blagult / The Blue and Yellow',
    supportLine: 'Heja Sverige',
    knownFor:
      'Blue-and-yellow identity, Scandinavian organization, and supporters known for clean visual color blocks.',
    sponsorAngle:
      'Best for design, outdoor, family, travel, music, and Nordic lifestyle reward campaigns.',
    sourceUrls: teamSources(),
  }),
  defineTeamIdentity({
    slug: 'tunisia',
    name: 'Tunisia',
    knownAs: 'Eagles of Carthage / نسور قرطاج',
    supportLine: 'Allez les Aigles / شجّع نسور قرطاج',
    knownFor:
      'Eagles of Carthage identity, red-white support, and proud North African tournament presence.',
    sponsorAngle:
      'Best for North African diaspora, travel, food, telecom, and Arabic/French-language fan rewards.',
    sourceUrls: teamSources(),
  }),
  defineTeamIdentity({
    slug: 'belgium',
    name: 'Belgium',
    knownAs: 'Red Devils / Diables Rouges / Rode Duivels',
    supportLine: 'Allez les Diables Rouges / Kom op Rode Duivels',
    knownFor:
      'Red Devils identity, trilingual fan culture, and elite-player-era tournament expectations.',
    sponsorAngle:
      'Best for multilingual European campaigns, chocolate/food, beer-adjacent hospitality, travel, and fintech.',
    sourceUrls: teamSources(),
  }),
  defineTeamIdentity({
    slug: 'egypt',
    name: 'Egypt',
    knownAs: 'The Pharaohs / الفراعنة',
    supportLine: 'Yalla ya Masr / يلا يا مصر',
    knownFor:
      'Pharaohs identity, red-white-black support, and one of Africa and the Arab world’s largest fan bases.',
    sponsorAngle:
      'Best for Arabic-language campaigns, diaspora viewing, food, streaming, fintech, and family prize drops.',
    sourceUrls: teamSources(),
  }),
  defineTeamIdentity({
    slug: 'iran',
    name: 'Iran',
    knownAs: 'Team Melli / تیم ملی',
    supportLine: 'Iran, Iran / ایران ایران',
    knownFor:
      'Team Melli identity, passionate Persian diaspora support, and consistent AFC tournament presence.',
    sponsorAngle:
      'Best for diaspora community campaigns, food, streaming, family rewards, and culturally aware messaging.',
    sourceUrls: teamSources(),
  }),
  defineTeamIdentity({
    slug: 'new-zealand',
    name: 'New Zealand',
    knownAs: 'All Whites',
    supportLine: 'Go All Whites',
    knownFor:
      'All Whites identity, clean white matchday color, and Oceania football pride on the global stage.',
    sponsorAngle:
      'Best for travel, outdoor, adventure, sustainability, and underdog fan rewards.',
    sourceUrls: teamSources(),
  }),
  defineTeamIdentity({
    slug: 'spain',
    name: 'Spain',
    knownAs: 'La Roja',
    supportLine: 'Vamos Espana',
    knownFor:
      'La Roja identity, red-and-gold support, and technical possession football recognized worldwide.',
    sponsorAngle:
      'Best for food, travel, fashion, streaming, and Spanish-language matchday campaigns.',
    sourceUrls: teamSources(),
  }),
  defineTeamIdentity({
    slug: 'cabo-verde',
    name: 'Cabo Verde',
    knownAs: 'Tubaroes Azuis / Blue Sharks',
    supportLine: 'Forca Cabo Verde',
    knownFor:
      'Blue Sharks identity, island-pride storytelling, and a breakthrough World Cup platform.',
    sponsorAngle:
      'Best for challenger brands, travel, music, seafood/food, diaspora community, and first-time qualifier stories.',
    sourceUrls: teamSources(),
  }),
  defineTeamIdentity({
    slug: 'saudi-arabia',
    name: 'Saudi Arabia',
    knownAs: 'Green Falcons / الاخضر',
    supportLine: 'Support the green / شجّع الأخضر',
    knownFor:
      'Green-and-white identity, Green Falcons nickname, AFC pedigree, and major Gulf-region supporter energy.',
    sponsorAngle:
      'Best for Arabic-language campaigns, Gulf travel, telecom, food, retail, and culture-driven match rewards.',
    sourceUrls: teamSources(SAUDI_GREEN_FALCONS_URL),
  }),
  defineTeamIdentity({
    slug: 'uruguay',
    name: 'Uruguay',
    knownAs: 'La Celeste / Los Charruas',
    supportLine: 'Vamos la Celeste',
    knownFor:
      'Sky-blue identity, historic World Cup pedigree, and compact-country football pride with global respect.',
    sponsorAngle:
      'Best for heritage storytelling, South American diaspora, sportswear, food, and premium fan bundles.',
    sourceUrls: teamSources(),
  }),
  defineTeamIdentity({
    slug: 'france',
    name: 'France',
    knownAs: 'Les Bleus',
    supportLine: 'Allez les Bleus',
    knownFor:
      'Blue identity, modern tournament dominance, and a stylish global fan base around elite football culture.',
    sponsorAngle:
      'Best for fashion, beauty, travel, food, luxury-adjacent, and premium product sampling.',
    sourceUrls: teamSources(),
  }),
  defineTeamIdentity({
    slug: 'senegal',
    name: 'Senegal',
    knownAs: 'Lions of Teranga',
    supportLine: 'Allez les Lions',
    knownFor:
      'Lions of Teranga identity, green-yellow-red support, and a proud West African football culture.',
    sponsorAngle:
      'Best for African diaspora, music, food, travel, fintech, and community-first reward campaigns.',
    sourceUrls: teamSources(),
  }),
  defineTeamIdentity({
    slug: 'iraq',
    name: 'Iraq',
    knownAs: 'Lions of Mesopotamia / اسود الرافدين',
    supportLine: 'Yalla Usood Al-Rafidain / يلا أسود الرافدين',
    knownFor:
      'Lions of Mesopotamia identity, green-white-red support, and deeply emotional national-team following.',
    sponsorAngle:
      'Best for Arabic-language diaspora campaigns, food, telecom, remittance, and family viewing rewards.',
    sourceUrls: teamSources(),
  }),
  defineTeamIdentity({
    slug: 'norway',
    name: 'Norway',
    knownAs: 'Red, White and Blue',
    supportLine: 'Heia Norge',
    knownFor:
      'Red-white-blue identity, Nordic supporter culture, and a new-generation attack with major global attention.',
    sponsorAngle:
      'Best for outdoor, travel, winter-to-summer sports, tech, and performance product campaigns.',
    sourceUrls: teamSources(),
  }),
  defineTeamIdentity({
    slug: 'argentina',
    name: 'Argentina',
    knownAs: 'La Albiceleste',
    supportLine: 'Vamos Argentina',
    knownFor:
      'White-and-sky-blue identity, world-champion aura, and emotional song-led supporter culture.',
    sponsorAngle:
      'Best for mass-reach consumer brands, food, streaming, apparel, and Spanish-language fan rewards.',
    sourceUrls: teamSources(),
  }),
  defineTeamIdentity({
    slug: 'algeria',
    name: 'Algeria',
    knownAs: 'Les Fennecs / الخضر',
    supportLine: 'Support the Fennecs / شجّع الخضر',
    knownFor:
      'Fennec fox identity, green-white support, and one of North Africa’s most intense football atmospheres.',
    sponsorAngle:
      'Best for North African diaspora, Arabic/French-language campaigns, food, telecom, and travel rewards.',
    sourceUrls: teamSources(),
  }),
  defineTeamIdentity({
    slug: 'austria',
    name: 'Austria',
    knownAs: 'Das Team / Unsere Burschen',
    supportLine: "Auf geht's Osterreich",
    knownFor:
      'Red-white-red identity, compact European football culture, and disciplined tournament support.',
    sponsorAngle:
      'Best for alpine travel, outdoor, coffee/food, transport, and precision-product campaigns.',
    sourceUrls: teamSources(),
  }),
  defineTeamIdentity({
    slug: 'jordan',
    name: 'Jordan',
    knownAs: 'Al Nashama / النشامى',
    supportLine: 'Yalla Nashama / يلا النشامى',
    knownFor:
      'Al Nashama identity, red-white-black-green support, and a breakthrough platform for Jordanian football pride.',
    sponsorAngle:
      'Best for Arabic-language family campaigns, telecom, food, travel, and first-time qualifier storytelling.',
    sourceUrls: teamSources(),
  }),
  defineTeamIdentity({
    slug: 'portugal',
    name: 'Portugal',
    knownAs: 'Selecao das Quinas',
    supportLine: 'Forca Portugal',
    knownFor:
      'Quinas identity, red-and-green support, and global star-driven tournament attention.',
    sponsorAngle:
      'Best for travel, food, apparel, streaming, fintech, and Portuguese diaspora campaigns.',
    sourceUrls: teamSources(),
  }),
  defineTeamIdentity({
    slug: 'dr-congo',
    name: 'DR Congo',
    knownAs: 'The Leopards / Les Leopards',
    supportLine: 'Allez les Leopards',
    knownFor:
      'Leopards identity, blue-red-yellow support, and a large, music-rich diaspora football culture.',
    sponsorAngle:
      'Best for African diaspora, music, fashion, fintech, food, and high-energy product sampling.',
    sourceUrls: teamSources(),
  }),
  defineTeamIdentity({
    slug: 'uzbekistan',
    name: 'Uzbekistan',
    knownAs: "White Wolves / Oq bo'rilar",
    supportLine: "Olga, O'zbekiston",
    knownFor:
      'White Wolves identity, blue-white support, and a first World Cup appearance built on rising Central Asian football momentum.',
    sponsorAngle:
      'Best for first-timer storytelling, travel, fintech, telecom, Central Asian diaspora, and challenger-brand rewards.',
    sourceUrls: teamSources(UZBEKISTAN_WHITE_WOLVES_URL),
  }),
  defineTeamIdentity({
    slug: 'colombia',
    name: 'Colombia',
    knownAs: 'Los Cafeteros',
    supportLine: 'Vamos Colombia',
    knownFor:
      'Coffee-growers identity, yellow shirt culture, and joyous South American supporter rhythm.',
    sponsorAngle:
      'Best for Hispanic-market campaigns, coffee/food, music, travel, and family rewards.',
    sourceUrls: teamSources(),
  }),
  defineTeamIdentity({
    slug: 'england',
    name: 'England',
    knownAs: 'Three Lions',
    supportLine: 'Come on England',
    knownFor:
      'Three Lions identity, white-red support, and massive English-language tournament attention.',
    sponsorAngle:
      'Best for retail, pubs, streaming, travel, apparel, and broad English-language fan campaigns.',
    sourceUrls: teamSources(),
  }),
  defineTeamIdentity({
    slug: 'croatia',
    name: 'Croatia',
    knownAs: 'Vatreni / Kockasti',
    supportLine: 'Naprijed Vatreni',
    knownFor:
      'Fiery Ones identity, red-white checkerboard culture, and a recent record of deep tournament runs.',
    sponsorAngle:
      'Best for diaspora, travel, apparel, food, and resilient-performance sponsor stories.',
    sourceUrls: teamSources(),
  }),
  defineTeamIdentity({
    slug: 'ghana',
    name: 'Ghana',
    knownAs: 'Black Stars',
    supportLine: 'Go Black Stars',
    knownFor:
      'Black Stars identity, red-yellow-green support, and joyful West African tournament energy.',
    sponsorAngle:
      'Best for African diaspora, music, fashion, food, fintech, and community reward campaigns.',
    sourceUrls: teamSources(),
  }),
  defineTeamIdentity({
    slug: 'panama',
    name: 'Panama',
    knownAs: 'Los Canaleros',
    supportLine: 'Vamos Panama',
    knownFor:
      'Canal Men identity, red-white-blue support, and Central American football pride.',
    sponsorAngle:
      'Best for Central American diaspora, logistics/travel storytelling, food, telecom, and family watch parties.',
    sourceUrls: teamSources(),
  }),
]

export const teamIdentityBySlug = Object.fromEntries(
  teamIdentities.map((identity) => [identity.slug, identity]),
) as Record<string, TeamIdentity>

export const teamIdentityByName = Object.fromEntries(
  teamIdentities.map((identity) => [identity.name, identity]),
) as Record<string, TeamIdentity>

export const teamIdentitiesByGroup = worldCupGroups.map((group) => ({
  ...group,
  teams: group.teams.map((team) => teamIdentityByName[team.name]),
}))

export function getTeamIdentityBySlug(slug: string) {
  return teamIdentityBySlug[slug] ?? null
}

export function getTeamIdentityByName(name: string) {
  return teamIdentityByName[name] ?? null
}
