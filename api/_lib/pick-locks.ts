import type { ApiRequest } from './http.js'
import { HttpError } from './http.js'
import { loadTournamentData } from './tournament-data.js'

const QA_NOW_HEADER = 'x-worldcup-now'

function headerValue(request: ApiRequest | undefined, name: string): string | null {
  const value = request?.headers[name]
  if (Array.isArray(value)) return value[0] ?? null
  return value ?? null
}

function allowsQaNowOverride(): boolean {
  return (
    process.env.NODE_ENV === 'test' ||
    process.env.VERCEL_ENV === 'development' ||
    !process.env.VERCEL_ENV
  )
}

export function nowForPickLocks(request?: ApiRequest): Date {
  const override = headerValue(request, QA_NOW_HEADER)
  if (override && allowsQaNowOverride()) {
    const parsed = new Date(override)
    if (!Number.isNaN(parsed.getTime())) return parsed
  }

  return new Date()
}

function assertOpen(deadlineIso: string, now: Date, label: string): void {
  const deadline = new Date(deadlineIso)

  if (now.getTime() >= deadline.getTime()) {
    throw new HttpError(
      409,
      'pick_locked',
      `${label} locked at kickoff: ${deadlineIso}.`,
    )
  }
}

export async function assertBracketOpen(request?: ApiRequest): Promise<void> {
  const data = await loadTournamentData()
  assertOpen(
    data.locks.bracketLocksAt,
    nowForPickLocks(request),
    'The knockout bracket',
  )
}

export async function assertMatchesOpen(
  matchIds: string[],
  request?: ApiRequest,
  options: { groupOnly?: boolean } = {},
): Promise<void> {
  const data = await loadTournamentData()
  const matches = new Map(data.matches.map((match) => [match.id, match]))
  const now = nowForPickLocks(request)

  for (const matchId of matchIds) {
    const match = matches.get(matchId)
    if (!match) {
      throw new HttpError(400, 'bad_request', `Unknown match ID: ${matchId}.`)
    }

    if (options.groupOnly && match.stage !== 'group') {
      throw new HttpError(
        400,
        'bad_request',
        `Group picks can only use group-stage matches: ${matchId}.`,
      )
    }

    assertOpen(
      match.kickoffAt,
      now,
      `Match ${match.matchNumber}`,
    )
  }
}
