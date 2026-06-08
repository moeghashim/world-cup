import * as Sentry from '@sentry/node'
import type { ApiRequest } from './http.js'

let initialized = false

function scrubEvent(event: Sentry.ErrorEvent): Sentry.ErrorEvent {
  if (event.user) {
    delete event.user.email
    delete event.user.ip_address
  }

  if (event.request) {
    delete event.request.cookies
    delete event.request.data

    const headers = event.request.headers
    if (headers) {
      delete headers.cookie
      delete headers.Cookie
      delete headers.authorization
      delete headers.Authorization
    }
  }

  return event
}

export function initializeServerMonitoring() {
  if (initialized || !process.env.SENTRY_DSN) return

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 0,
    beforeSend: scrubEvent,
  })

  initialized = true
}

export function captureServerError(error: unknown, request?: ApiRequest) {
  initializeServerMonitoring()
  if (!process.env.SENTRY_DSN) return

  Sentry.withScope((scope) => {
    if (request) {
      scope.setContext('request', {
        method: request.method ?? 'GET',
        path: request.headers['x-vercel-id'] ? 'vercel-function' : undefined,
      })
    }

    Sentry.captureException(error)
  })
}
