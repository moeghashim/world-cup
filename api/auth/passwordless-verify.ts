import type { ApiRequest, ApiResponse } from '../_lib/http.js'
import {
  HttpError,
  readJsonBody,
  requireMethod,
  sendError,
  sendJson,
} from '../_lib/http.js'
import { setSessionCookie } from '../_lib/cookies.js'
import { normalizeReturnPath } from '../_lib/request-url.js'
import {
  Auth0PasswordlessError,
  createAppSession,
  exchangeAuth0PasswordlessCode,
} from '../_lib/auth0.js'
import {
  getSignupCountry,
  upsertLocalUserFromAuth0,
} from '../_lib/users.js'
import type { SessionPayload } from '../_lib/types.js'

type PasswordlessVerifyBody = {
  email?: unknown
  code?: unknown
  returnTo?: unknown
}

function normalizeEmail(value: unknown): string {
  if (typeof value !== 'string') {
    throw new HttpError(400, 'bad_request', 'Enter an email address.')
  }

  const email = value.trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new HttpError(400, 'bad_request', 'Enter a valid email address.')
  }

  return email
}

function normalizeCode(value: unknown): string {
  if (typeof value !== 'string') {
    throw new HttpError(400, 'bad_request', 'Enter the code from your email.')
  }

  const code = value.replace(/\s+/g, '')
  if (!/^[a-zA-Z0-9]{4,12}$/.test(code)) {
    throw new HttpError(400, 'bad_request', 'Enter the code from your email.')
  }

  return code
}

function mapAuth0PasswordlessError(error: Auth0PasswordlessError): HttpError {
  if (error.code === 'bad.connection') {
    return new HttpError(
      503,
      'auth_provider_not_ready',
      'Email sign-in is not enabled yet.',
    )
  }

  if (
    error.code === 'invalid_grant' ||
    error.code === 'access_denied' ||
    error.status === 403
  ) {
    return new HttpError(400, 'invalid_code', 'That code did not work.')
  }

  return new HttpError(502, 'bad_request', 'Could not verify the sign-in code.')
}

export default async function handler(
  request: ApiRequest,
  response: ApiResponse,
) {
  try {
    requireMethod(request, 'POST')
    const body = await readJsonBody<PasswordlessVerifyBody>(request)
    const email = normalizeEmail(body.email)
    const code = normalizeCode(body.code)
    const returnTo = normalizeReturnPath(body.returnTo)

    const auth0User = await exchangeAuth0PasswordlessCode({ email, otp: code })
    const user = await upsertLocalUserFromAuth0(
      auth0User,
      getSignupCountry(request.headers),
    )
    const redirectTo = user.handle
      ? returnTo
      : `/profile?setup=handle&returnTo=${encodeURIComponent(returnTo)}`
    const session: SessionPayload = {
      authenticated: true,
      needsHandle: !user.handle,
      user,
    }

    setSessionCookie(response, request, createAppSession(auth0User.id))
    sendJson(response, 200, { redirectTo, session })
  } catch (error) {
    sendError(
      response,
      error instanceof Auth0PasswordlessError
        ? mapAuth0PasswordlessError(error)
        : error,
      request,
    )
  }
}
