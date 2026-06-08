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

/** 48 qualified teams · code -> { n: EN name, ar: AR name, c: colour } */
export const TEAMS: Record<string, Team> = {
  MEX: { n: 'Mexico', ar: 'المكسيك', c: '#16A34A' }, RSA: { n: 'South Africa', ar: 'جنوب أفريقيا', c: '#1E9E5A' }, KOR: { n: 'South Korea', ar: 'كوريا الجنوبية', c: '#3E84E0' }, CZE: { n: 'Czech Republic', ar: 'التشيك', c: '#2D6CC0' },
  CAN: { n: 'Canada', ar: 'كندا', c: '#E03131' }, BIH: { n: 'Bosnia & Herzegovina', ar: 'البوسنة والهرسك', c: '#2D6CC0' }, QAT: { n: 'Qatar', ar: 'قطر', c: '#7A1F3D' }, SUI: { n: 'Switzerland', ar: 'سويسرا', c: '#D81E2C' },
  BRA: { n: 'Brazil', ar: 'البرازيل', c: '#F4D300' }, MAR: { n: 'Morocco', ar: 'المغرب', c: '#C0392B' }, HAI: { n: 'Haiti', ar: 'هايتي', c: '#2D6CC0' }, SCO: { n: 'Scotland', ar: 'اسكتلندا', c: '#2D6CC0' },
  USA: { n: 'USA', ar: 'الولايات المتحدة', c: '#3B63D6' }, PAR: { n: 'Paraguay', ar: 'باراغواي', c: '#C0392B' }, AUS: { n: 'Australia', ar: 'أستراليا', c: '#E6A817' }, TUR: { n: 'Turkey', ar: 'تركيا', c: '#C0392B' },
  GER: { n: 'Germany', ar: 'ألمانيا', c: '#9AA3B2' }, CUW: { n: 'Curaçao', ar: 'كوراساو', c: '#2D6CC0' }, CIV: { n: 'Ivory Coast', ar: 'ساحل العاج', c: '#E67018' }, ECU: { n: 'Ecuador', ar: 'الإكوادور', c: '#E6B800' },
  NED: { n: 'Netherlands', ar: 'هولندا', c: '#F47B20' }, JPN: { n: 'Japan', ar: 'اليابان', c: '#2740A6' }, SWE: { n: 'Sweden', ar: 'السويد', c: '#2D6CC0' }, TUN: { n: 'Tunisia', ar: 'تونس', c: '#C0392B' },
  BEL: { n: 'Belgium', ar: 'بلجيكا', c: '#D21F3C' }, EGY: { n: 'Egypt', ar: 'مصر', c: '#C0392B' }, IRN: { n: 'Iran', ar: 'إيران', c: '#1E9E5A' }, NZL: { n: 'New Zealand', ar: 'نيوزيلندا', c: '#2C3E50' },
  ESP: { n: 'Spain', ar: 'إسبانيا', c: '#D81E2C' }, CPV: { n: 'Cape Verde', ar: 'الرأس الأخضر', c: '#2D6CC0' }, KSA: { n: 'Saudi Arabia', ar: 'السعودية', c: '#0E7A3D' }, URU: { n: 'Uruguay', ar: 'الأوروغواي', c: '#4AA3DF' },
  FRA: { n: 'France', ar: 'فرنسا', c: '#2A4BC6' }, SEN: { n: 'Senegal', ar: 'السنغال', c: '#22B765' }, IRQ: { n: 'Iraq', ar: 'العراق', c: '#1E9E5A' }, NOR: { n: 'Norway', ar: 'النرويج', c: '#C0392B' },
  ARG: { n: 'Argentina', ar: 'الأرجنتين', c: '#5C9CE6' }, DZA: { n: 'Algeria', ar: 'الجزائر', c: '#1E9E5A' }, AUT: { n: 'Austria', ar: 'النمسا', c: '#D81E2C' }, JOR: { n: 'Jordan', ar: 'الأردن', c: '#8E2434' },
  POR: { n: 'Portugal', ar: 'البرتغال', c: '#0E8A5F' }, COD: { n: 'DR Congo', ar: 'جمهورية الكونغو الديمقراطية', c: '#2BA84A' }, UZB: { n: 'Uzbekistan', ar: 'أوزبكستان', c: '#1E9E8A' }, COL: { n: 'Colombia', ar: 'كولومبيا', c: '#E6B800' },
  ENG: { n: 'England', ar: 'إنجلترا', c: '#E8203A' }, CRO: { n: 'Croatia', ar: 'كرواتيا', c: '#3667C8' }, GHA: { n: 'Ghana', ar: 'غانا', c: '#2BA84A' }, PAN: { n: 'Panama', ar: 'بنما', c: '#A41E34' },
}

