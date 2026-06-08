import type { AccountUser } from './types.js'
import { HttpError } from './http.js'
import { sql } from './db.js'
import type { UserRow } from '../../db/types.js'

type Auth0UserLike = {
  id: string
  email: string
}

function mapUser(row: UserRow): AccountUser {
  return {
    id: row.id,
    email: row.email,
    handle: row.handle,
    countryAtSignup: row.country_at_signup,
  }
}

export function normalizeHandle(raw: string): string {
  return raw.trim().replace(/\s+/g, '-')
}

export function validateHandle(raw: unknown): string {
  if (typeof raw !== 'string') {
    throw new HttpError(400, 'bad_request', 'Choose a handle.')
  }

  const handle = normalizeHandle(raw)
  if (!/^[a-zA-Z0-9_-]{3,24}$/.test(handle)) {
    throw new HttpError(
      400,
      'bad_request',
      'Use 3-24 letters, numbers, underscores, or hyphens.',
    )
  }

  return handle
}

export function getSignupCountry(
  requestHeaders: Record<string, string | string[] | undefined>,
): string | null {
  const value =
    requestHeaders['x-vercel-ip-country'] ??
    requestHeaders['cf-ipcountry'] ??
    requestHeaders['x-country']
  const country = Array.isArray(value) ? value[0] : value
  return country || null
}

export async function getLocalUserByAuth0Id(
  auth0UserId: string,
): Promise<AccountUser | null> {
  const rows = (await sql.query(
    'select * from users where auth0_user_id = $1 limit 1',
    [auth0UserId],
  )) as UserRow[]
  return rows[0] ? mapUser(rows[0]) : null
}

export async function upsertLocalUserFromAuth0(
  auth0User: Auth0UserLike,
  countryAtSignup: string | null,
): Promise<AccountUser> {
  try {
    const rows = (await sql.query(
      `
        insert into users (auth0_user_id, email, country_at_signup)
        values ($1, $2, $3)
        on conflict (auth0_user_id) do update
          set email = excluded.email,
              country_at_signup = coalesce(users.country_at_signup, excluded.country_at_signup),
              updated_at = now()
        returning *
      `,
      [auth0User.id, auth0User.email, countryAtSignup],
    )) as UserRow[]

    if (!rows[0]) throw new Error('Auth0 user mapping did not return a row')
    return mapUser(rows[0])
  } catch (error) {
    if (
      typeof error === 'object' &&
      error &&
      'code' in error &&
      error.code === '23505'
    ) {
      const rows = (await sql.query(
        `
          update users
            set auth0_user_id = $1,
                email = $2,
                updated_at = now()
          where lower(email) = lower($2)
          returning *
        `,
        [auth0User.id, auth0User.email],
      )) as UserRow[]

      if (rows[0]) return mapUser(rows[0])
    }

    throw error
  }
}

export async function setUserHandle(
  userId: string,
  handleInput: unknown,
): Promise<AccountUser> {
  const handle = validateHandle(handleInput)

  try {
    const rows = (await sql.query(
      `
        update users
          set handle = $2,
              updated_at = now()
        where id = $1
        returning *
      `,
      [userId, handle],
    )) as UserRow[]

    if (!rows[0]) throw new HttpError(404, 'not_authenticated', 'Sign in again.')
    return mapUser(rows[0])
  } catch (error) {
    if (
      typeof error === 'object' &&
      error &&
      'code' in error &&
      error.code === '23505'
    ) {
      throw new HttpError(409, 'handle_taken', 'That handle is already taken.')
    }

    throw error
  }
}
