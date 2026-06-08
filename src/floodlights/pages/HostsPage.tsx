import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { Ticker } from '../components/Ticker'
import { SiteHeader } from '../components/SiteHeader'
import { SiteFooter } from '../components/SiteFooter'
import { SignInGate } from '../components/SignInGate'
import { SponsorBand } from '../components/SponsorLogo'
import { useAuth } from '../lib/authContext'
import { ApiClientError, apiRequest } from '../lib/apiClient'
import type { HostSummary } from '../lib/accountTypes'
import { load, remove, save } from '../lib/storage'
import { useToast } from '../lib/toastContext'
import { useI18n } from '../i18n/context'
import { captureAnalyticsEvent } from '../../analytics'

const pendingCreateKey = 'pending_host_create'
const pendingJoinKey = 'pending_host_join'

function fullUrl(path: string): string {
  if (typeof window === 'undefined') return path
  return `${window.location.origin}${path}`
}

export function HostsPage() {
  const { t } = useI18n()
  const auth = useAuth()
  const { toast } = useToast()
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [createdHost, setCreatedHost] = useState<HostSummary | null>(null)
  const [joinedHost, setJoinedHost] = useState<HostSummary | null>(null)
  const [gateOpen, setGateOpen] = useState(false)
  const [working, setWorking] = useState<'create' | 'join' | null>(null)

  const returnTo = '/hosts'

  const needHandle = () => {
    toast(t('auth_handle_needed'), '✦')
    window.location.assign(`/profile?setup=handle&returnTo=${encodeURIComponent(returnTo)}`)
  }

  const requireAccount = (action: 'create' | 'join') => {
    captureAnalyticsEvent('lock_gate_opened', { surface: `host_${action}` })
    setGateOpen(true)
  }

  const createHost = async (hostName: string) => {
    setWorking('create')
    try {
      const response = await apiRequest<{ host: HostSummary }>('/api/hosts', {
        method: 'POST',
        body: { name: hostName },
      })
      remove(pendingCreateKey)
      setCreatedHost(response.host)
      setName('')
      toast(t('hosts_created'), '✓')
      captureAnalyticsEvent('host_created')
    } catch (error) {
      if (error instanceof ApiClientError && error.code === 'handle_required') {
        needHandle()
      } else {
        toast(t('hosts_create_error'), '!')
      }
    } finally {
      setWorking(null)
    }
  }

  const joinHost = async (hostCode: string) => {
    setWorking('join')
    try {
      const response = await apiRequest<{ host: HostSummary }>('/api/hosts/join', {
        method: 'POST',
        body: { code: hostCode },
      })
      remove(pendingJoinKey)
      setJoinedHost(response.host)
      setCode('')
      toast(t('hosts_joined'), '✓')
      captureAnalyticsEvent('host_joined', { method: 'code' })
    } catch (error) {
      if (error instanceof ApiClientError && error.code === 'handle_required') {
        needHandle()
      } else if (error instanceof ApiClientError && error.code === 'host_not_found') {
        toast(t('hosts_not_found'), '!')
      } else {
        toast(t('hosts_join_error'), '!')
      }
    } finally {
      setWorking(null)
    }
  }

  const submitCreate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const hostName = name.trim()
    if (!hostName) return

    if (!auth.authenticated) {
      save(pendingCreateKey, hostName)
      requireAccount('create')
      return
    }
    if (auth.needsHandle) {
      save(pendingCreateKey, hostName)
      needHandle()
      return
    }

    void createHost(hostName)
  }

  const submitJoin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const hostCode = code.trim()
    if (!hostCode) return

    if (!auth.authenticated) {
      save(pendingJoinKey, hostCode)
      requireAccount('join')
      return
    }
    if (auth.needsHandle) {
      save(pendingJoinKey, hostCode)
      needHandle()
      return
    }

    void joinHost(hostCode)
  }

  useEffect(() => {
    if (!auth.authenticated || auth.needsHandle) return

    const pendingCreate = load<string | null>(pendingCreateKey, null)
    if (pendingCreate) {
      void createHost(pendingCreate)
      return
    }

    const pendingJoin = load<string | null>(pendingJoinKey, null)
    if (pendingJoin) {
      void joinHost(pendingJoin)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.authenticated, auth.needsHandle])

  return (
    <>
      <Ticker>
        <span>◢ {t('hosts_ticker')}</span>
      </Ticker>
      <SiteHeader wide cta={{ key: 'cta_playnow', to: '/pickem' }} />

      <main className="hosts-page wrap">
        <section className="hosts-hero">
          <span className="sec-kick">{t('hosts_kick')}</span>
          <h1>{t('hosts_h1')}</h1>
          <p>{t('hosts_sub')}</p>
        </section>

        <section className="hosts-grid">
          <form className="host-card" onSubmit={submitCreate}>
            <span className="host-card-k">{t('hosts_create_k')}</span>
            <h2>{t('hosts_create_h')}</h2>
            <p>{t('hosts_create_p')}</p>
            <label htmlFor="host-name">{t('hosts_name_label')}</label>
            <input
              id="host-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={t('hosts_name_placeholder')}
              maxLength={80}
            />
            <button className="btn btn-lime" type="submit" disabled={working === 'create'}>
              {working === 'create' ? t('auth_saving') : t('hosts_create_btn')}
            </button>
          </form>

          <form className="host-card" onSubmit={submitJoin}>
            <span className="host-card-k cyan">{t('hosts_join_k')}</span>
            <h2>{t('hosts_join_h')}</h2>
            <p>{t('hosts_join_p')}</p>
            <label htmlFor="host-code">{t('hosts_code_label')}</label>
            <input
              id="host-code"
              value={code}
              onChange={(event) => setCode(event.target.value.toUpperCase())}
              placeholder="AB12C3"
              maxLength={8}
            />
            <button className="btn btn-cyan" type="submit" disabled={working === 'join'}>
              {working === 'join' ? t('auth_saving') : t('hosts_join_btn')}
            </button>
          </form>
        </section>

        {(createdHost || joinedHost) && (
          <section className="host-result">
            {createdHost && (
              <div className="host-result-card">
                <div>
                  <span className="host-card-k">{t('hosts_created_k')}</span>
                  <h2>{createdHost.name}</h2>
                  <p>{t('hosts_created_p')}</p>
                  <div className="host-link-row">
                    <code>{fullUrl(createdHost.joinPath)}</code>
                    <Link className="btn btn-lime btn-sm" to={createdHost.joinPath}>{t('hosts_open')}</Link>
                  </div>
                  <div className="host-code-pill">{t('hosts_code_label')}: <b>{createdHost.code}</b></div>
                </div>
                <div className="host-qr" aria-label={t('hosts_qr_label')}>
                  <QRCodeSVG value={fullUrl(createdHost.joinPath)} size={148} level="M" />
                </div>
              </div>
            )}

            {joinedHost && (
              <div className="host-result-card compact">
                <div>
                  <span className="host-card-k cyan">{t('hosts_joined_k')}</span>
                  <h2>{joinedHost.name}</h2>
                  <p>{t('hosts_joined_p')}</p>
                </div>
                <Link className="btn btn-cyan" to={joinedHost.publicPath}>{t('hosts_open')}</Link>
              </div>
            )}
          </section>
        )}
      </main>

      <SponsorBand />
      <SiteFooter wide noteKey="footer_note">
        <Link to="/pickem">{t('nav_pickem')}</Link>
        <Link to="/brackets">{t('nav_brackets')}</Link>
        <Link to="/sponsors">{t('nav_sponsor')}</Link>
      </SiteFooter>
      <SignInGate
        open={gateOpen}
        onClose={() => setGateOpen(false)}
        returnTo={returnTo}
      />
    </>
  )
}
