/* ============================================================
   FLOODLIGHTS — data layer (48-team World Cup 2026)
   Ported from floodlights/js/data.js into a typed module.
   ============================================================ */

export interface Team {
  /** English name */
  n: string
  /** Arabic name */
  ar: string
  /** brand colour for the flag disc */
  c: string
}

/** 48 teams · code -> { n: EN name, ar: AR name, c: colour } */
export const TEAMS: Record<string, Team> = {
  MEX: { n: 'Mexico', ar: 'المكسيك', c: '#16A34A' }, KOR: { n: 'South Korea', ar: 'كوريا الجنوبية', c: '#3E84E0' }, CRO: { n: 'Croatia', ar: 'كرواتيا', c: '#3667C8' }, NOR: { n: 'Norway', ar: 'النرويج', c: '#C0392B' },
  CAN: { n: 'Canada', ar: 'كندا', c: '#E03131' }, MAR: { n: 'Morocco', ar: 'المغرب', c: '#C0392B' }, JPN: { n: 'Japan', ar: 'اليابان', c: '#2740A6' }, SCO: { n: 'Scotland', ar: 'اسكتلندا', c: '#2D6CC0' },
  USA: { n: 'USA', ar: 'الولايات المتحدة', c: '#3B63D6' }, SEN: { n: 'Senegal', ar: 'السنغال', c: '#22B765' }, POL: { n: 'Poland', ar: 'بولندا', c: '#D81E5B' }, QAT: { n: 'Qatar', ar: 'قطر', c: '#7A1F3D' },
  ARG: { n: 'Argentina', ar: 'الأرجنتين', c: '#5C9CE6' }, AUS: { n: 'Australia', ar: 'أستراليا', c: '#E6A817' }, EGY: { n: 'Egypt', ar: 'مصر', c: '#C0392B' }, UZB: { n: 'Uzbekistan', ar: 'أوزبكستان', c: '#1E9E8A' },
  FRA: { n: 'France', ar: 'فرنسا', c: '#2A4BC6' }, JOR: { n: 'Jordan', ar: 'الأردن', c: '#8E2434' }, ECU: { n: 'Ecuador', ar: 'الإكوادور', c: '#E6B800' }, CIV: { n: "Côte d'Ivoire", ar: 'ساحل العاج', c: '#E67018' },
  BRA: { n: 'Brazil', ar: 'البرازيل', c: '#F4D300' }, CRC: { n: 'Costa Rica', ar: 'كوستاريكا', c: '#C0392B' }, IRN: { n: 'Iran', ar: 'إيران', c: '#1E9E5A' }, GHA: { n: 'Ghana', ar: 'غانا', c: '#2BA84A' },
  ESP: { n: 'Spain', ar: 'إسبانيا', c: '#D81E2C' }, URU: { n: 'Uruguay', ar: 'الأوروغواي', c: '#4AA3DF' }, TUN: { n: 'Tunisia', ar: 'تونس', c: '#C0392B' }, NZL: { n: 'New Zealand', ar: 'نيوزيلندا', c: '#2C3E50' },
  ENG: { n: 'England', ar: 'إنجلترا', c: '#E8203A' }, SUI: { n: 'Switzerland', ar: 'سويسرا', c: '#D81E2C' }, KSA: { n: 'Saudi Arabia', ar: 'السعودية', c: '#0E7A3D' }, PAN: { n: 'Panama', ar: 'بنما', c: '#A41E34' },
  POR: { n: 'Portugal', ar: 'البرتغال', c: '#0E8A5F' }, NED: { n: 'Netherlands', ar: 'هولندا', c: '#F47B20' }, PAR: { n: 'Paraguay', ar: 'باراغواي', c: '#C0392B' }, RSA: { n: 'South Africa', ar: 'جنوب أفريقيا', c: '#1E9E5A' },
  GER: { n: 'Germany', ar: 'ألمانيا', c: '#9AA3B2' }, BEL: { n: 'Belgium', ar: 'بلجيكا', c: '#D21F3C' }, COL: { n: 'Colombia', ar: 'كولومبيا', c: '#E6B800' }, DZA: { n: 'Algeria', ar: 'الجزائر', c: '#1E9E5A' },
  ITA: { n: 'Italy', ar: 'إيطاليا', c: '#3667C8' }, NGA: { n: 'Nigeria', ar: 'نيجيريا', c: '#1E9E5A' }, DEN: { n: 'Denmark', ar: 'الدنمارك', c: '#C0392B' }, HON: { n: 'Honduras', ar: 'هندوراس', c: '#4AA3DF' },
  SRB: { n: 'Serbia', ar: 'صربيا', c: '#B83246' }, CMR: { n: 'Cameroon', ar: 'الكاميرون', c: '#1E9E5A' }, PER: { n: 'Peru', ar: 'بيرو', c: '#D81E2C' }, SVN: { n: 'Slovenia', ar: 'سلوفينيا', c: '#2D6CC0' },
}

