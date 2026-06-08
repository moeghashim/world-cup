import { createHmac, timingSafeEqual } from 'node:crypto'
import { createRemoteJWKSet, jwtVerify } from 'jose'
import type { JWTPayload } from 'jose'
import { getRequiredEnv } from './env.js'

const oneMonthSeconds = 60 * 60 * 24 * 30

type Auth0TokenResponse = {
  access_token?: unknown
  id_token?: unknown
}

type Auth0ErrorResponse = {
  error?: unknown
  error_description?: unknown
}

export type Auth0Profile = {
  id: string
  email: string
}

type VerifiedAuth0Claims = {
  id: string
  email: string | null
}

export class Auth0PasswordlessError extends Error {
  status: number
  code: string

  constructor(status: number, code: string, message: string) {
    super(message)
    this.status = status
    this.code = code
  }
}

export type AppSessionClaims = {
  sub: string
  iat: number
  exp: number
}

let jwks: ReturnType<typeof createRemoteJWKSet> | undefined

function getAuth0Domain(): string {
  return getRequiredEnv('AUTH0_DOMAIN')
    .replace(/^https?:\/\//, '')
    .replace(/\/+$/, '')
}

export function getAuth0Issuer(): string {
  return `https://${getAuth0Domain()}/`
}

function getAuth0ClientId(): string {
  return getRequiredEnv('AUTH0_CLIENT_ID')
}

function getAuth0ClientSecret(): string {
  return getRequiredEnv('AUTH0_CLIENT_SECRET')
}

function getCookieSecret(): string {
  const secret = getRequiredEnv('AUTH0_COOKIE_SECRET')
  if (secret.length < 32) {
    throw new Error('AUTH0_COOKIE_SECRET must be at least 32 characters.')
  }
  return secret
}

function sign(payload: string): string {
  return createHmac('sha256', getCookieSecret())
    .update(payload)
    .digest('base64url')
}

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)
  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  )
}

function readString(value: unknown): string | null {
  return typeof value === 'string' && value ? value : null
}

async function readAuth0ErrorResponse(
  response: Response,
): Promise<Auth0ErrorResponse | null> {
  try {
    return (await response.json()) as Auth0ErrorResponse
  } catch {
    return null
  }
}

async function parseAuth0Error(
  response: Response,
): Promise<Auth0PasswordlessError> {
  const parsed = await readAuth0ErrorResponse(response)

  const code = readString(parsed?.error) ?? 'auth0_error'
  const description =
    readString(parsed?.error_description) ??
    'Auth0 passwordless request failed.'
  return new Auth0PasswordlessError(response.status, code, description)
}

export function getAuth0AuthorizationUrl({
  redirectUri,
  state,
}: {
  redirectUri: string
  state: string
}): string {
  const url = new URL('authorize', getAuth0Issuer())
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('client_id', getAuth0ClientId())
  url.searchParams.set('redirect_uri', redirectUri)
  url.searchParams.set('scope', 'openid profile email')
  url.searchParams.set('state', state)
  return url.toString()
}

export function getAuth0LogoutUrl(returnTo: string): string {
  const url = new URL('v2/logout', getAuth0Issuer())
  url.searchParams.set('client_id', getAuth0ClientId())
  url.searchParams.set('returnTo', returnTo)
  return url.toString()
}

async function fetchUserInfo(accessToken: string): Promise<Auth0Profile | null> {
  const response = await fetch(new URL('userinfo', getAuth0Issuer()), {
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
  })
  if (!response.ok) return null

  const userInfo = (await response.json()) as JWTPayload
  const id = readString(userInfo.sub)
  const email = readString(userInfo.email)
  return id && email ? { id, email } : null
}

export async function startAuth0PasswordlessEmail(email: string): Promise<void> {
  const response = await fetch(new URL('passwordless/start', getAuth0Issuer()), {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      client_id: getAuth0ClientId(),
      client_secret: getAuth0ClientSecret(),
      connection: 'email',
      email,
      send: 'code',
      authParams: {
        scope: 'openid profile email',
      },
    }),
  })

  if (!response.ok) {
    throw await parseAuth0Error(response)
  }
}

