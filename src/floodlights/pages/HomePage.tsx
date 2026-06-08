import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import '../styles/home.css'
import { CROWD_CHAMPION, SPONSORS } from '../data'
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
import { formatKickoffUtc, getQuickPickMatches, useTournamentData } from '../lib/tournamentData'

const SEP = '  ·  '
const MINI_COLS: string[][] = [['ARG', 'FRA', 'ESP', 'BRA'], ['ARG', 'BRA'], ['ARG']]

export function HomePage() {
  const { t, tname } = useI18n()
  const { toast } = useToast()
  useReveal()

  const tournamentData = useTournamentData()
  const quickMatches = getQuickPickMatches(tournamentData?.matches)
  const featuredMatch = quickMatches[0]
  const [scores, setScores] = useState({ home: 0, away: 0 })
  const [locked, setLocked] = useState(false)
  const [qp, setQp] = useState<Record<string, string>>({})
  const homeRef = useRef<HTMLDivElement>(null)
  const awayRef = useRef<HTMLDivElement>(null)
  const lockRef = useRef<HTMLButtonElement>(null)

  const step = (team: 'home' | 'away', dir: number) => {
    setScores((s) => ({ ...s, [team]: Math.max(0, Math.min(9, s[team] + dir)) }))
    pop(team === 'home' ? homeRef.current : awayRef.current)
  }
  const lock = () => {
    if (locked) return
    setLocked(true)
    confetti(lockRef.current)
    toast(t('toast_pred'), '🎟')
  }
  const pickQp = (id: string, p: string, el: Element) => {
    setQp((s) => ({ ...s, [id]: p }))
    pop(el, 1.12)
  }

  const outcome =
    scores.home === scores.away
      ? `${t('outcome_draw')} · ${scores.home}–${scores.away}`
      : `${tname(scores.home > scores.away ? featuredMatch.a : featuredMatch.b)} ${t('outcome_win')} · ${scores.home}–${scores.away}`

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
              <p dangerouslySetInnerHTML={{ __html: t('hero_trust') }} />
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
              <button className={`btn btn-lime lockb ${locked ? 'locked' : ''}`} onClick={lock} ref={lockRef}>
                {locked ? t('lock_done') : t('lock_pred')}
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
                {CROWD_CHAMPION.slice(0, 4).map((r) => (
                  <div className="crow" key={r.code}>
                    <Flag code={r.code} size={28} />
                    <div className="bar"><GrowI width={`${(r.pct / 21) * 100}%`} /></div>
                    <span className="pct">{r.pct}%</span>
                  </div>
                ))}
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
                <div className="pcard"><div className="n">6</div><div className="l">{t('prize_winners')}</div></div>
                <div className="pcard"><div className="n">317</div><div className="l">{t('prize_joined')}</div></div>
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
          <p className="reveal">{t('cta_p')}</p>
          <Link to="/pickem" className="btn btn-lime btn-lg reveal">{t('hero_cta1')}</Link>
        </div>
      </section>

      <SiteFooter noteKey="footer_note">
        <Link to="/pickem">{t('nav_pickem')}</Link>
        <Link to="/brackets">{t('nav_brackets')}</Link>
        <HashLink to="/" hash="prizes">{t('nav_prizes')}</HashLink>
        <a href="#" onClick={(e) => e.preventDefault()}>{t('foot_rules')}</a>
      </SiteFooter>
    </>
  )
}
