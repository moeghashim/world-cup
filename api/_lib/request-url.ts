import type { ApiRequest } from './http.js'
import { getHeader } from './cookies.js'

type AuthState = {
  returnTo: string
  nonce: string | null
}

export function normalizeReturnPath(value: unknown): string {
  const raw = Array.isArray(value) ? value[0] : value
  if (typeof raw !== 'string') return '/pickem'
  if (!raw.startsWith('/') || raw.startsWith('//')) return '/pickem'
  return raw
}

export function getRequestOrigin(request: ApiRequest): string {
  const proto =
    getHeader(request, 'x-forwarded-proto').split(',')[0]?.trim() || 'http'
  const host = getHeader(request, 'x-forwarded-host') || getHeader(request, 'host')
  if (!host) return 'http://localhost:5173'
  return `${proto}://${host}`
}

export function getAuthRedirectUri(request: ApiRequest): string {
  return `${getRequestOrigin(request)}/api/auth/callback`
}

export function getReturnTo(request: ApiRequest): string {
  return normalizeReturnPath(request.query?.returnTo)
}

export function encodeAuthState(
  returnTo: string,
  nonce: string | null = null,
): string {
  return Buffer.from(JSON.stringify({ returnTo, nonce }), 'utf8').toString(
    'base64url',
  )
}

export function decodeAuthState(value: unknown): AuthState {
  const raw = Array.isArray(value) ? value[0] : value
  if (typeof raw !== 'string') return { returnTo: '/pickem', nonce: null }

  try {
    const parsed = JSON.parse(Buffer.from(raw, 'base64url').toString('utf8')) as {
      returnTo?: unknown
      nonce?: unknown
    }
    return {
      returnTo: normalizeReturnPath(parsed.returnTo),
      nonce: typeof parsed.nonce === 'string' ? parsed.nonce : null,
    }
  } catch {
    return { returnTo: '/pickem', nonce: null }
  }
}

export function getQueryString(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? '' : value ?? ''
}