/** 12 groups, 4 teams each */
export const GROUPS: Record<string, string[]> = {
  A: ['MEX', 'KOR', 'CRO', 'NOR'], B: ['CAN', 'MAR', 'JPN', 'SCO'], C: ['USA', 'SEN', 'POL', 'QAT'],
  D: ['ARG', 'AUS', 'EGY', 'UZB'], E: ['FRA', 'JOR', 'ECU', 'CIV'], F: ['BRA', 'CRC', 'IRN', 'GHA'],
  G: ['ESP', 'URU', 'TUN', 'NZL'], H: ['ENG', 'SUI', 'KSA', 'PAN'], I: ['POR', 'NED', 'PAR', 'RSA'],
  J: ['GER', 'BEL', 'COL', 'DZA'], K: ['ITA', 'NGA', 'DEN', 'HON'], L: ['SRB', 'CMR', 'PER', 'SVN'],
}
export const GROUP_KEYS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']

/** Round of 32 seeding template.
   W = group winner, R = runner-up, T = best-third index (0..7). */
export interface R32Ref { p: 'W' | 'R' | 'T'; g?: string; i?: number }
export const R32_TEMPLATE: R32Ref[][] = [
  [{ p: 'W', g: 'A' }, { p: 'R', g: 'B' }], [{ p: 'W', g: 'C' }, { p: 'R', g: 'D' }],
  [{ p: 'W', g: 'E' }, { p: 'R', g: 'F' }], [{ p: 'W', g: 'G' }, { p: 'R', g: 'H' }],
  [{ p: 'W', g: 'I' }, { p: 'R', g: 'J' }], [{ p: 'W', g: 'K' }, { p: 'R', g: 'L' }],
  [{ p: 'W', g: 'B' }, { p: 'T', i: 0 }], [{ p: 'W', g: 'D' }, { p: 'T', i: 1 }],
  [{ p: 'W', g: 'F' }, { p: 'T', i: 2 }], [{ p: 'W', g: 'H' }, { p: 'T', i: 3 }],
  [{ p: 'W', g: 'J' }, { p: 'T', i: 4 }], [{ p: 'W', g: 'L' }, { p: 'T', i: 5 }],
  [{ p: 'R', g: 'A' }, { p: 'T', i: 6 }], [{ p: 'R', g: 'C' }, { p: 'T', i: 7 }],
  [{ p: 'R', g: 'E' }, { p: 'R', g: 'G' }], [{ p: 'R', g: 'I' }, { p: 'R', g: 'K' }],
]

// knockout round metadata: matches per round + points
export const KO_ROUNDS = [16, 8, 4, 2, 1]            // R32, R16, QF, SF, Final
export const KO_PTS = [10, 20, 40, 80, 160]
export const MAX_KO_PICKS = 16 + 8 + 4 + 2 + 1       // 31

