import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import '../styles/home.css'
import { SPONSORS } from '../data'
import { useI18n } from '../i18n/context'
import { useToast } from '../lib/toastContext'
import { useReveal } from '../lib/useReveal'
import { confetti, pop } from '../lib/confetti'
import { GrowI } from '../lib/motion'
import { Ticker } from '../components/Ticker'
import { SiteHeader } from '../components/SiteHeader'
import { SiteFooter } from '../components/SiteFooter'
import { HashLink } from '../components/HashLink'
import { Flag } from '../components/Flag'
import { SponsorBand, SponsorCard, PresentingLogo, PrizeSponsor } from '../components/SponsorLogo'
import { SignInGate } from '../components/SignInGate'
import { formatKickoffUtc, getQuickPickMatches, useTournamentData } from '../lib/tournamentData'
import { ApiClientError, apiRequest } from '../lib/apiClient'
import { useAuth } from '../lib/authContext'
import {
  clearHomePrediction,
  loadHomePrediction,
  migrateAnonymousPicks,
  saveHomePrediction,
} from '../lib/accountMigration'
import { captureAnalyticsEvent } from '../../analytics'
import type { PredictionPayload } from '../lib/accountTypes'
import {
  formatPlusStatNumber,
  formatStatNumber,
  useCommunityStats,
} from '../lib/communityStats'

const SEP = '  ·  '
const MINI_COLS: string[][] = [['ARG', 'FRA', 'ESP', 'BRA'], ['ARG', 'BRA'], ['ARG']]
const PRIZE_WINNERS_PER_MATCH = 6

