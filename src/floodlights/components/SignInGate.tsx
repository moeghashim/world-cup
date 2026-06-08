import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { captureAnalyticsEvent } from '../../analytics'
import { useI18n } from '../i18n/context'
import { ApiClientError } from '../lib/apiClient'
import { useAuth } from '../lib/authContext'

type SignInStep = 'email' | 'code'

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
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState<SignInStep>('email')
  const [error, setError] = useState('')
  const [working, setWorking] = useState(false)

  useEffect(() => {
    if (!open) return
    captureAnalyticsEvent('sign_in_gate_viewed')
  }, [open])

  if (!open) return null

  const resetForm = () => {
    setEmail('')
    setStep('email')
    setCode('')
    setError('')
    setWorking(false)
  }

  const closeGate = () => {
    resetForm()
    onClose()
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setWorking(true)
    setError('')

    try {
      if (step === 'email') {
        await auth.requestEmailCode(email)
        setStep('code')
      } else {
        const result = await auth.verifyEmailCode(email, code, returnTo)
        closeGate()
        window.location.assign(result.redirectTo)
      }
    } catch (caught) {
      if (
        caught instanceof ApiClientError &&
        caught.code === 'auth_provider_not_ready'
      ) {
        setError(t('auth_gate_not_ready'))
      } else if (
        caught instanceof ApiClientError &&
        caught.code === 'invalid_code'
      ) {
        setError(t('auth_gate_code_error'))
      } else if (step === 'email') {
        setError(t('auth_gate_email_error'))
      } else {
        setError(t('auth_gate_code_error'))
      }
    } finally {
      setWorking(false)
    }
  }

  return (
    <div
      className="auth-gate"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-gate-title"
      onClick={(event) => {
        if (event.target === event.currentTarget) closeGate()
      }}
    >
      <div className="auth-gate-card">
        <span className="auth-gate-kicker">{t('auth_gate_secure')}</span>
        <h2 id="auth-gate-title">{t('auth_gate_h')}</h2>
        <p>{t('auth_gate_p')}</p>
        <form className="auth-code-form" onSubmit={submit}>
          <label htmlFor="auth-gate-email">{t('auth_gate_email_label')}</label>
          <input
            id="auth-gate-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder={t('auth_gate_email_placeholder')}
            autoComplete="email"
            disabled={working || step === 'code'}
            required
          />

          {step === 'code' && (
            <>
              <p className="auth-code-note">{t('auth_gate_code_sent')}</p>
              <label htmlFor="auth-gate-code">{t('auth_gate_code_label')}</label>
              <input
                id="auth-gate-code"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                placeholder={t('auth_gate_code_placeholder')}
                inputMode="numeric"
                autoComplete="one-time-code"
                disabled={working}
                required
              />
            </>
          )}

          {error && <p className="auth-code-error">{error}</p>}

          <button className="btn btn-lime" type="submit" disabled={working}>
            {working
              ? t('auth_saving')
              : step === 'email'
                ? t('auth_gate_send_code')
                : t('auth_gate_verify_code')}
          </button>
        </form>
        <div className="auth-gate-actions">
          {step === 'code' && (
            <button
              className="btn btn-ghost"
              type="button"
              onClick={() => {
                setStep('email')
                setCode('')
                setError('')
              }}
            >
              {t('auth_gate_change_email')}
            </button>
          )}
          <button className="btn btn-ghost" type="button" onClick={closeGate}>
            {t('auth_gate_cancel')}
          </button>
        </div>
      </div>
    </div>
  )
}
