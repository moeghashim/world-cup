export type TeamKey =
  | 'brazil'
  | 'argentina'
  | 'usa'
  | 'france'
  | 'england'
  | 'spain'
  | 'morocco'
  | 'japan'

export type TeamTheme = {
  key: TeamKey
  name: string
  code: string
  chant: string
  mood: string
  colors: {
    primary: string
    secondary: string
    accent: string
    ink: string
    soft: string
  }
  supporterStats: {
    label: string
    value: string
  }[]
}

export type Match = {
  id: string
  stage: string
  kickoff: string
  venue: string
  home: TeamKey
  away: TeamKey
  pool: string
  oddsLabel: string
  winnerSlots: number
  demoResult: {
    homeScore: number
    awayScore: number
    winner: TeamKey | 'draw'
  }
  sponsorDrops: string[]
}

export type CommunityEntry = {
  id: string
  matchId: string
  name: string
  supporter: TeamKey
  winner: TeamKey | 'draw'
  homeScore: number
  awayScore: number
}

export type ShirtConcept = {
  conceptName: string
  motif: string
  primaryCopy: string
  alternateCopy: string
  note: string
  base: string
  graphic: string
  accent: string
}

export type ProviderRecommendation = {
  provider: string
  role: string
  reason: string
  risk: string
}

export function getTeam(key: TeamKey) {
  return teamThemes.find((team) => team.key === key) ?? teamThemes[0]
}

export const teamThemes: TeamTheme[] = [
  {
    key: 'brazil',
    name: 'Brazil',
    code: 'BRA',
    chant: 'Joga bonito',
    mood: 'Bright attack, fast overlaps, high-energy crowd',
    colors: {
      primary: '#139b4b',
      secondary: '#f6c900',
      accent: '#1b4fd8',
      ink: '#092115',
      soft: '#eaf8ce',
    },
    supporterStats: [
      { label: 'Fan streak', value: '6 picks' },
      { label: 'Exact-score boost', value: '2.5x' },
      { label: 'Sponsor tier', value: 'Gold' },
    ],
  },
  {
    key: 'argentina',
    name: 'Argentina',
    code: 'ARG',
    chant: 'Celeste surge',
    mood: 'Composed tempo, clean passing lanes, late drama',
    colors: {
      primary: '#69b3e7',
      secondary: '#ffffff',
      accent: '#d6a63f',
      ink: '#102238',
      soft: '#e8f5ff',
    },
    supporterStats: [
      { label: 'Fan streak', value: '4 picks' },
      { label: 'Exact-score boost', value: '2.2x' },
      { label: 'Sponsor tier', value: 'Silver' },
    ],
  },
  {
    key: 'usa',
    name: 'United States',
    code: 'USA',
    chant: 'Home roar',
    mood: 'Direct pace, wing pressure, stadium-wide noise',
    colors: {
      primary: '#1f4aa8',
      secondary: '#d91e36',
      accent: '#ffffff',
      ink: '#101c36',
      soft: '#eef3ff',
    },
    supporterStats: [
      { label: 'Fan streak', value: '5 picks' },
      { label: 'Exact-score boost', value: '2.0x' },
      { label: 'Sponsor tier', value: 'Gold' },
    ],
  },
  {
    key: 'france',
    name: 'France',
    code: 'FRA',
    chant: 'Blue line',
    mood: 'Explosive counters, calm midfield, ruthless finish',
    colors: {
      primary: '#193a8a',
      secondary: '#f4f2ee',
      accent: '#d3273e',
      ink: '#111a2f',
      soft: '#edf1ff',
    },
    supporterStats: [
      { label: 'Fan streak', value: '7 picks' },
      { label: 'Exact-score boost', value: '2.3x' },
      { label: 'Sponsor tier', value: 'Platinum' },
    ],
  },
  {
    key: 'england',
    name: 'England',
    code: 'ENG',
    chant: 'Three lines',
    mood: 'Set-piece pressure, compact shape, loud away end',
    colors: {
      primary: '#ffffff',
      secondary: '#c8102e',
      accent: '#1d3f8f',
      ink: '#182031',
      soft: '#f3f6fb',
    },
    supporterStats: [
      { label: 'Fan streak', value: '3 picks' },
      { label: 'Exact-score boost', value: '2.1x' },
      { label: 'Sponsor tier', value: 'Silver' },
    ],
  },
  {
    key: 'spain',
    name: 'Spain',
    code: 'ESP',
    chant: 'Red rhythm',
    mood: 'Patient possession, angled runs, late box arrivals',
    colors: {
      primary: '#d71920',
      secondary: '#ffcc00',
      accent: '#14213d',
      ink: '#2a1112',
      soft: '#fff3cc',
    },
    supporterStats: [
      { label: 'Fan streak', value: '5 picks' },
      { label: 'Exact-score boost', value: '2.4x' },
      { label: 'Sponsor tier', value: 'Gold' },
    ],
  },
  {
    key: 'morocco',
    name: 'Morocco',
    code: 'MAR',
    chant: 'Atlas wall',
    mood: 'Brave blocks, fast breaks, constant drums',
    colors: {
      primary: '#c1272d',
      secondary: '#006233',
      accent: '#f5d04c',
      ink: '#241414',
      soft: '#fbe9e8',
    },
    supporterStats: [
      { label: 'Fan streak', value: '6 picks' },
      { label: 'Exact-score boost', value: '2.6x' },
      { label: 'Sponsor tier', value: 'Gold' },
    ],
  },
  {
    key: 'japan',
    name: 'Japan',
    code: 'JPN',
    chant: 'Rising press',
    mood: 'Precise movement, quick traps, relentless second balls',
    colors: {
      primary: '#005bac',
      secondary: '#ffffff',
      accent: '#bc002d',
      ink: '#121f34',
      soft: '#edf6ff',
    },
    supporterStats: [
      { label: 'Fan streak', value: '4 picks' },
      { label: 'Exact-score boost', value: '2.2x' },
      { label: 'Sponsor tier', value: 'Silver' },
    ],
  },
]

