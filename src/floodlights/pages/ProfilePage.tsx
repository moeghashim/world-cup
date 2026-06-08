import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ApiClientError } from '../lib/apiClient'
import { useAuth } from '../lib/authContext'
import { useToast } from '../lib/toastContext'
import { useI18n } from '../i18n/context'
import { formatStatNumber } from '../lib/communityStats'
import { useStandings } from '../lib/standings'
import { SiteHeader } from '../components/SiteHeader'
import { SiteFooter } from '../components/SiteFooter'
import { SignInGate } from '../components/SignInGate'

function safeReturnTo(value: string | null): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/pickem'
  return value
}

export function ProfilePage() {
  const { lang, t } = useI18n()
  const { toast } = useToast()
  const auth = useAuth()
  const standings = useStandings()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [handle, setHandleInput] = useState('')
  const [signInOpen, setSignInOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const returnTo = safeReturnTo(searchParams.get('returnTo'))
  const setupMode = searchParams.get('setup') === 'handle' || auth.needsHandle

  const saveHandle = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)

    try {
      await auth.setHandle(handle)
      toast(t('profile_saved'), '✓')
      navigate(returnTo)
    } catch (error) {
      if (error instanceof ApiClientError && error.code === 'handle_taken') {
        toast(t('profile_handle_taken'), '!')
      } else if (error instanceof ApiClientError && error.code === 'bad_request') {
        toast(t('profile_handle_invalid'), '!')
      } else {
        toast(t('auth_save_failed'), '!')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <SiteHeader wide cta={{ key: 'cta_build', to: '/pickem' }} />

      <main className="profile-page wrap">
        <section className="profile-hero">
          <span className="sec-kick">{t('nav_profile')}</span>
          <h1>{t('profile_h1')}</h1>
          <p>{t('profile_sub')}</p>
        </section>

        {auth.loading ? (
          <section className="profile-card">
            <p className="profile-muted">{t('profile_loading')}</p>
          </section>
        ) : !auth.authenticated ? (
          <section className="profile-card">
            <h2>{t('profile_signedout_h')}</h2>
            <p className="profile-muted">{t('profile_signedout_p')}</p>
            <button
              className="btn btn-lime"
              type="button"
              onClick={() => setSignInOpen(true)}
            >
              {t('profile_signin')}
            </button>
          </section>
        ) : (
          <div className="profile-grid">
            <section className="profile-card">
              <h2>{t('profile_account_h')}</h2>
              <dl className="profile-list">
                <div>
                  <dt>{t('profile_email')}</dt>
                  <dd>{auth.user?.email}</dd>
                </div>
                <div>
                  <dt>{t('profile_handle')}</dt>
                  <dd>{auth.user?.handle ?? t('profile_no_handle')}</dd>
                </div>
                <div>
                  <dt>{t('profile_country')}</dt>
                  <dd>{auth.user?.countryAtSignup ?? t('profile_country_unknown')}</dd>
                </div>
              </dl>
              <button
                className="btn btn-ghost"
                type="button"
                onClick={() => void auth.signOut('/')}
              >
                {t('profile_signout')}
              </button>
            </section>

            <section className="profile-card profile-points-card">
              <h2>{t('profile_points_h')}</h2>
              <p className="profile-muted">{t('profile_points_p')}</p>
              <div className="profile-points-value">
                {formatStatNumber(lang, standings.me?.points ?? 0)}
              </div>
              <p className="profile-muted small">
                {standings.me
                  ? t('profile_points_rank', standings.me.rank)
                  : t('profile_points_empty')}
              </p>
              {standings.source.attribution && (
                <p className="profile-attribution">{t('standings_attribution')}</p>
              )}
            </section>

            {setupMode && (
              <section className="profile-card profile-handle-card">
                <h2>{t('profile_handle_h')}</h2>
                <p className="profile-muted">{t('profile_handle_p')}</p>
                <form className="profile-handle-form" onSubmit={saveHandle}>
                  <label htmlFor="profile-handle">{t('profile_handle')}</label>
                  <input
                    id="profile-handle"
                    value={handle}
                    onChange={(event) => setHandleInput(event.target.value)}
                    placeholder={t('profile_handle_placeholder')}
                    autoComplete="nickname"
                  />
                  <button
                    className="btn btn-lime"
                    type="submit"
                    disabled={saving}
                  >
                    {saving ? t('auth_saving') : t('profile_handle_save')}
                  </button>
                </form>
              </section>
            )}
          </div>
        )}
      </main>

      <SiteFooter wide noteKey="footer_note">
        <Link to="/pickem">{t('nav_pickem')}</Link>
        <Link to="/brackets">{t('nav_brackets')}</Link>
        <Link to="/sponsors">{t('nav_sponsor')}</Link>
      </SiteFooter>
      <SignInGate
        open={signInOpen}
        onClose={() => setSignInOpen(false)}
        returnTo={returnTo}
      />
    </>
  )
}
