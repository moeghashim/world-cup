import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { Ticker } from '../components/Ticker'
import { SiteHeader } from '../components/SiteHeader'
import { SiteFooter } from '../components/SiteFooter'
import { SignInGate } from '../components/SignInGate'
import { Flag } from '../components/Flag'
import { useAuth } from '../lib/authContext'
import { ApiClientError, apiRequest } from '../lib/apiClient'
import type { PublicHost } from '../lib/accountTypes'
import { useToast } from '../lib/toastContext'
import { useI18n } from '../i18n/context'
import { captureAnalyticsEvent } from '../../analytics'

function fullUrl(path: string): string {
  if (typeof window === 'undefined') return path
  return `${window.location.origin}${path}`
}

export function HostPage() {
  const { slug = '' } = useParams()
  const [searchParams] = useSearchParams()
  const joinCode = searchParams.get('join') ?? ''
  const auth = useAuth()
  const { t, tname } = useI18n()
  const { toast } = useToast()
  const [host, setHost] = useState<PublicHost | null>(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [joined, setJoined] = useState(false)
  const [gateOpen, setGateOpen] = useState(false)

  const returnTo = `/h/${slug}${joinCode ? `?join=${joinCode}` : ''}`
  const qrValue = useMemo(() => (host ? fullUrl(host.joinPath) : ''), [host])

  const loadHost = async () => {
    setLoading(true)
    try {
      const response = await apiRequest<{ host: PublicHost }>(`/api/hosts/${slug}`)
      setHost(response.host)
    } catch {
      setHost(null)
    } finally {
      setLoading(false)
    }
  }

  const needHandle = () => {
    toast(t('auth_handle_needed'), '✦')
    window.location.assign(`/profile?setup=handle&returnTo=${encodeURIComponent(returnTo)}`)
  }

  const joinHost = async (method: 'link' | 'qr' | 'button') => {
    if (!host) return
    if (!auth.authenticated) {
      captureAnalyticsEvent('lock_gate_opened', { surface: 'host_join' })
      setGateOpen(true)
      return
    }
    if (auth.needsHandle) {
      needHandle()
      return
    }

    setJoining(true)
    try {
      await apiRequest('/api/hosts/join', {
        method: 'POST',
        body: joinCode ? { code: joinCode } : { slug: host.slug },
      })
      setJoined(true)
      toast(t('hosts_joined'), '✓')
      captureAnalyticsEvent('host_joined', { method })
      await loadHost()
    } catch (error) {
      if (error instanceof ApiClientError && error.code === 'handle_required') {
        needHandle()
      } else {
        toast(t('hosts_join_error'), '!')
      }
    } finally {
      setJoining(false)
    }
  }

  useEffect(() => {
    void Promise.resolve().then(() => loadHost())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug])

  useEffect(() => {
    if (!joinCode || joined || !host || !auth.authenticated || auth.needsHandle) return
    void Promise.resolve().then(() => joinHost('link'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.authenticated, auth.needsHandle, host, joinCode, joined])

  const leaderboard = host?.members ?? []
  const topConsensus = host?.matchConsensus.slice(0, 6) ?? []

  return (
    <>
      <Ticker>
        <span>◢ {host ? host.name : t('hosts_h1')} · {t('hosts_public_ticker')}</span>
      </Ticker>
      <SiteHeader wide cta={{ key: 'hosts_create_btn', to: '/hosts' }} />

      <main className="host-public wrap">
        {loading ? (
          <section className="host-card">
            <p>{t('profile_loading')}</p>
          </section>
        ) : !host ? (
          <section className="host-card">
            <span className="host-card-k">{t('hosts_not_found')}</span>
            <h1>{t('hosts_not_found_h')}</h1>
            <Link to="/hosts" className="btn btn-lime">{t('nav_hosts')}</Link>
          </section>
        ) : (
          <>
            <section className="host-public-hero">
              <div>
                <span className="sec-kick">{t('hosts_public_k')}</span>
                <h1>{host.name}</h1>
                <p>{t('hosts_public_sub')}</p>
                <div className="host-public-actions">
                  <button className="btn btn-lime" type="button" disabled={joining} onClick={() => void joinHost(joinCode ? 'link' : 'button')}>
                    {joining ? t('auth_saving') : joined ? t('hosts_joined') : t('hosts_join_this')}
                  </button>
                  <Link className="btn btn-ghost" to="/hosts">{t('hosts_join_code_cta')}</Link>
                </div>
              </div>
              <div className="host-share-card">
                <div className="host-qr">
                  {qrValue && <QRCodeSVG value={qrValue} size={148} level="M" />}
                </div>
                <div className="host-code-pill">{t('hosts_code_label')}: <b>{host.code}</b></div>
                <code>{fullUrl(host.joinPath)}</code>
              </div>
            </section>

            <section className="host-stat-grid">
              <div className="host-stat"><span>{host.memberCount}</span><b>{t('hosts_member_count')}</b></div>
              <div className="host-stat"><span>{host.mostPickedChampion ? tname(host.mostPickedChampion) : '—'}</span><b>{t('hosts_most_picked')}</b></div>
              <div className="host-stat"><span>{topConsensus.length}</span><b>{t('hosts_consensus')}</b></div>
            </section>

            <section className="host-panels">
              <div className="host-panel">
                <div className="host-panel-head">
                  <h2>{t('hosts_leaderboard')}</h2>
                  <span>{t('hosts_points_note')}</span>
                </div>
                {leaderboard.length ? (
                  <div className="host-leaderboard">
                    {leaderboard.map((member, index) => (
                      <div className="host-member" key={`${member.handle}-${member.joinedAt}`}>
                        <span className="host-rank">{index + 1}</span>
                        <span className="host-handle">{member.handle}</span>
                        <span className="host-champ">
                          {member.champion ? <Flag code={member.champion} size={24} /> : null}
                          {member.champion ? tname(member.champion) : t('not_picked')}
                        </span>
                        <span className="host-points">{member.points}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="host-empty">{t('hosts_empty')}</p>
                )}
              </div>

              <div className="host-panel">
                <div className="host-panel-head">
                  <h2>{t('hosts_consensus')}</h2>
                </div>
                {topConsensus.length ? (
                  <div className="host-consensus">
                    {topConsensus.map((item) => (
                      <div className="host-consensus-row" key={`${item.matchId}-${item.pick}`}>
                        <span>{item.matchId}</span>
                        <b>{t(`hosts_pick_${item.pick}`)}</b>
                        <em>{item.count}</em>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="host-empty">{t('hosts_consensus_empty')}</p>
                )}
              </div>
            </section>
          </>
        )}
      </main>

      <SiteFooter wide noteKey="footer_note">
        <Link to="/hosts">{t('nav_hosts')}</Link>
        <Link to="/pickem">{t('nav_pickem')}</Link>
        <Link to="/brackets">{t('nav_brackets')}</Link>
      </SiteFooter>
      <SignInGate
        open={gateOpen}
        onClose={() => setGateOpen(false)}
        returnTo={returnTo}
      />
    </>
  )
}
