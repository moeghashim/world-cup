import * as Sentry from '@sentry/react'

declare const __SENTRY_DSN__: string

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

export function initializeClientMonitoring() {
  if (initialized || !__SENTRY_DSN__) return

  Sentry.init({
    dsn: __SENTRY_DSN__,
    tracesSampleRate: 0,
    beforeSend: scrubEvent,
  })

  initialized = true
}
