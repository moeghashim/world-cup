import type { ApiRequest } from './http.js'
import { HttpError } from './http.js'
import { getSessionCookie } from './cookies.js'
import { verifyAppSession } from './auth0.js'
import { getLocalUserByAuth0Id } from './users.js'
import type { AccountUser } from './types.js'

export type AuthContext = {
  auth0UserId: string
  user: AccountUser
}

export async function getAuthContext(
  request: ApiRequest,
): Promise<AuthContext | null> {
  const sessionData = getSessionCookie(request)
  if (!sessionData) return null

  const claims = verifyAppSession(sessionData)
  if (!claims) return null

  const user = await getLocalUserByAuth0Id(claims.sub)
  if (!user) return null

  return {
    auth0UserId: claims.sub,
    user,
  }
}

export async function requireAuthContext(
  request: ApiRequest,
): Promise<AuthContext> {
  const context = await getAuthContext(request)
  if (!context) {
    throw new HttpError(401, 'not_authenticated', 'Sign in to continue.')
  }
  return context
}

export async function requireHandle(request: ApiRequest): Promise<AuthContext> {
  const context = await requireAuthContext(request)
  if (!context.user.handle) {
    throw new HttpError(403, 'handle_required', 'Choose a handle first.')
  }
  return context
}