export function HomePage() {
  const { t, tname, lang } = useI18n()
  const { toast } = useToast()
  const auth = useAuth()
  useReveal()

  const communityStats = useCommunityStats()
  const tournamentData = useTournamentData()
  const quickMatches = getQuickPickMatches(tournamentData?.matches)
  const featuredMatch = quickMatches[0]
  const storedHomePrediction = loadHomePrediction()
  const [scores, setScores] = useState(() =>
    storedHomePrediction?.matchId === featuredMatch.id
      ? {
          home: storedHomePrediction.homeScore,
          away: storedHomePrediction.awayScore,
        }
      : { home: 0, away: 0 },
  )
  const [locked, setLocked] = useState(
    () => storedHomePrediction?.matchId === featuredMatch.id,
  )
  const [qp, setQp] = useState<Record<string, string>>({})
  const [gateOpen, setGateOpen] = useState(false)
  const [savingPrediction, setSavingPrediction] = useState(false)
  const homeRef = useRef<HTMLDivElement>(null)
  const awayRef = useRef<HTMLDivElement>(null)
  const lockRef = useRef<HTMLButtonElement>(null)

  const returnTo =
    typeof window === 'undefined'
      ? '/'
      : `${window.location.pathname}${window.location.search}#predict`

  const step = (team: 'home' | 'away', dir: number) => {
    setScores((s) => ({ ...s, [team]: Math.max(0, Math.min(9, s[team] + dir)) }))
    pop(team === 'home' ? homeRef.current : awayRef.current)
  }
  const sendToHandleSetup = () => {
    toast(t('auth_handle_needed'), '✦')
    window.location.assign(`/profile?setup=handle&returnTo=${encodeURIComponent(returnTo)}`)
  }

  const currentPrediction = (): PredictionPayload => ({
    matchId: featuredMatch.id,
    homeScore: scores.home,
    awayScore: scores.away,
    locked: true,
  })

  const persistPrediction = async (prediction: PredictionPayload) => {
    setSavingPrediction(true)
    try {
      if (auth.user) {
        await migrateAnonymousPicks(auth.user.id)
      }
      await apiRequest('/api/picks/predict', {
        method: 'PUT',
        body: prediction,
      })
      clearHomePrediction()
      setLocked(true)
      confetti(lockRef.current)
      toast(t('toast_pred'), '🎟')
      captureAnalyticsEvent('match_prediction_locked', {
        match_id: prediction.matchId,
        has_handle: true,
      })
    } catch (error) {
      if (error instanceof ApiClientError && error.code === 'handle_required') {
        sendToHandleSetup()
      } else if (error instanceof ApiClientError && error.code === 'pick_locked') {
        toast(t('toast_pick_locked'), '🔒')
      } else {
        toast(t('auth_save_failed'), '!')
      }
    } finally {
      setSavingPrediction(false)
    }
  }

  const lock = () => {
    if (locked) return
    const prediction = currentPrediction()
    saveHomePrediction(prediction)

    if (!auth.authenticated) {
      captureAnalyticsEvent('lock_gate_opened', { surface: 'home_prediction' })
      setGateOpen(true)
      return
    }

    if (auth.needsHandle) {
      sendToHandleSetup()
      return
    }

    void persistPrediction(prediction)
  }
  const pickQp = (id: string, p: string, el: Element) => {
    setQp((s) => ({ ...s, [id]: p }))
    pop(el, 1.12)
  }

  const outcome =
    scores.home === scores.away
      ? `${t('outcome_draw')} · ${scores.home}–${scores.away}`
      : `${tname(scores.home > scores.away ? featuredMatch.a : featuredMatch.b)} ${t('outcome_win')} · ${scores.home}–${scores.away}`
  const heroTrust =
    communityStats.players > 0
      ? t('hero_trust', formatPlusStatNumber(lang, communityStats.players))
      : t('hero_trust_empty')
  const ctaCopy =
    communityStats.players > 0
      ? t('cta_p', formatStatNumber(lang, communityStats.players))
      : t('cta_p_empty')
  const topChampionRows = communityStats.championDistribution.slice(0, 4)
  const maxChampionPct = Math.max(
    1,
    ...topChampionRows.map((row) => row.pct),
  )

  useEffect(() => {
    if (!auth.authenticated || auth.needsHandle || !auth.user) return

    let active = true

    async function syncHomePrediction() {
      const pending = loadHomePrediction()
      try {
        await migrateAnonymousPicks(auth.user!.id)
        if (pending?.matchId === featuredMatch.id) {
          await apiRequest('/api/picks/predict', {
            method: 'PUT',
            body: pending,
          })
          clearHomePrediction()
          if (!active) return
          setScores({ home: pending.homeScore, away: pending.awayScore })
          setLocked(true)
          toast(t('toast_pred'), '🎟')
          captureAnalyticsEvent('match_prediction_locked', {
            match_id: pending.matchId,
            migrated_after_sign_in: true,
          })
          return
        }

        const response = await apiRequest<{ predictions: PredictionPayload[] }>(
          '/api/picks/predict',
        )
        const savedPrediction = response.predictions.find(
          (prediction) => prediction.matchId === featuredMatch.id,
        )
        if (!active || !savedPrediction) return
        setScores({
          home: savedPrediction.homeScore,
          away: savedPrediction.awayScore,
        })
        setLocked(savedPrediction.locked)
      } catch (error) {
        if (error instanceof ApiClientError && error.code === 'pick_locked') {
          toast(t('toast_pick_locked'), '🔒')
        } else {
          toast(t('auth_save_failed'), '!')
        }
      }
    }

    void syncHomePrediction()

    return () => {
      active = false
    }
  }, [auth.authenticated, auth.needsHandle, auth.user, featuredMatch.id, t, toast])

  return (
    <>
      <Ticker>
        <span>
          ◢ World Cup 2026 · Match {featuredMatch.matchNumber}{SEP}<b>{featuredMatch.a}</b> v <b>{featuredMatch.b}</b>{SEP}{t('prize_free')}{SEP}48 {t('teams_word')}{SEP}
        </span>
      </Ticker>

      <SiteHeader cta={{ key: 'cta_build', to: '/pickem' }} />

      {/* HERO */}
      <section className="hero">
        <div className="floodsweep"></div>
        <div className="wrap hero-grid">
          <div>
            <span className="badge reveal"><span className="dot blink"></span><span>{t('hero_badge')}</span></span>
            <h1 className="reveal">
              <span>{t('hero_h1_1')}</span>
              <br />
              <span className="lime">{t('hero_h1_2')}</span> <span>{t('hero_h1_3')}</span>
              <br />
              <span className="cyan">{t('hero_h1_4')}</span> <span>{t('hero_h1_5')}</span> <span className="mag">{t('hero_h1_6')}</span>
            </h1>
            <p className="hero-sub reveal" dangerouslySetInnerHTML={{ __html: t('hero_sub') }} />
            <div className="hero-cta reveal">
              <Link to="/pickem" className="btn btn-lime btn-lg">{t('hero_cta1')}</Link>
              <Link to="/brackets" className="btn btn-ghost btn-lg">{t('hero_cta2')}</Link>
            </div>
            <div className="trust reveal">
              <div className="stack">
                <i style={{ background: 'var(--lime)' }}>JD</i>
                <i style={{ background: 'var(--cyan)' }}>AM</i>
                <i style={{ background: 'var(--mag)', color: '#fff' }}>KO</i>
                <i style={{ background: 'var(--amber)' }}>RS</i>
              </div>
              <p dangerouslySetInnerHTML={{ __html: heroTrust }} />
            </div>
          </div>

          <div className="board reveal" id="predict">
            <div className="board-top">
              <span className="t">{t('board_match')}</span>
              <span className="live"><span className="dot blink"></span><span>{t('board_live')}</span></span>
            </div>
            <div className="board-in">
              <div className="board-spon"><PresentingLogo /></div>
              <div className="board-fix">{tname(featuredMatch.a)} vs {tname(featuredMatch.b)}</div>
              <div className="board-meta">
                <span className="chip">{formatKickoffUtc(featuredMatch.kickoffAt)}</span>
                <span className="chip">📍 {featuredMatch.venue}</span>
                <span className="chip">Match {featuredMatch.matchNumber}</span>
              </div>
              <div className="led ledrow">
                <div className="tcell home">
                  <span className="tcode">{featuredMatch.a}</span>
                  <div className="tnm">{tname(featuredMatch.a)}</div>
                  <div className="sv led-digit" ref={homeRef}>{scores.home}</div>
                  <div className="stepper">
                    <button onClick={() => step('home', -1)}>−</button>
                    <button onClick={() => step('home', 1)}>+</button>
                  </div>
                </div>
                <div className="colon">:</div>
                <div className="tcell away">
                  <span className="tcode">{featuredMatch.b}</span>
                  <div className="tnm">{tname(featuredMatch.b)}</div>
                  <div className="sv led-digit" ref={awayRef}>{scores.away}</div>
                  <div className="stepper">
                    <button onClick={() => step('away', -1)}>−</button>
                    <button onClick={() => step('away', 1)}>+</button>
                  </div>
                </div>
              </div>
              <div className="outcome"><span>{t('board_call')}</span> <b>{outcome}</b></div>
              <button className={`btn btn-lime lockb ${locked ? 'locked' : ''}`} onClick={lock} ref={lockRef} disabled={savingPrediction}>
                {savingPrediction ? t('auth_saving') : locked ? t('lock_done') : t('lock_pred')}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* OFFICIAL PARTNERS BAND */}
      <SponsorBand />

      {/* HOW */}
      <section className="block" id="how" style={{ paddingTop: 24 }}>
        <div className="wrap">
          <div className="sec-head reveal">
            <span className="sec-kick" style={{ color: 'var(--lime-ink)', borderColor: 'rgba(201,255,61,.4)' }}>{t('how_kick')}</span>
            <h2>{t('how_h2')}</h2>
            <p>{t('how_sub')}</p>
          </div>
          <div className="steps">
            <div className="step reveal"><div className="n">01</div><h3>{t('how_1h')}</h3><p>{t('how_1p')}</p></div>
            <div className="step reveal"><div className="n">02</div><h3>{t('how_2h')}</h3><p>{t('how_2p')}</p></div>
            <div className="step reveal"><div className="n">03</div><h3>{t('how_3h')}</h3><p>{t('how_3p')}</p></div>
          </div>
        </div>
      </section>

      {/* FEATURE TEASERS */}
      <section className="block" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="feat">
            <div className="feat-card reveal">
              <div className="fk">{t('feat_bk_k')}</div>
              <h3>{t('feat_bk_h')}</h3>
              <p>{t('feat_bk_p')}</p>
              <div className="mini-bracket">
                {MINI_COLS.map((col, ci) => (
                  <div className="mini-col" key={ci}>
                    {col.map((c, i) => {
                      const win = ci === 2 || (i % 2 === 0 && ci < 2)
                      return (
                        <div className={`mini-slot ${win ? 'win' : ''}`.trim()} key={`${ci}-${c}`}>
                          <Flag code={c} size={18} />
                          {c}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
              <Link to="/pickem" className="btn btn-lime mt-auto">{t('feat_bk_cta')}</Link>
            </div>
            <div className="feat-card reveal">
              <div className="fk">{t('feat_pb_k')}</div>
              <h3>{t('feat_pb_h')}</h3>
              <p>{t('feat_pb_p')}</p>
              <div className="crowd-rows">
                {topChampionRows.length > 0 ? (
                  topChampionRows.map((r) => (
                    <div className="crow" key={r.code}>
                      {r.code === 'Other' ? (
                        <span className="flag other-flag">··</span>
                      ) : (
                        <Flag code={r.code} size={28} />
                      )}
                      <div className="bar"><GrowI width={`${(r.pct / maxChampionPct) * 100}%`} /></div>
                      <span className="pct">{r.pct}%</span>
                    </div>
                  ))
                ) : (
                  <div className="crowd-empty">{t('stats_empty')}</div>
                )}
              </div>
              <Link to="/brackets" className="btn btn-cyan mt-auto">{t('feat_pb_cta')}</Link>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK PICK'EM */}
      <section className="block" id="pickem" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="sec-head reveal">
            <span className="sec-kick" style={{ color: 'var(--cyan-ink)', borderColor: 'rgba(52,231,255,.4)' }}>{t('qp_kick')}</span>
            <h2>{t('qp_h2')}</h2>
            <p>{t('qp_sub')}</p>
          </div>
          <div className="qp-grid">
            {quickMatches.map((m) => {
              const sel = qp[m.id]
              const opt = (side: string, code: string) => (
                <div className={`qp-opt ${sel === side ? 'sel' : ''}`.trim()} onClick={(e) => pickQp(m.id, side, e.currentTarget)}>
                  <Flag code={code} size={32} />
                  <span className="nm">{tname(code)}</span>
                </div>
              )
              return (
                <div className={`qp ${sel ? 'picked' : ''}`.trim()} key={m.id}>
                  <div className="qp-top">
                    <span>{t('group_word')} {m.g} · Match {m.matchNumber}</span>
                    <span>{m.live ? t('qp_live') : m.d}</span>
                  </div>
                  <div className="qp-row">
                    {opt('a', m.a)}
                    <div className={`qp-draw ${sel === 'd' ? 'sel' : ''}`.trim()} onClick={(e) => pickQp(m.id, 'd', e.currentTarget)}>
                      {t('qp_draw')}
                    </div>
                    {opt('b', m.b)}
                  </div>
                </div>
              )
            })}
          </div>
          <div style={{ textAlign: 'center' }}>
            <Link to="/pickem" className="btn btn-lime btn-lg">{t('qp_cta')}</Link>
          </div>
        </div>
      </section>

      {/* PRIZES */}
      <section className="block" id="prizes" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="sec-head reveal">
            <span className="sec-kick" style={{ color: 'var(--mag-ink)', borderColor: 'rgba(255,46,155,.4)' }}>{t('prizes_k')}</span>
            <h2>{t('prizes_h2')}</h2>
            <p>{t('prizes_sub')}</p>
          </div>
          <div className="prize reveal">
            <div className="prize-photo">
              <span className="tag">{t('prize_fav')}</span>
              <img src="/assets/tshirt.png" alt="White cotton supporter tee" />
              <span className="price">~$45</span>
            </div>
            <div className="prize-info">
              <span className="k">{t('prize_item_k')}</span>
              <h3>{t('prize_item_h')}</h3>
              <p>{t('prize_item_p')}</p>
              <div className="pmeta">
                <div className="pcard"><div className="n">{PRIZE_WINNERS_PER_MATCH}</div><div className="l">{t('prize_winners')}</div></div>
                <div className="pcard"><div className="n">{formatStatNumber(lang, communityStats.players)}</div><div className="l">{t('prize_joined')}</div></div>
                <div className="pcard"><div className="n">{t('prize_free')}</div><div className="l">{t('prize_free')}</div></div>
              </div>
              <Link to="/pickem" className="btn btn-cyan">{t('prize_cta')}</Link>
              <PrizeSponsor />
            </div>
          </div>
        </div>
      </section>

      {/* SPONSORS */}
      <section className="block" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="sec-head reveal">
            <span className="sec-kick" style={{ color: 'var(--lime-ink)', borderColor: 'rgba(201,255,61,.4)' }}>{t('sponsors_k')}</span>
            <h2>{t('sponsors_h2')}</h2>
          </div>
          <div className="sp-row reveal">
            {SPONSORS.map((s) => (
              <SponsorCard key={s.id} sponsor={s} />
            ))}
          </div>
          <div className="sponsor-spot reveal"><span className="badge-mark"></span><span>{t('sponsor_spot')}</span></div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <div className="wrap">
          <h2 className="reveal"><span>{t('cta_h2_1')}</span> <span className="lime">{t('cta_h2_2')}</span></h2>
          <p className="reveal">{ctaCopy}</p>
          <Link to="/pickem" className="btn btn-lime btn-lg reveal">{t('hero_cta1')}</Link>
        </div>
      </section>

      <SignInGate
        open={gateOpen}
        onClose={() => setGateOpen(false)}
        returnTo={returnTo}
      />

      <SiteFooter noteKey="footer_note">
        <Link to="/pickem">{t('nav_pickem')}</Link>
        <Link to="/brackets">{t('nav_brackets')}</Link>
        <HashLink to="/" hash="prizes">{t('nav_prizes')}</HashLink>
        <a href="#" onClick={(e) => e.preventDefault()}>{t('foot_rules')}</a>
      </SiteFooter>
    </>
  )
}
