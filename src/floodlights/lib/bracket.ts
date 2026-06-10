/* ============================================================
   FLOODLIGHTS — bracket resolution + share-link codec
   Shared by the Pick'em builder and the Public brackets page.
   Ported from js/pickem.js + js/brackets.js.
   ============================================================ */
import { GROUPS, GROUP_KEYS, KO_ROUNDS, R32_TEMPLATE } from '../data'
import type { R32Ref } from '../data'

export interface BracketState {
  groups: Record<string, string[]>
  thirds: string[]
  ko: Record<string, string>
  locked: boolean
}

export function emptyState(): BracketState {
  return { groups: {}, thirds: [], ko: {}, locked: false }
}

export function normalizeGroupRank(group: string, rank: unknown): string[] {
  const allowed = GROUPS[group]
  if (!allowed || !Array.isArray(rank)) return []

  const seen = new Set<string>()
  const next: string[] = []

  for (const value of rank) {
    if (typeof value !== 'string') continue
    const code = value.trim().toUpperCase()
    if (!allowed.includes(code) || seen.has(code)) continue
    seen.add(code)
    next.push(code)
    if (next.length >= 3) break
  }

  return next
}

export function rankGroupTeam(
  groups: Record<string, string[]>,
  group: string,
  code: string,
): string[] | null {
  if (!GROUPS[group]?.includes(code)) return null

  const rank = normalizeGroupRank(group, groups[group])
  const idx = rank.indexOf(code)
  if (idx >= 0) return rank.slice(0, idx)
  if (rank.length < 3) return [...rank, code]

  return [...rank.slice(0, 2), code]
}

/** normalise a possibly-partial saved object into a full BracketState */
export function normalize(b: Partial<BracketState> | null | undefined): BracketState {
  const groups: Record<string, string[]> = {}
  for (const group of GROUP_KEYS) {
    const rank = normalizeGroupRank(group, b?.groups?.[group])
    if (rank.length > 0) groups[group] = rank
  }

  const seenThirds = new Set<string>()
  const thirds = Array.isArray(b?.thirds)
    ? b.thirds
        .filter((group): group is string => typeof group === 'string')
        .filter((group) => {
          if (!GROUP_KEYS.includes(group) || seenThirds.has(group)) return false
          if (normalizeGroupRank(group, groups[group]).length < 3) return false
          seenThirds.add(group)
          return true
        })
        .slice(0, 8)
    : []

  return {
    groups,
    thirds,
    ko: b?.ko ?? {},
    locked: b?.locked ?? false,
  }
}

export function resolve(st: BracketState, ref: R32Ref): string | null {
  if (ref.p === 'W') return st.groups[ref.g as string]?.[0] ?? null
  if (ref.p === 'R') return st.groups[ref.g as string]?.[1] ?? null
  if (ref.p === 'T') {
    const g = st.thirds[ref.i as number]
    return g ? st.groups[g]?.[2] ?? null : null
  }
  return null
}

export const koKey = (r: number, m: number) => 'r' + r + 'm' + m
export const koPick = (st: BracketState, r: number, m: number): string | null => st.ko[koKey(r, m)] ?? null

export function teamsFor(st: BracketState, r: number, m: number): (string | null)[] {
  if (r === 0) return [resolve(st, R32_TEMPLATE[m][0]), resolve(st, R32_TEMPLATE[m][1])]
  return [koPick(st, r - 1, m * 2), koPick(st, r - 1, m * 2 + 1)]
}

export const champion = (st: BracketState): string | null => koPick(st, KO_ROUNDS.length - 1, 0)
export const koCount = (st: BracketState): number => Object.keys(st.ko).length

/* ---------------- share link codec ---------------- */
function b64e(s: string): string {
  return btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
function b64d(s: string): string {
  const t = s.replace(/-/g, '+').replace(/_/g, '/')
  return decodeURIComponent(escape(atob(t)))
}

export function encodeState(st: BracketState): string {
  const gs = GROUP_KEYS.map((g) => {
    const r = st.groups[g] || []
    let out = ''
    for (let i = 0; i < 3; i++) out += r[i] != null ? GROUPS[g].indexOf(r[i]) : '_'
    return out
  }).join('')
  let ts = ''
  for (let i = 0; i < 8; i++) ts += st.thirds[i] || '_'
  let ks = ''
  const snap: BracketState = { groups: st.groups, thirds: st.thirds, ko: {}, locked: false }
  for (let r = 0; r < KO_ROUNDS.length; r++) {
    for (let m = 0; m < KO_ROUNDS[r]; m++) {
      const key = koKey(r, m)
      const code = st.ko[key]
      if (code == null) {
        ks += '.'
        continue
      }
      const pair =
        r === 0
          ? [resolve(st, R32_TEMPLATE[m][0]), resolve(st, R32_TEMPLATE[m][1])]
          : [snap.ko['r' + (r - 1) + 'm' + m * 2], snap.ko['r' + (r - 1) + 'm' + (m * 2 + 1)]]
      ks += pair[1] === code ? '1' : '0'
      snap.ko[key] = code
    }
  }
  return b64e(gs + '~' + ts + '~' + ks)
}

export function decodeState(str: string): BracketState | null {
  let raw: string
  try {
    raw = b64d(str)
  } catch {
    return null
  }
  const parts = raw.split('~')
  if (parts.length < 3) return null
  const st = emptyState()
  const gs = parts[0]
  GROUP_KEYS.forEach((g, gi) => {
    const r: string[] = []
    for (let i = 0; i < 3; i++) {
      const ch = gs.charAt(gi * 3 + i)
      if (ch !== '_' && ch !== '') {
        const ix = +ch
        if (GROUPS[g][ix]) r.push(GROUPS[g][ix])
      }
    }
    if (r.length) st.groups[g] = r
  })
  for (let i = 0; i < parts[1].length; i++) {
    const ch = parts[1].charAt(i)
    if (ch !== '_') st.thirds.push(ch)
  }
  const ks = parts[2]
  let idx = 0
  const tmp: BracketState = { groups: st.groups, thirds: st.thirds, ko: {}, locked: false }
  for (let r = 0; r < KO_ROUNDS.length; r++) {
    for (let m = 0; m < KO_ROUNDS[r]; m++) {
      const bit = ks.charAt(idx++)
      if (bit !== '0' && bit !== '1') continue
      const pair =
        r === 0
          ? [resolve(tmp, R32_TEMPLATE[m][0]), resolve(tmp, R32_TEMPLATE[m][1])]
          : [tmp.ko['r' + (r - 1) + 'm' + m * 2], tmp.ko['r' + (r - 1) + 'm' + (m * 2 + 1)]]
      const code = pair[+bit]
      if (code) tmp.ko['r' + r + 'm' + m] = code
    }
  }
  st.ko = tmp.ko
  return st
}
