import { useEffect, useState } from 'react'

export type ChampionDistributionItem = {
  code: string
  count: number
  pct: number
}

export type R32ConsensusItem = {
  matchIndex: number
  favourite: string | null
  pct: number
  total: number
  picks: ChampionDistributionItem[]
}

export type CommunityBracketSample = {
  name: string
  ar: string
  handle: string
  champ: string | null
  semis: string[]
  r32: string[]
  color: string
  updatedAt: string | null
}

export type CommunityStats = {
  players: number
  bracketsLocked: number
  hostsJoined: number
  championDistribution: ChampionDistributionItem[]
  r32Consensus: R32ConsensusItem[]
  communityBrackets: CommunityBracketSample[]
  source: {
    fallback: boolean
    generatedAt: string
  }
}

export const EMPTY_COMMUNITY_STATS: CommunityStats = {
  players: 0,
  bracketsLocked: 0,
  hostsJoined: 0,
  championDistribution: [],
  r32Consensus: Array.from({ length: 16 }, (_, matchIndex) => ({
    matchIndex,
    favourite: null,
    pct: 0,
    total: 0,
    picks: [],
  })),
  communityBrackets: [],
  source: {
    fallback: true,
    generatedAt: '',
  },
}

export function useCommunityStats(): CommunityStats {
  const [stats, setStats] = useState<CommunityStats>(EMPTY_COMMUNITY_STATS)

  useEffect(() => {
    let active = true

    async function loadStats() {
      try {
        const response = await fetch('/api/data/community')
        if (!response.ok) return
        const payload = (await response.json()) as CommunityStats
        if (active) setStats(payload)
      } catch {
        /* Empty state remains the honest local fallback. */
      }
    }

    void loadStats()

    return () => {
      active = false
    }
  }, [])

  return stats
}

export function localeForLang(lang: string): string {
  if (lang === 'ar') return 'ar'
  if (lang === 'es') return 'es'
  if (lang === 'fr') return 'fr'
  if (lang === 'pt') return 'pt'
  return 'en-US'
}

export function formatStatNumber(lang: string, value: number): string {
  return new Intl.NumberFormat(localeForLang(lang)).format(value)
}

export function formatPlusStatNumber(lang: string, value: number): string {
  return value > 0 ? `${formatStatNumber(lang, value)}+` : formatStatNumber(lang, value)
}

export function pctForPick(consensus: R32ConsensusItem | undefined, code: string | null): number {
  if (!consensus || !code) return 0
  return consensus.picks.find((item) => item.code === code)?.pct ?? 0
}
