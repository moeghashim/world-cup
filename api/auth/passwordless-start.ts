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
import { captureServerError } from '../_lib/monitoring.js'

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

  if (
    error.status === 429 ||
    error.code === 'too_many_attempts' ||
    error.code === 'too_many_requests' ||
    error.code === 'rate_limit_exceeded'
  ) {
    return new HttpError(
      429,
      'auth_rate_limited',
      'Too many sign-in code attempts. Try again in a few minutes.',
    )
  }

  if (
    error.status >= 500 ||
    error.code === 'auth0_error' ||
    error.code === 'email_provider_error' ||
    error.code === 'extensibility_error'
  ) {
    return new HttpError(
      502,
      'auth_email_delivery_failed',
      'The sign-in email service is failing right now. We have been notified.',
    )
  }

  return new HttpError(
    502,
    'auth_provider_error',
    'The sign-in provider could not start the email-code flow.',
  )
}

function captureAuth0PasswordlessStartFailure(
  error: Auth0PasswordlessError,
  request: ApiRequest,
) {
  const diagnostic = new Error(
    `Auth0 passwordless start failed (${error.status}:${error.code})`,
  )
  diagnostic.name = 'Auth0PasswordlessStartError'
  captureServerError(diagnostic, request)
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
    if (error instanceof Auth0PasswordlessError) {
      captureAuth0PasswordlessStartFailure(error, request)
    }

    sendError(
      response,
      error instanceof Auth0PasswordlessError
        ? mapAuth0PasswordlessError(error)
        : error,
      request,
    )
  }
}