export const matches: Match[] = [
  {
    id: 'bra-esp',
    stage: 'Featured fixture',
    kickoff: 'Matchday window',
    venue: 'North America Stadium',
    home: 'brazil',
    away: 'spain',
    pool: 'Gold sponsor pool',
    oddsLabel: 'Exact score opens bonus draw',
    winnerSlots: 8,
    demoResult: {
      homeScore: 2,
      awayScore: 1,
      winner: 'brazil',
    },
    sponsorDrops: ['Jersey credit', 'Travel miles', 'Pitch-side meal voucher'],
  },
  {
    id: 'usa-jpn',
    stage: 'Host spotlight',
    kickoff: 'Evening kickoff',
    venue: 'Continental Arena',
    home: 'usa',
    away: 'japan',
    pool: 'Home crowd pool',
    oddsLabel: 'Winner pick unlocks gift collection',
    winnerSlots: 6,
    demoResult: {
      homeScore: 1,
      awayScore: 1,
      winner: 'draw',
    },
    sponsorDrops: ['Fan kit bundle', 'Food delivery credit', 'Streaming pass'],
  },
  {
    id: 'arg-fra',
    stage: 'Knockout preview',
    kickoff: 'Prime-time kickoff',
    venue: 'Finals District',
    home: 'argentina',
    away: 'france',
    pool: 'Elite sponsor pool',
    oddsLabel: 'Clean-sheet pick doubles entries',
    winnerSlots: 10,
    demoResult: {
      homeScore: 1,
      awayScore: 2,
      winner: 'france',
    },
    sponsorDrops: ['Boot voucher', 'Hotel points', 'Retailer credit draw'],
  },
  {
    id: 'mar-eng',
    stage: 'Momentum match',
    kickoff: 'Afternoon kickoff',
    venue: 'Coastal Stadium',
    home: 'morocco',
    away: 'england',
    pool: 'Underdog pool',
    oddsLabel: 'Upset pick gets entry boost',
    winnerSlots: 5,
    demoResult: {
      homeScore: 2,
      awayScore: 0,
      winner: 'morocco',
    },
    sponsorDrops: ['Watch party pack', 'Merch voucher', 'VIP draw entry'],
  },
]