/** 12 groups, 4 teams each */
export const GROUPS: Record<string, string[]> = {
  A: ['MEX', 'RSA', 'KOR', 'CZE'], B: ['CAN', 'BIH', 'QAT', 'SUI'], C: ['BRA', 'MAR', 'HAI', 'SCO'],
  D: ['USA', 'PAR', 'AUS', 'TUR'], E: ['GER', 'CUW', 'CIV', 'ECU'], F: ['NED', 'JPN', 'SWE', 'TUN'],
  G: ['BEL', 'EGY', 'IRN', 'NZL'], H: ['ESP', 'CPV', 'KSA', 'URU'], I: ['FRA', 'SEN', 'IRQ', 'NOR'],
  J: ['ARG', 'DZA', 'AUT', 'JOR'], K: ['POR', 'COD', 'UZB', 'COL'], L: ['ENG', 'CRO', 'GHA', 'PAN'],
}
export const GROUP_KEYS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']

/** Round of 32 seeding template.
   W = group winner, R = runner-up, T = best-third index (0..7). */
export interface R32Ref { p: 'W' | 'R' | 'T'; g?: string; i?: number; label?: string }
export const R32_TEMPLATE: R32Ref[][] = [
  [{ p: 'R', g: 'A' }, { p: 'R', g: 'B' }], [{ p: 'W', g: 'E' }, { p: 'T', i: 0, label: '3A/B/C/D/F' }],
  [{ p: 'W', g: 'F' }, { p: 'R', g: 'C' }], [{ p: 'W', g: 'C' }, { p: 'R', g: 'F' }],
  [{ p: 'W', g: 'I' }, { p: 'T', i: 1, label: '3C/D/F/G/H' }], [{ p: 'R', g: 'E' }, { p: 'R', g: 'I' }],
  [{ p: 'W', g: 'A' }, { p: 'T', i: 2, label: '3C/E/F/H/I' }], [{ p: 'W', g: 'L' }, { p: 'T', i: 3, label: '3E/H/I/J/K' }],
  [{ p: 'W', g: 'D' }, { p: 'T', i: 4, label: '3B/E/F/I/J' }], [{ p: 'W', g: 'G' }, { p: 'T', i: 5, label: '3A/E/H/I/J' }],
  [{ p: 'R', g: 'K' }, { p: 'R', g: 'L' }], [{ p: 'W', g: 'H' }, { p: 'R', g: 'J' }],
  [{ p: 'W', g: 'B' }, { p: 'T', i: 6, label: '3E/F/G/I/J' }], [{ p: 'W', g: 'J' }, { p: 'R', g: 'H' }],
  [{ p: 'W', g: 'K' }, { p: 'T', i: 7, label: '3D/E/I/J/L' }], [{ p: 'R', g: 'D' }, { p: 'R', g: 'G' }],
]

// knockout round metadata: matches per round + points
export const KO_ROUNDS = [16, 8, 4, 2, 1]            // R32, R16, QF, SF, Final
export const KO_PTS = [10, 20, 40, 80, 160]
export const MAX_KO_PICKS = 16 + 8 + 4 + 2 + 1       // 31

/** group-stage quick pick'em (landing teaser) */
export interface Match { id: string; a: string; b: string; g: string; d: string; kickoffAt: string; venue: string; matchNumber: number; live?: boolean }
export const MATCHES: Match[] = [
  { id: 'match-1', a: 'MEX', b: 'RSA', g: 'A', d: 'Jun 11', kickoffAt: '2026-06-11T19:00:00.000Z', venue: 'Mexico City', matchNumber: 1, live: true },
  { id: 'match-2', a: 'KOR', b: 'CZE', g: 'A', d: 'Jun 11', kickoffAt: '2026-06-12T02:00:00.000Z', venue: 'Guadalajara (Zapopan)', matchNumber: 2 },
  { id: 'match-7', a: 'CAN', b: 'BIH', g: 'B', d: 'Jun 12', kickoffAt: '2026-06-12T19:00:00.000Z', venue: 'Toronto', matchNumber: 7 },
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
