import { randomBytes } from 'node:crypto'
import { HttpError } from './http.js'
import { sql } from './db.js'
import type { HostRow } from '../../db/types.js'

type JsonRecord = Record<string, unknown>

type HostMemberQueryRow = {
  handle: string | null
  bracket_data: unknown
  joined_at: string
}

type PredictionConsensusRow = {
  match_id: string
  pick: string
  count: string | number
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

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function normalizeHostName(value: unknown): string {
  if (typeof value !== 'string') {
    throw new HttpError(400, 'bad_request', 'Enter a host name.')
  }

  const name = value.trim().replace(/\s+/g, ' ')
  if (name.length < 2 || name.length > 80) {
    throw new HttpError(400, 'bad_request', 'Use 2-80 characters for the host name.')
  }

  return name
}

export function slugifyHostName(name: string): string {
  const slug = name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 44)

  return slug || 'host'
}

export function normalizeJoinCode(value: unknown): string {
  if (typeof value !== 'string') {
    throw new HttpError(400, 'bad_request', 'Enter a host code.')
  }

  const code = value.trim().replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
  if (!/^[A-Z0-9]{6}$/.test(code)) {
    throw new HttpError(400, 'bad_request', 'Enter the 6-character host code.')
  }

  return code
}

export function normalizeHostSlug(value: unknown): string {
  if (typeof value !== 'string') {
    throw new HttpError(400, 'bad_request', 'Enter a host link or code.')
  }

  const slug = value
    .trim()
    .toLowerCase()
    .replace(/^\/?h\//, '')
    .replace(/[?#].*$/, '')

  if (!/^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$/.test(slug)) {
    throw new HttpError(400, 'bad_request', 'Enter a valid host link.')
  }

  return slug
}

function randomCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const bytes = randomBytes(6)
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join('')
}

function mapHost(row: HostRow, memberCount = 0): HostSummary {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    code: row.join_code,
    publicPath: `/h/${row.slug}`,
    joinPath: `/h/${row.slug}?join=${row.join_code}`,
    memberCount,
  }
}

function championFromBracket(data: unknown): string | null {
  if (!isRecord(data)) return null
  const ko = data.ko
  if (!isRecord(ko)) return null
  const champion = ko.r4m0
  return typeof champion === 'string' && champion ? champion : null
}

function mostFrequent(values: (string | null)[]): string | null {
  const counts = new Map<string, number>()
  for (const value of values) {
    if (!value) continue
    counts.set(value, (counts.get(value) ?? 0) + 1)
  }

  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0]?.[0] ?? null
}

function withSuffix(slug: string, attempt: number): string {
  if (attempt === 0) return slug
  const suffix = `-${attempt + 1}`
  return `${slug.slice(0, 63 - suffix.length)}${suffix}`
}

export async function createHostForUser(
  userId: string,
  hostName: unknown,
): Promise<HostSummary> {
  const name = normalizeHostName(hostName)
  const baseSlug = slugifyHostName(name)

  for (let attempt = 0; attempt < 8; attempt++) {
    const slug = withSuffix(baseSlug, attempt)
    const joinCode = randomCode()

    try {
      const rows = (await sql.query(
        `
          insert into hosts (slug, join_code, name, owner_user_id)
          values ($1, $2, $3, $4)
          returning *
        `,
        [slug, joinCode, name, userId],
      )) as HostRow[]

      const host = rows[0]
      if (!host) throw new Error('Host insert did not return a row.')

      await joinHostById(host.id, userId)
      return mapHost(host, 1)
    } catch (error) {
      if (
        typeof error === 'object' &&
        error &&
        'code' in error &&
        error.code === '23505'
      ) {
        continue
      }

      throw error
    }
  }

  throw new HttpError(409, 'host_slug_taken', 'Try a different host name.')
}

async function joinHostById(hostId: string, userId: string): Promise<void> {
  await sql.query(
    `
      insert into host_members (host_id, user_id)
      values ($1, $2)
      on conflict (host_id, user_id) do nothing
    `,
    [hostId, userId],
  )
}

export async function joinHostForUser({
  slug,
  code,
  userId,
}: {
  slug?: unknown
  code?: unknown
  userId: string
}): Promise<HostSummary> {
  let hostRows: HostRow[]

  if (code !== undefined && String(code).trim()) {
    hostRows = (await sql.query(
      'select * from hosts where join_code = $1 limit 1',
      [normalizeJoinCode(code)],
    )) as HostRow[]
  } else {
    hostRows = (await sql.query(
      'select * from hosts where slug = $1 limit 1',
      [normalizeHostSlug(slug)],
    )) as HostRow[]
  }

  const host = hostRows[0]
  if (!host) {
    throw new HttpError(404, 'host_not_found', 'Host not found.')
  }

  await joinHostById(host.id, userId)
  const countRows = (await sql.query(
    'select count(*)::int as count from host_members where host_id = $1',
    [host.id],
  )) as { count: number }[]

  return mapHost(host, Number(countRows[0]?.count ?? 0))
}

export async function loadPublicHost(slugInput: unknown): Promise<PublicHost> {
  const slug = normalizeHostSlug(slugInput)
  const rows = (await sql.query(
    'select * from hosts where slug = $1 limit 1',
    [slug],
  )) as HostRow[]
  const host = rows[0]

  if (!host) {
    throw new HttpError(404, 'host_not_found', 'Host not found.')
  }

  const memberRows = (await sql.query(
    `
      select
        users.handle,
        brackets.data as bracket_data,
        host_members.joined_at
      from host_members
      join users on users.id = host_members.user_id
      left join brackets on brackets.user_id = users.id
      where host_members.host_id = $1
        and users.handle is not null
      order by host_members.joined_at asc
    `,
    [host.id],
  )) as HostMemberQueryRow[]

  const members = memberRows.map<HostLeaderboardMember>((row) => ({
    handle: row.handle ?? 'player',
    champion: championFromBracket(row.bracket_data),
    points: 0,
    joinedAt: row.joined_at,
  }))

  const consensusRows = (await sql.query(
    `
      select
        predictions.match_id,
        case
          when predictions.home_score = predictions.away_score then 'draw'
          when predictions.home_score > predictions.away_score then 'home'
          else 'away'
        end as pick,
        count(*) as count
      from host_members
      join predictions on predictions.user_id = host_members.user_id
      where host_members.host_id = $1
      group by predictions.match_id, pick
      order by predictions.match_id asc, count desc
      limit 16
    `,
    [host.id],
  )) as PredictionConsensusRow[]

  return {
    ...mapHost(host, members.length),
    members,
    mostPickedChampion: mostFrequent(members.map((member) => member.champion)),
    matchConsensus: consensusRows.map((row) => ({
      matchId: row.match_id,
      pick: row.pick,
      count: Number(row.count),
    })),
  }
}

export function shapeHostForPublicApi(host: PublicHost): PublicHost {
  return {
    ...host,
    members: host.members.map((member) => ({
      handle: member.handle,
      champion: member.champion,
      points: member.points,
      joinedAt: member.joinedAt,
    })),
    matchConsensus: host.matchConsensus.map((item) => ({ ...item })),
  }
}
