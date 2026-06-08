import { useEffect, useState } from 'react'

export type StandingEntry = {
  rank: number
  handle: string
  points: number
  champion: string | null
  updatedAt: string
}

export type StandingsResponse = {
  standings: StandingEntry[]
  me: StandingEntry | null
  source: {
    fallback: boolean
    provider: string
    attribution: string | null
    generatedAt: string
  }
}

export const EMPTY_STANDINGS: StandingsResponse = {
  standings: [],
  me: null,
  source: {
    fallback: true,
    provider: 'football-data',
    attribution: 'Football data provided by the Football-Data.org API.',
    generatedAt: '',
  },
}

export function useStandings(): StandingsResponse {
  const [standings, setStandings] = useState<StandingsResponse>(EMPTY_STANDINGS)

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const response = await fetch('/api/standings')
        if (!response.ok) return
        const payload = (await response.json()) as StandingsResponse
        if (active) setStandings(payload)
      } catch {
        /* Keep the honest empty state when the standings cache is unavailable. */
      }
    }

    void load()

    return () => {
      active = false
    }
  }, [])

  return standings
}
