import type { ApiRequest, ApiResponse } from './http.js'

export const sessionCookieName = 'wwc_session'

const oneMonthSeconds = 60 * 60 * 24 * 30

type CookieOptions = {
  httpOnly?: boolean
  maxAge?: number
  path?: string
  sameSite?: 'Lax' | 'Strict' | 'None'
  secure?: boolean
}

function firstHeaderValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? ''
  return value ?? ''
}

export function getHeader(request: ApiRequest, name: string): string {
  const lower = name.toLowerCase()
  const direct = request.headers[lower]
  if (direct !== undefined) return firstHeaderValue(direct)

  const found = Object.entries(request.headers).find(
    ([key]) => key.toLowerCase() === lower,
  )
  return firstHeaderValue(found?.[1])
}

export function parseCookies(request: ApiRequest): Record<string, string> {
  const cookieHeader = getHeader(request, 'cookie')
  return cookieHeader
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((cookies, part) => {
      const index = part.indexOf('=')
      if (index < 0) return cookies
      const name = part.slice(0, index)
      const value = part.slice(index + 1)
      cookies[name] = decodeURIComponent(value)
      return cookies
    }, {})
}

export function getSessionCookie(request: ApiRequest): string | undefined {
  return parseCookies(request)[sessionCookieName]
}

function serializeCookie(
  name: string,
  value: string,
  options: CookieOptions,
): string {
  const attributes = [
    `${name}=${encodeURIComponent(value)}`,
    `Path=${options.path ?? '/'}`,
    `SameSite=${options.sameSite ?? 'Lax'}`,
  ]

  if (options.httpOnly) attributes.push('HttpOnly')
  if (options.secure) attributes.push('Secure')
  if (typeof options.maxAge === 'number') {
    attributes.push(`Max-Age=${options.maxAge}`)
  }

  return attributes.join('; ')
}

export function isSecureRequest(request: ApiRequest): boolean {
  const proto = getHeader(request, 'x-forwarded-proto')
  if (proto) return proto.split(',')[0]?.trim() === 'https'

  const host = getHeader(request, 'host')
  return Boolean(host && !/^localhost(?::|$)|^127\.0\.0\.1(?::|$)/.test(host))
}

export function setSessionCookie(
  response: ApiResponse,
  request: ApiRequest,
  sealedSession: string,
) {
  response.setHeader(
    'Set-Cookie',
    serializeCookie(sessionCookieName, sealedSession, {
      httpOnly: true,
      maxAge: oneMonthSeconds,
      sameSite: 'Lax',
      secure: isSecureRequest(request),
    }),
  )
}

export function clearSessionCookie(response: ApiResponse, request: ApiRequest) {
  response.setHeader(
    'Set-Cookie',
    serializeCookie(sessionCookieName, '', {
      httpOnly: true,
      maxAge: 0,
      sameSite: 'Lax',
      secure: isSecureRequest(request),
    }),
  )
}

