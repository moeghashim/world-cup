import { captureAnalyticsEvent } from '../../analytics'
import type {
  BracketPayload,
  GroupPicksPayload,
} from './accountTypes'
import { apiRequest } from './apiClient'
import { normalize } from './bracket'
import { load, save } from './storage'

type BracketResponse = {
  bracket: BracketPayload | null
}

type GroupPicksResponse = {
  groupPicks: GroupPicksPayload | null
}

export type AccountMigrationResult = {
  bracketMigrated: boolean
  groupPicksMigrated: boolean
}

const markerPrefix = 'account_migrated:'

function migrationMarkerKey(userId: string): string {
  return `${markerPrefix}${userId}`
}

export function hasBracketPicksForMigration(bracket: BracketPayload): boolean {
  return (
    Object.values(bracket.groups).some((rank) => rank.length > 0) ||
    bracket.thirds.length > 0 ||
    Object.keys(bracket.ko).length > 0 ||
    bracket.locked
  )
}

export function hasGroupPicksForMigration(groupPicks: GroupPicksPayload): boolean {
  return Object.keys(groupPicks.picks).length > 0 || groupPicks.locked
}

export async function migrateAnonymousPicks(
  userId: string,
): Promise<AccountMigrationResult> {
  if (load<boolean>(migrationMarkerKey(userId), false)) {
    return { bracketMigrated: false, groupPicksMigrated: false }
  }

  const localBracket = normalize(load('bracket', {}))
  const localGroupPicks = load<GroupPicksPayload>('grouppicks', {
    picks: {},
    locked: false,
  })

  const [serverBracket, serverGroupPicks] = await Promise.all([
    apiRequest<BracketResponse>('/api/picks/bracket'),
    apiRequest<GroupPicksResponse>('/api/picks/group'),
  ])

  let bracketMigrated = false
  let groupPicksMigrated = false

  if (hasBracketPicksForMigration(localBracket) && !serverBracket.bracket) {
    await apiRequest('/api/picks/bracket', {
      method: 'PUT',
      body: localBracket,
    })
    bracketMigrated = true
  }

  if (hasGroupPicksForMigration(localGroupPicks) && !serverGroupPicks.groupPicks) {
    await apiRequest('/api/picks/group', {
      method: 'PUT',
      body: localGroupPicks,
    })
    groupPicksMigrated = true
  }

  save(migrationMarkerKey(userId), true)

  if (bracketMigrated || groupPicksMigrated) {
    captureAnalyticsEvent('anonymous_picks_migrated', {
      bracket: bracketMigrated,
      group_picks: groupPicksMigrated,
    })
  }

  return { bracketMigrated, groupPicksMigrated }
}
