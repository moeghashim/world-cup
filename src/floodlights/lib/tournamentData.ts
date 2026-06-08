import { useEffect, useState } from 'react'
import { MATCHES, type Match } from '../data'

export interface TournamentFixture {
  id: string
  matchNumber: number
  stage: string
  round: string
  groupCode: string | null
  groupName: string | null
  homeTeamCode: string | null
  awayTeamCode: string | null
  homeTeamName: string
  awayTeamName: string
  kickoffAt: string
  kickoffLocalDate: string
  kickoffLocalTime: string
  kickoffTimezone: string
  venue: string
}

export interface TournamentData {
  matches: TournamentFixture[]
  locks: {
    bracketLocksAt: string
    firstMatchId: string
  }
  source: {
    fallback: boolean
  }
}

export function formatKickoffUtc(iso: string): string {
  const date = new Date(iso)
  const month = date.toLocaleString('en-US', {
    month: 'short',
    timeZone: 'UTC',
  })
  const day = date.toLocaleString('en-US', {
    day: 'numeric',
    timeZone: 'UTC',
  })
  const time = date
    .toLocaleString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'UTC',
    })
    .replace('24:', '00:')

  return `${month} ${day} · ${time} UTC`
}

export function useTournamentData(): TournamentData | null {
  const [data, setData] = useState<TournamentData | null>(null)

  useEffect(() => {
    let active = true

    async function loadFixtures() {
      try {
        const response = await fetch('/api/data/fixtures')
        if (!response.ok) return
        const payload = (await response.json()) as TournamentData
        if (active) setData(payload)
      } catch {
        /* Local constants remain the client-side display fallback. */
      }
    }

    void loadFixtures()

    return () => {
      active = false
    }
  }, [])

  return data
}

export function getQuickPickMatches(matches?: TournamentFixture[]): Match[] {
  const groupMatches = (matches ?? [])
    .filter(
      (match) =>
        match.stage === 'group' &&
        match.groupCode &&
        match.homeTeamCode &&
        match.awayTeamCode,
    )
    .sort((a, b) => a.kickoffAt.localeCompare(b.kickoffAt))
    .slice(0, 3)
    .map((match) => ({
      id: match.id,
      a: match.homeTeamCode as string,
      b: match.awayTeamCode as string,
      g: match.groupCode as string,
      d: formatKickoffUtc(match.kickoffAt),
      j: 317,
      kickoffAt: match.kickoffAt,
      venue: match.venue,
      matchNumber: match.matchNumber,
      live: match.matchNumber === 1,
    }))

  return groupMatches.length === 3 ? groupMatches : MATCHES
}
