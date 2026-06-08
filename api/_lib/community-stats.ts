type JsonRecord = Record<string, unknown>

export type LockedPlayerRow = {
  user_id: string
}

export type LockedBracketStatsRow = {
  user_id: string
  handle: string | null
  data: unknown
  updated_at?: string | null
}

export type HostMemberStatsRow = {
  user_id: string
}

export type ChampionDistributionItem = {
  code: string
  count: number
  pct: number
}

export type R32ConsensusItem = {
  matchIndex: number
  favourite: string | null
  pct: number
  total: number
  picks: ChampionDistributionItem[]
}

export type CommunityBracketSample = {
  name: string
  ar: string
  handle: string
  champ: string | null
  semis: string[]
  r32: string[]
  color: string
  updatedAt: string | null
}

export type CommunityStatsResponse = {
  players: number
  bracketsLocked: number
  hostsJoined: number
  championDistribution: ChampionDistributionItem[]
  r32Consensus: R32ConsensusItem[]
  communityBrackets: CommunityBracketSample[]
  source: {
    fallback: boolean
    generatedAt: string
  }
}

export type CommunityStatsInput = {
  lockedPlayers: LockedPlayerRow[]
  lockedBrackets: LockedBracketStatsRow[]
  hostMembers: HostMemberStatsRow[]
  generatedAt?: string
  fallback?: boolean
}

const CACHE_TTL_MS = 60_000
const PALETTE = ['#5C9CE6', '#F4D300', '#2A4BC6', '#E8203A', '#D81E2C', '#0E8A5F', '#9B6BFF', '#34E7FF']

let cachedCommunityStats:
  | {
      expiresAt: number
      data: CommunityStatsResponse
    }
  | null = null

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function dataRecord(value: unknown): JsonRecord | null {
  if (isRecord(value)) return value
  if (typeof value !== 'string' || !value.trim()) return null

  try {
    const parsed = JSON.parse(value) as unknown
    return isRecord(parsed) ? parsed : null
  } catch {
    return null
  }
}

function koFromData(data: unknown): JsonRecord | null {
  const record = dataRecord(data)
  if (!record || !isRecord(record.ko)) return null
  return record.ko
}

