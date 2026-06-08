import type { AuthenticateWithSessionCookieSuccessResponse } from '@workos-inc/node'
import type { ApiRequest } from './http.js'
import { HttpError } from './http.js'
import { getSessionCookie } from './cookies.js'
import { getWorkOS, getWorkOSCookiePassword } from './workos.js'
import {
  getLocalUserByWorkOSId,
  getSignupCountry,
  upsertLocalUserFromWorkOS,
} from './users.js'
import type { AccountUser } from './types.js'

export type AuthContext = {
  workosSession: AuthenticateWithSessionCookieSuccessResponse
  user: AccountUser
}

export async function getAuthContext(
  request: ApiRequest,
): Promise<AuthContext | null> {
  const sessionData = getSessionCookie(request)
  if (!sessionData) return null

  const workos = getWorkOS()
  const result = await workos.userManagement.authenticateWithSessionCookie({
    sessionData,
    cookiePassword: getWorkOSCookiePassword(),
  })

  if (!result.authenticated) return null

  const existing = await getLocalUserByWorkOSId(result.user.id)
  const user =
    existing ??
    (await upsertLocalUserFromWorkOS(
      result.user,
      getSignupCountry(request.headers),
    ))

  return {
    workosSession: result,
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

export async function getWorkOSLogoutUrl(
  request: ApiRequest,
  returnTo: string,
): Promise<string | null> {
  const sessionData = getSessionCookie(request)
  if (!sessionData) return null

  try {
    const sealedSession = getWorkOS().userManagement.loadSealedSession({
      sessionData,
      cookiePassword: getWorkOSCookiePassword(),
    })
    return await sealedSession.getLogoutUrl({ returnTo })
  } catch {
    const context = await getAuthContext(request)
    if (!context) return null

    return getWorkOS().userManagement.getLogoutUrl({
      sessionId: context.workosSession.sessionId,
      returnTo,
    })
  }
}

