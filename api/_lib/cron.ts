import type { ApiRequest } from './http.js'
import { HttpError } from './http.js'
import { nowForPickLocks } from './pick-locks.js'

function headerValue(request: ApiRequest, name: string): string | null {
  const direct = request.headers[name] ?? request.headers[name.toLowerCase()]
  if (Array.isArray(direct)) return direct[0] ?? null
  return direct ?? null
}

export function requireCronSecret(request: ApiRequest): void {
  const secret = process.env.CRON_SECRET
  const authorization = headerValue(request, 'authorization')

  if (!secret || authorization !== `Bearer ${secret}`) {
    throw new HttpError(401, 'not_authenticated', 'Unauthorized cron request.')
  }
}

export function nowForCron(request: ApiRequest): Date {
  return nowForPickLocks(request)
}