export async function exchangeAuth0PasswordlessCode({
  email,
  otp,
}: {
  email: string
  otp: string
}): Promise<Auth0Profile> {
  const body = new URLSearchParams({
    grant_type: 'http://auth0.com/oauth/grant-type/passwordless/otp',
    client_id: getAuth0ClientId(),
    client_secret: getAuth0ClientSecret(),
    username: email,
    otp,
    realm: 'email',
    scope: 'openid profile email',
  })

  const response = await fetch(new URL('oauth/token', getAuth0Issuer()), {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    body,
  })

  if (!response.ok) {
    throw await parseAuth0Error(response)
  }

  const tokenResponse = (await response.json()) as Auth0TokenResponse
  const idToken = readString(tokenResponse.id_token)
  if (!idToken) {
    throw new Error('Auth0 did not return an ID token.')
  }

  const claims = await verifyAuth0IdTokenClaims(idToken)
  if (claims.email) return { id: claims.id, email: claims.email }

  throw new Error('Auth0 did not return a verified email profile.')
}

export async function exchangeAuth0Code({
  code,
  redirectUri,
}: {
  code: string
  redirectUri: string
}): Promise<Auth0Profile> {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: getAuth0ClientId(),
    client_secret: getAuth0ClientSecret(),
    code,
    redirect_uri: redirectUri,
  })

  const response = await fetch(new URL('oauth/token', getAuth0Issuer()), {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    body,
  })

  if (!response.ok) {
    throw new Error('Auth0 code exchange failed.')
  }

  const tokenResponse = (await response.json()) as Auth0TokenResponse
  const idToken = readString(tokenResponse.id_token)
  if (!idToken) {
    throw new Error('Auth0 did not return an ID token.')
  }

  const claims = await verifyAuth0IdTokenClaims(idToken)
  if (claims.email) return { id: claims.id, email: claims.email }

  const accessToken = readString(tokenResponse.access_token)
  const userInfoProfile = accessToken ? await fetchUserInfo(accessToken) : null
  if (userInfoProfile && userInfoProfile.id === claims.id) return userInfoProfile

  throw new Error('Auth0 did not return a verified email profile.')
}

async function verifyAuth0IdTokenClaims(
  idToken: string,
): Promise<VerifiedAuth0Claims> {
  jwks ??= createRemoteJWKSet(new URL('.well-known/jwks.json', getAuth0Issuer()))

  const { payload } = await jwtVerify(idToken, jwks, {
    audience: getAuth0ClientId(),
    issuer: getAuth0Issuer(),
  })

  const id = readString(payload.sub)
  const email = readString(payload.email)
  if (!id) {
    throw new Error('Auth0 ID token is missing the user subject.')
  }

  return { id, email }
}

export async function verifyAuth0IdToken(idToken: string): Promise<Auth0Profile> {
  const claims = await verifyAuth0IdTokenClaims(idToken)
  if (!claims.email) {
    throw new Error('Auth0 ID token is missing the email claim.')
  }
  return { id: claims.id, email: claims.email }
}

export function createAppSession(
  auth0UserId: string,
  now = Math.floor(Date.now() / 1000),
): string {
  const claims: AppSessionClaims = {
    sub: auth0UserId,
    iat: now,
    exp: now + oneMonthSeconds,
  }
  const payload = Buffer.from(JSON.stringify(claims), 'utf8').toString(
    'base64url',
  )
  return `${payload}.${sign(payload)}`
}

export function verifyAppSession(value: string): AppSessionClaims | null {
  const [payload, signature, extra] = value.split('.')
  if (!payload || !signature || extra) return null
  if (!safeEqual(sign(payload), signature)) return null

  try {
    const claims = JSON.parse(
      Buffer.from(payload, 'base64url').toString('utf8'),
    ) as AppSessionClaims
    if (typeof claims.sub !== 'string' || typeof claims.exp !== 'number') {
      return null
    }
    if (claims.exp <= Math.floor(Date.now() / 1000)) return null
    return claims
  } catch {
    return null
  }
}