export const sponsorRewards = [
  {
    title: 'Sponsor Gift Collection',
    value: '3 drops',
    detail: 'Unlocked when a winner pick lands.',
  },
  {
    title: 'Exact Score Bonus',
    value: '$500',
    detail: 'Retailer credit draw for perfect scorelines.',
  },
  {
    title: 'Supporter Streak',
    value: '2x',
    detail: 'Extra entries after three correct picks.',
  },
]

export const shirtConcepts: Record<TeamKey, ShirtConcept> = {
  brazil: {
    conceptName: 'Canary Street Rhythm',
    motif: 'Wave tiles, sunburst motion, and percussion-inspired dots.',
    primaryCopy: 'Brazil Believes',
    alternateCopy: 'Vamos Sonhar',
    note: 'Bright supporter art inspired by match-day street energy.',
    base: '#f6c900',
    graphic: '#139b4b',
    accent: '#1b4fd8',
  },
  argentina: {
    conceptName: 'Skyline Albiceleste',
    motif: 'Soft sky bands, horizon lines, and a warm sun-circle abstraction.',
    primaryCopy: 'Dream in Blue',
    alternateCopy: 'Vamos Argentina',
    note: 'A calm blue-and-white supporter piece without replica kit striping.',
    base: '#ffffff',
    graphic: '#69b3e7',
    accent: '#d6a63f',
  },
  usa: {
    conceptName: 'Stateside Rally',
    motif: 'Abstract star fields, road-line geometry, and stadium lights.',
    primaryCopy: 'All In',
    alternateCopy: 'Raise the Red, White & Blue',
    note: 'Bold fanwear with modular Americana geometry.',
    base: '#101c36',
    graphic: '#d91e36',
    accent: '#ffffff',
  },
  france: {
    conceptName: 'Bleu Moderne',
    motif: 'Art-deco geometry, tricolor rhythm, and feather-like linework.',
    primaryCopy: 'Allez Les Bleus',
    alternateCopy: 'Tous Ensemble',
    note: 'Elegant dark-blue supporter design with restrained border detail.',
    base: '#193a8a',
    graphic: '#f4f2ee',
    accent: '#d3273e',
  },
  england: {
    conceptName: 'Terrace Rose Abstract',
    motif: 'Abstract rose petals, terrace banner lines, and subtle cross geometry.',
    primaryCopy: 'Believe Together',
    alternateCopy: 'Come On England',
    note: 'A white supporter shirt that avoids crest and shield framing.',
    base: '#ffffff',
    graphic: '#c8102e',
    accent: '#1d3f8f',
  },
  spain: {
    conceptName: 'La Roja Rhythm',
    motif: 'Fan scarf geometry, plaza tile patterns, and festival motion lines.',
    primaryCopy: 'Vamos La Roja',
    alternateCopy: 'Corazon y Juego',
    note: 'Warm red-and-gold fanwear with tile-pattern detail.',
    base: '#d71920',
    graphic: '#ffcc00',
    accent: '#14213d',
  },
  morocco: {
    conceptName: 'Atlas Pulse',
    motif: 'Atlas mountain lines and zellige-inspired abstract geometry.',
    primaryCopy: 'Dima Maghrib',
    alternateCopy: 'Atlas Energy',
    note: 'Pattern-rich supporter design with respectful geometric references.',
    base: '#c1272d',
    graphic: '#006233',
    accent: '#f5d04c',
  },
  japan: {
    conceptName: 'Rising Motion',
    motif: 'Minimal sun disc, brushstroke movement, and origami-like folds.',
    primaryCopy: 'Rising Together',
    alternateCopy: 'Nippon Spirit',
    note: 'Minimal supporter art with clean negative space.',
    base: '#ffffff',
    graphic: '#bc002d',
    accent: '#005bac',
  },
}