function stringFromKo(ko: JsonRecord | null, key: string): string | null {
  const value = ko?.[key]
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function championFromData(data: unknown): string | null {
  return stringFromKo(koFromData(data), 'r4m0')
}

function semifinalistsFromData(data: unknown): string[] {
  const ko = koFromData(data)
  return [0, 1, 2, 3]
    .map((index) => stringFromKo(ko, `r2m${index}`))
    .filter((value): value is string => Boolean(value))
}

function r32PicksFromData(data: unknown): string[] {
  const ko = koFromData(data)
  return Array.from({ length: 16 }, (_, index) => stringFromKo(ko, `r0m${index}`))
    .filter((value): value is string => Boolean(value))
}

function countValues(values: string[]): ChampionDistributionItem[] {
  const counts = new Map<string, number>()
  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1)
  }

  const total = values.length
  if (total === 0) return []

  return [...counts.entries()]
    .map(([code, count]) => ({
      code,
      count,
      pct: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count || a.code.localeCompare(b.code))
}

function topChampionsWithOther(values: string[]): ChampionDistributionItem[] {
  const counted = countValues(values)
  const top = counted.slice(0, 8)
  const rest = counted.slice(8)
  const otherCount = rest.reduce((total, item) => total + item.count, 0)
  const total = values.length

  if (otherCount > 0 && total > 0) {
    top.push({
      code: 'Other',
      count: otherCount,
      pct: Math.round((otherCount / total) * 100),
    })
  }

  return top
}

function uniqueCount(rows: { user_id: string }[]): number {
  return new Set(rows.map((row) => row.user_id).filter(Boolean)).size
}

function colorForHandle(handle: string): string {
  const sum = Array.from(handle).reduce((total, char) => total + char.charCodeAt(0), 0)
  return PALETTE[sum % PALETTE.length]
}

function displayHandle(handle: string): string {
  const clean = handle.trim()
  return clean.startsWith('@') ? clean : `@${clean}`
}

export function buildCommunityStats(input: CommunityStatsInput): CommunityStatsResponse {
  const lockedBrackets = input.lockedBrackets
  const champions = lockedBrackets
    .map((row) => championFromData(row.data))
    .filter((value): value is string => Boolean(value))

  return {
    players: uniqueCount(input.lockedPlayers),
    bracketsLocked: lockedBrackets.length,
    hostsJoined: uniqueCount(input.hostMembers),
    championDistribution: topChampionsWithOther(champions),
    r32Consensus: Array.from({ length: 16 }, (_, matchIndex) => {
      const picks = lockedBrackets
        .map((row) => stringFromKo(koFromData(row.data), `r0m${matchIndex}`))
        .filter((value): value is string => Boolean(value))
      const counted = countValues(picks)
      const favourite = counted[0] ?? null
      return {
        matchIndex,
        favourite: favourite?.code ?? null,
        pct: favourite?.pct ?? 0,
        total: picks.length,
        picks: counted,
      }
    }),
    communityBrackets: lockedBrackets
      .map((row) => ({ row, champion: championFromData(row.data) }))
      .filter(
        ({ row, champion }) =>
          Boolean(champion) &&
          typeof row.handle === 'string' &&
          row.handle.trim(),
      )
      .slice(0, 6)
      .map(({ row, champion }) => {
        const handle = displayHandle(row.handle as string)
        return {
          name: handle,
          ar: handle,
          handle,
          champ: champion,
          semis: semifinalistsFromData(row.data),
          r32: r32PicksFromData(row.data).slice(0, 6),
          color: colorForHandle(handle),
          updatedAt: row.updated_at ?? null,
        }
      }),
    source: {
      fallback: input.fallback ?? false,
      generatedAt: input.generatedAt ?? new Date().toISOString(),
    },
  }
}

export function emptyCommunityStats(fallback = true): CommunityStatsResponse {
  return buildCommunityStats({
    lockedPlayers: [],
    lockedBrackets: [],
    hostMembers: [],
    fallback,
  })
}

async function loadCommunityStatsFromDatabase(): Promise<CommunityStatsResponse | null> {
  const connectionString = process.env.PRIMARY_DB_CONNECTION_STRING
  if (!connectionString) return null

  try {
    const { neon } = await import('@neondatabase/serverless')
    const sql = neon(connectionString)
    const [lockedPlayers, lockedBrackets, hostMembers] = await Promise.all([
      sql.query(
        `
          select distinct user_id::text as user_id
          from (
            select user_id from brackets where locked = true
            union
            select user_id from group_picks where locked_at is not null
            union
            select user_id from predictions where locked_at is not null
          ) locked_users
        `,
        [],
      ) as unknown as Promise<LockedPlayerRow[]>,
      sql.query(
        `
          select
            brackets.user_id::text as user_id,
            users.handle,
            brackets.data,
            brackets.updated_at::text as updated_at
          from brackets
          join users on users.id = brackets.user_id
          where brackets.locked = true
          order by brackets.updated_at desc
        `,
        [],
      ) as unknown as Promise<LockedBracketStatsRow[]>,
      sql.query(
        'select distinct user_id::text as user_id from host_members',
        [],
      ) as unknown as Promise<HostMemberStatsRow[]>,
    ])

    return buildCommunityStats({
      lockedPlayers,
      lockedBrackets,
      hostMembers,
      fallback: false,
    })
  } catch {
    return null
  }
}

export async function loadCommunityStats(): Promise<CommunityStatsResponse> {
  const now = Date.now()

  if (cachedCommunityStats && cachedCommunityStats.expiresAt > now) {
    return cachedCommunityStats.data
  }

  const data = (await loadCommunityStatsFromDatabase()) ?? emptyCommunityStats(true)
  cachedCommunityStats = {
    expiresAt: now + CACHE_TTL_MS,
    data,
  }

  return data
}
