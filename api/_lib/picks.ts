import { HttpError } from './http.js'
import { sql } from './db.js'
import type {
  BracketPayload,
  GroupPicksPayload,
  PicksPayload,
  PredictionPayload,
} from './types.js'
import type {
  BracketRow,
  GroupPickRow,
  PredictionRow,
} from '../../db/types.js'

type JsonRecord = Record<string, unknown>

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function stringRecord(value: unknown, label: string): Record<string, string> {
  if (!isRecord(value)) {
    throw new HttpError(400, 'bad_request', `${label} must be an object.`)
  }

  return Object.entries(value).reduce<Record<string, string>>(
    (record, [key, entry]) => {
      if (typeof entry !== 'string') {
        throw new HttpError(400, 'bad_request', `${label} values must be text.`)
      }
      record[key] = entry
      return record
    },
    {},
  )
}

function stringArrayRecord(
  value: unknown,
  label: string,
): Record<string, string[]> {
  if (!isRecord(value)) {
    throw new HttpError(400, 'bad_request', `${label} must be an object.`)
  }

  return Object.entries(value).reduce<Record<string, string[]>>(
    (record, [key, entry]) => {
      if (
        !Array.isArray(entry) ||
        !entry.every((item) => typeof item === 'string')
      ) {
        throw new HttpError(
          400,
          'bad_request',
          `${label} values must be text arrays.`,
        )
      }
      record[key] = entry
      return record
    },
    {},
  )
}

export function validateBracketPayload(value: unknown): BracketPayload {
  if (!isRecord(value)) {
    throw new HttpError(400, 'bad_request', 'Bracket payload must be an object.')
  }

  if (!Array.isArray(value.thirds) || !value.thirds.every((item) => typeof item === 'string')) {
    throw new HttpError(400, 'bad_request', 'Bracket thirds must be text.')
  }

  if (typeof value.locked !== 'boolean') {
    throw new HttpError(400, 'bad_request', 'Bracket locked must be boolean.')
  }

  return {
    groups: stringArrayRecord(value.groups, 'Bracket groups'),
    thirds: value.thirds,
    ko: stringRecord(value.ko, 'Bracket knockout picks'),
    locked: value.locked,
  }
}

export function validateGroupPicksPayload(value: unknown): GroupPicksPayload {
  if (!isRecord(value)) {
    throw new HttpError(400, 'bad_request', 'Group picks payload must be an object.')
  }

  if (typeof value.locked !== 'boolean') {
    throw new HttpError(400, 'bad_request', 'Group picks locked must be boolean.')
  }

  return {
    picks: stringRecord(value.picks, 'Group picks'),
    locked: value.locked,
  }
}

export function validatePredictionPayload(value: unknown): PredictionPayload {
  if (!isRecord(value)) {
    throw new HttpError(400, 'bad_request', 'Prediction payload must be an object.')
  }

  const homeScore = Number(value.homeScore)
  const awayScore = Number(value.awayScore)

  if (typeof value.matchId !== 'string' || !value.matchId.trim()) {
    throw new HttpError(400, 'bad_request', 'Prediction matchId is required.')
  }

  if (
    !Number.isInteger(homeScore) ||
    !Number.isInteger(awayScore) ||
    homeScore < 0 ||
    awayScore < 0 ||
    homeScore > 99 ||
    awayScore > 99
  ) {
    throw new HttpError(
      400,
      'bad_request',
      'Prediction scores must be integers from 0 to 99.',
    )
  }

  if (typeof value.locked !== 'boolean') {
    throw new HttpError(400, 'bad_request', 'Prediction locked must be boolean.')
  }

  return {
    matchId: value.matchId.trim(),
    homeScore,
    awayScore,
    locked: value.locked,
  }
}

export async function loadBracket(userId: string): Promise<BracketPayload | null> {
  const rows = (await sql.query(
    'select * from brackets where user_id = $1 limit 1',
    [userId],
  )) as BracketRow[]

  if (!rows[0]) return null

  return validateBracketPayload({
    ...(rows[0].data as JsonRecord),
    locked: rows[0].locked,
  })
}

export async function saveBracket(
  userId: string,
  payload: BracketPayload,
): Promise<BracketPayload> {
  await sql.query(
    `
      insert into brackets (user_id, data, locked, updated_at)
      values ($1, $2::jsonb, $3, now())
      on conflict (user_id) do update
        set data = excluded.data,
            locked = excluded.locked,
            updated_at = now()
    `,
    [userId, JSON.stringify(payload), payload.locked],
  )

  return payload
}

export async function loadGroupPicks(
  userId: string,
): Promise<GroupPicksPayload | null> {
  const rows = (await sql.query(
    'select * from group_picks where user_id = $1 order by match_id asc',
    [userId],
  )) as GroupPickRow[]

  if (rows.length === 0) return null

  return {
    picks: rows.reduce<Record<string, string>>((picks, row) => {
      picks[row.match_id] = row.pick
      return picks
    }, {}),
    locked: rows.every((row) => Boolean(row.locked_at)),
  }
}

export async function saveGroupPicks(
  userId: string,
  payload: GroupPicksPayload,
): Promise<GroupPicksPayload> {
  await sql.query('delete from group_picks where user_id = $1', [userId])

  for (const [matchId, pick] of Object.entries(payload.picks)) {
    await sql.query(
      `
        insert into group_picks (user_id, match_id, pick, locked_at, updated_at)
        values ($1, $2, $3, case when $4 then now() else null end, now())
      `,
      [userId, matchId, pick, payload.locked],
    )
  }

  return payload
}

export async function loadPredictions(
  userId: string,
): Promise<PredictionPayload[]> {
  const rows = (await sql.query(
    'select * from predictions where user_id = $1 order by match_id asc',
    [userId],
  )) as PredictionRow[]

  return rows.map((row) => ({
    matchId: row.match_id,
    homeScore: row.home_score,
    awayScore: row.away_score,
    locked: Boolean(row.locked_at),
  }))
}

export async function savePrediction(
  userId: string,
  payload: PredictionPayload,
): Promise<PredictionPayload> {
  await sql.query(
    `
      insert into predictions (
        user_id,
        match_id,
        home_score,
        away_score,
        locked_at,
        updated_at
      )
      values ($1, $2, $3, $4, case when $5 then now() else null end, now())
      on conflict (user_id, match_id) do update
        set home_score = excluded.home_score,
            away_score = excluded.away_score,
            locked_at = excluded.locked_at,
            updated_at = now()
    `,
    [
      userId,
      payload.matchId,
      payload.homeScore,
      payload.awayScore,
      payload.locked,
    ],
  )

  return payload
}

export async function loadAllPicks(userId: string): Promise<PicksPayload> {
  const [bracket, groupPicks, predictions] = await Promise.all([
    loadBracket(userId),
    loadGroupPicks(userId),
    loadPredictions(userId),
  ])

  return {
    bracket,
    groupPicks,
    predictions,
  }
}

