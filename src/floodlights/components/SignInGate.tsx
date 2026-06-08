import { useEffect } from 'react'
import { captureAnalyticsEvent } from '../../analytics'
import { useI18n } from '../i18n/context'
import { useAuth } from '../lib/authContext'

export function SignInGate({
  open,
  onClose,
  returnTo,
}: {
  open: boolean
  onClose: () => void
  returnTo: string
}) {
  const { t } = useI18n()
  const auth = useAuth()

  useEffect(() => {
    if (open) captureAnalyticsEvent('sign_in_gate_viewed')
  }, [open])

  if (!open) return null

  return (
    <div
      className="auth-gate"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-gate-title"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="auth-gate-card">
        <span className="auth-gate-kicker">{t('auth_gate_secure')}</span>
        <h2 id="auth-gate-title">{t('auth_gate_h')}</h2>
        <p>{t('auth_gate_p')}</p>
        <div className="auth-gate-actions">
          <button
            className="btn btn-lime"
            type="button"
            onClick={() => auth.startSignIn(returnTo)}
          >
            {t('auth_gate_signin')}
          </button>
          <button className="btn btn-ghost" type="button" onClick={onClose}>
            {t('auth_gate_cancel')}
          </button>
        </div>
      </div>
    </div>
  )
}