export const communityEntries: CommunityEntry[] = [
  {
    id: 'e-1001',
    matchId: 'bra-esp',
    name: 'Ana R.',
    supporter: 'brazil',
    winner: 'brazil',
    homeScore: 2,
    awayScore: 1,
  },
  {
    id: 'e-1002',
    matchId: 'bra-esp',
    name: 'Mateo G.',
    supporter: 'spain',
    winner: 'spain',
    homeScore: 1,
    awayScore: 2,
  },
  {
    id: 'e-1003',
    matchId: 'bra-esp',
    name: 'Priya S.',
    supporter: 'japan',
    winner: 'brazil',
    homeScore: 3,
    awayScore: 1,
  },
  {
    id: 'e-1004',
    matchId: 'bra-esp',
    name: 'Lucas M.',
    supporter: 'argentina',
    winner: 'draw',
    homeScore: 1,
    awayScore: 1,
  },
  {
    id: 'e-1005',
    matchId: 'bra-esp',
    name: 'Noah T.',
    supporter: 'usa',
    winner: 'brazil',
    homeScore: 2,
    awayScore: 0,
  },
  {
    id: 'e-1006',
    matchId: 'bra-esp',
    name: 'Marina F.',
    supporter: 'france',
    winner: 'brazil',
    homeScore: 2,
    awayScore: 1,
  },
  {
    id: 'e-1007',
    matchId: 'bra-esp',
    name: 'Samir B.',
    supporter: 'morocco',
    winner: 'brazil',
    homeScore: 1,
    awayScore: 0,
  },
  {
    id: 'e-1008',
    matchId: 'bra-esp',
    name: 'Hugo P.',
    supporter: 'england',
    winner: 'spain',
    homeScore: 0,
    awayScore: 1,
  },
  {
    id: 'e-1009',
    matchId: 'bra-esp',
    name: 'Clara V.',
    supporter: 'brazil',
    winner: 'brazil',
    homeScore: 4,
    awayScore: 2,
  },
  {
    id: 'e-1010',
    matchId: 'bra-esp',
    name: 'Kenji O.',
    supporter: 'japan',
    winner: 'brazil',
    homeScore: 2,
    awayScore: 1,
  },

  {
    id: 'e-2001',
    matchId: 'usa-jpn',
    name: 'Emily C.',
    supporter: 'usa',
    winner: 'usa',
    homeScore: 2,
    awayScore: 1,
  },
  {
    id: 'e-2002',
    matchId: 'usa-jpn',
    name: 'Daichi K.',
    supporter: 'japan',
    winner: 'draw',
    homeScore: 1,
    awayScore: 1,
  },
  {
    id: 'e-2003',
    matchId: 'usa-jpn',
    name: 'Omar H.',
    supporter: 'morocco',
    winner: 'draw',
    homeScore: 0,
    awayScore: 0,
  },
  {
    id: 'e-2004',
    matchId: 'usa-jpn',
    name: 'Sofia L.',
    supporter: 'spain',
    winner: 'japan',
    homeScore: 1,
    awayScore: 2,
  },
  {
    id: 'e-2005',
    matchId: 'usa-jpn',
    name: 'Theo B.',
    supporter: 'france',
    winner: 'draw',
    homeScore: 2,
    awayScore: 2,
  },
  {
    id: 'e-2006',
    matchId: 'usa-jpn',
    name: 'Jack W.',
    supporter: 'england',
    winner: 'usa',
    homeScore: 1,
    awayScore: 0,
  },
  {
    id: 'e-2007',
    matchId: 'usa-jpn',
    name: 'Valen A.',
    supporter: 'argentina',
    winner: 'draw',
    homeScore: 1,
    awayScore: 1,
  },

  {
    id: 'e-3001',
    matchId: 'arg-fra',
    name: 'Camila A.',
    supporter: 'argentina',
    winner: 'argentina',
    homeScore: 2,
    awayScore: 1,
  },
  {
    id: 'e-3002',
    matchId: 'arg-fra',
    name: 'Julien D.',
    supporter: 'france',
    winner: 'france',
    homeScore: 1,
    awayScore: 2,
  },
  {
    id: 'e-3003',
    matchId: 'arg-fra',
    name: 'Ava N.',
    supporter: 'usa',
    winner: 'france',
    homeScore: 0,
    awayScore: 2,
  },
  {
    id: 'e-3004',
    matchId: 'arg-fra',
    name: 'Rafael P.',
    supporter: 'brazil',
    winner: 'draw',
    homeScore: 2,
    awayScore: 2,
  },
  {
    id: 'e-3005',
    matchId: 'arg-fra',
    name: 'Yuki T.',
    supporter: 'japan',
    winner: 'france',
    homeScore: 1,
    awayScore: 3,
  },
  {
    id: 'e-3006',
    matchId: 'arg-fra',
    name: 'Nora E.',
    supporter: 'england',
    winner: 'france',
    homeScore: 1,
    awayScore: 2,
  },
  {
    id: 'e-3007',
    matchId: 'arg-fra',
    name: 'Bilal Z.',
    supporter: 'morocco',
    winner: 'france',
    homeScore: 0,
    awayScore: 1,
  },
  {
    id: 'e-3008',
    matchId: 'arg-fra',
    name: 'Ines R.',
    supporter: 'spain',
    winner: 'argentina',
    homeScore: 1,
    awayScore: 0,
  },

  {
    id: 'e-4001',
    matchId: 'mar-eng',
    name: 'Youssef A.',
    supporter: 'morocco',
    winner: 'morocco',
    homeScore: 2,
    awayScore: 0,
  },
  {
    id: 'e-4002',
    matchId: 'mar-eng',
    name: 'Maya K.',
    supporter: 'japan',
    winner: 'draw',
    homeScore: 1,
    awayScore: 1,
  },
  {
    id: 'e-4003',
    matchId: 'mar-eng',
    name: 'Oliver H.',
    supporter: 'england',
    winner: 'england',
    homeScore: 0,
    awayScore: 1,
  },
  {
    id: 'e-4004',
    matchId: 'mar-eng',
    name: 'Leila M.',
    supporter: 'morocco',
    winner: 'morocco',
    homeScore: 1,
    awayScore: 0,
  },
  {
    id: 'e-4005',
    matchId: 'mar-eng',
    name: 'Diego C.',
    supporter: 'spain',
    winner: 'morocco',
    homeScore: 2,
    awayScore: 0,
  },
  {
    id: 'e-4006',
    matchId: 'mar-eng',
    name: 'Mina S.',
    supporter: 'france',
    winner: 'morocco',
    homeScore: 3,
    awayScore: 1,
  },
]

export const providerRecommendations: ProviderRecommendation[] = [
  {
    provider: 'Gelato',
    role: 'Primary global T-shirt POD',
    reason: 'Best fit when winners are spread across many countries because production can happen close to the recipient.',
    risk: 'Not a true sponsor-product kitting solution; use it for shirts, not gift boxes.',
  },
  {
    provider: 'Printful',
    role: 'Branded fulfillment backup',
    reason: 'Mature API, mockups, order webhooks, and better light warehousing options for inserts or small stocked items.',
    risk: 'Warehousing and pack-ins add operational fees and require regional stock planning.',
  },
  {
    provider: '3PL or kitting partner',
    role: 'Sponsor package fulfillment',
    reason: 'Real products from sponsors need inventory, packing rules, customs handling, and shipment tracking.',
    risk: 'Requires sponsor item receiving, SKU controls, and review-trigger logic after delivery.',
  },
  {
    provider: 'Stripe Projects',
    role: 'Provisioning and spend controls',
    reason: 'Use it to add hosting, database, auth, analytics, observability, and AI providers from the CLI with spend limits.',
    risk: 'It does not replace payments, contest compliance, POD APIs, or 3PL operations.',
  },
]