/** crowd consensus (% backing the FIRST slot of each R32 match) */
export const CROWD_R32 = [74, 63, 68, 57, 71, 49, 80, 77, 66, 72, 61, 58, 44, 52, 53, 47]

/** most-picked champions (community sample) */
export interface ChampPick { code: string; pct: number }
export const CROWD_CHAMPION: ChampPick[] = [
  { code: 'ARG', pct: 21 }, { code: 'BRA', pct: 18 }, { code: 'FRA', pct: 15 }, { code: 'ESP', pct: 12 },
  { code: 'ENG', pct: 10 }, { code: 'POR', pct: 8 }, { code: 'GER', pct: 7 }, { code: 'NED', pct: 5 }, { code: 'Other', pct: 4 },
]

/** sample community brackets for compare */
export interface CommunityBracket { name: string; ar: string; handle: string; pts: number; champ: string; semis: string[]; color: string }
export const COMMUNITY: CommunityBracket[] = [
  { name: 'Sofia R.', ar: 'صوفيا ر.', handle: '@sofiastrikes', pts: 560, champ: 'ARG', semis: ['ARG', 'BRA', 'ESP', 'ENG'], color: '#5C9CE6' },
  { name: 'Diego M.', ar: 'دييغو م.', handle: '@diego10', pts: 535, champ: 'BRA', semis: ['BRA', 'FRA', 'ARG', 'POR'], color: '#F4D300' },
  { name: 'Amara K.', ar: 'أمارة ك.', handle: '@amara_k', pts: 510, champ: 'FRA', semis: ['FRA', 'ENG', 'ESP', 'NED'], color: '#2A4BC6' },
  { name: 'Liam O.', ar: 'ليام أو.', handle: '@coolhandliam', pts: 486, champ: 'ENG', semis: ['ENG', 'ARG', 'BRA', 'GER'], color: '#E8203A' },
  { name: 'Yuki T.', ar: 'يوكي ت.', handle: '@yukit', pts: 454, champ: 'ESP', semis: ['ESP', 'POR', 'FRA', 'ARG'], color: '#D81E2C' },
  { name: 'Noah B.', ar: 'نواه ب.', handle: '@noahb', pts: 441, champ: 'POR', semis: ['POR', 'NED', 'ENG', 'BRA'], color: '#0E8A5F' },
]

/** group-stage quick pick'em (landing teaser) */
export interface Match { a: string; b: string; g: string; d: string; j: number; live?: boolean }
export const MATCHES: Match[] = [
  { a: 'MEX', b: 'KOR', g: 'A', d: 'Jun 11', j: 317, live: true },
  { a: 'USA', b: 'SEN', g: 'C', d: 'Jun 12', j: 482 },
  { a: 'BRA', b: 'GHA', g: 'F', d: 'Jun 12', j: 901 },
]

/** sponsors (with generated logo marks + roles) */
export type SponsorMarkType = 'play' | 'drop' | 'rings' | 'arrow' | 'star' | 'hex'
export interface Sponsor { id: string; name: string; c: string; mark: SponsorMarkType; role: string }
export const SPONSORS: Sponsor[] = [
  { id: 'matchday', name: 'Matchday Studio', c: '#C9FF3D', mark: 'play', role: 'presenting' },
  { id: 'prizedrop', name: 'Prize Drop', c: '#34E7FF', mark: 'drop', role: 'prize' },
  { id: 'culture', name: 'Culture Kit', c: '#FFC23D', mark: 'rings', role: 'match' },
  { id: 'journey', name: 'Team Journey', c: '#FF2E9B', mark: 'arrow', role: 'match' },
  { id: 'fanlab', name: 'Fan Review Lab', c: '#9B6BFF', mark: 'star', role: 'spot' },
  { id: 'pitch', name: 'Pitch & Co', c: '#4ADE80', mark: 'hex', role: 'spot' },
]
export function sponsorById(id: string): Sponsor | undefined {
  return SPONSORS.find((s) => s.id === id)
}
