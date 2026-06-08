import { createContext, useContext } from 'react'
import type { AccountUser, SessionPayload } from './accountTypes'

export interface AuthValue {
  authenticated: boolean
  loading: boolean
  needsHandle: boolean
  user: AccountUser | null
  requestEmailCode: (email: string) => Promise<void>
  refreshSession: () => Promise<SessionPayload>
  setHandle: (handle: string) => Promise<SessionPayload>
  startSignIn: (returnTo?: string) => void
  verifyEmailCode: (
    email: string,
    code: string,
    returnTo?: string,
  ) => Promise<{ redirectTo: string; session: SessionPayload }>
  signOut: (returnTo?: string) => Promise<void>
}

export const AuthContext = createContext<AuthValue | null>(null)

export function useAuth(): AuthValue {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used within <AuthProvider>')
  return value
}
