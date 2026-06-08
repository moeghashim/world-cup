import type { ApiRequest, ApiResponse } from '../_lib/http.js'
import {
  HttpError,
  readJsonBody,
  requireMethod,
  sendError,
  sendJson,
} from '../_lib/http.js'
import {
  Auth0PasswordlessError,
  startAuth0PasswordlessEmail,
} from '../_lib/auth0.js'

type PasswordlessStartBody = {
  email?: unknown
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

function mapAuth0PasswordlessError(error: Auth0PasswordlessError): HttpError {
  if (error.code === 'bad.connection') {
    return new HttpError(
      503,
      'auth_provider_not_ready',
      'Email sign-in is not enabled yet.',
    )
  }

  return new HttpError(
    error.status >= 400 && error.status < 500 ? error.status : 502,
    'bad_request',
    'Could not send the sign-in code.',
  )
}

export default async function handler(
  request: ApiRequest,
  response: ApiResponse,
) {
  try {
    requireMethod(request, 'POST')
    const body = await readJsonBody<PasswordlessStartBody>(request)
    const email = normalizeEmail(body.email)

    await startAuth0PasswordlessEmail(email)

    sendJson(response, 200, { sent: true })
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
