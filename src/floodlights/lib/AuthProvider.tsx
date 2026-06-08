import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { captureAnalyticsEvent } from '../../analytics'
import type { SessionPayload } from './accountTypes'
import { apiRequest } from './apiClient'
import { AuthContext } from './authContext'
import type { AuthValue } from './authContext'

const signedOutSession: SessionPayload = {
  authenticated: false,
  needsHandle: false,
  user: null,
}

async function fetchSession(): Promise<SessionPayload> {
  try {
    return await apiRequest<SessionPayload>('/api/auth/me')
  } catch {
    return signedOutSession
  }
}

function currentReturnTo(): string {
  const { pathname, search, hash } = window.location
  return `${pathname}${search}${hash}`
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionPayload>(signedOutSession)
  const [loading, setLoading] = useState(true)

  const refreshSession = useCallback(async () => {
    const next = await fetchSession()
    setSession(next)
    setLoading(false)
    return next
  }, [])

  useEffect(() => {
    let active = true

    void fetchSession().then((next) => {
      if (!active) return
      setSession(next)
      setLoading(false)
    })

    return () => {
      active = false
    }
  }, [])

  const setHandle = useCallback(async (handle: string) => {
    const next = await apiRequest<SessionPayload>('/api/profile/handle', {
      method: 'POST',
      body: { handle },
    })
    setSession(next)
    captureAnalyticsEvent('profile_handle_saved')
    return next
  }, [])

  const startSignIn = useCallback((returnTo = currentReturnTo()) => {
    captureAnalyticsEvent('sign_in_started', { surface: 'lock_gate' })
    window.location.assign(
      `/api/auth/start?returnTo=${encodeURIComponent(returnTo)}`,
    )
  }, [])

  const signOut = useCallback(async (returnTo = '/') => {
    const result = await apiRequest<{ logoutUrl: string }>(
      `/api/auth/logout?returnTo=${encodeURIComponent(returnTo)}`,
      { method: 'POST' },
    )
    captureAnalyticsEvent('sign_out_started')
    window.location.assign(result.logoutUrl)
  }, [])

  const value = useMemo<AuthValue>(
    () => ({
      authenticated: session.authenticated,
      loading,
      needsHandle: session.needsHandle,
      user: session.user,
      refreshSession,
      setHandle,
      startSignIn,
      signOut,
    }),
    [loading, refreshSession, session, setHandle, signOut, startSignIn],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
