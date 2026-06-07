import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import '../styles/sponsors.css'
import { GROUPS, sponsorById, SPONSORS } from '../data'
import { useI18n } from '../i18n/context'
import { useToast } from '../lib/toastContext'
import { useReveal } from '../lib/useReveal'
import { confetti } from '../lib/confetti'
import { CountUp } from '../lib/motion'
import { Ticker } from '../components/Ticker'
import { SiteHeader } from '../components/SiteHeader'
import { SiteFooter } from '../components/SiteFooter'
import { Flag } from '../components/Flag'
import { SponsorCard, SponsorLogo, SponsorBand, PresentingLogo, PrizeSponsor } from '../components/SponsorLogo'

const SEP = '  ·  '

const REACH = [
  { value: 12400, key: 'stat_players' },
  { value: 96000, key: 'stat_views' },
  { value: 104, key: 'stat_matches_c' },
  { value: 31, key: 'stat_days_c' },
] as const

const WHY = [
  { ic: '🎁', color: 'var(--lime-ink)', h: 'spon_why1_h', p: 'spon_why1_p' },
  { ic: '📅', color: 'var(--cyan-ink)', h: 'spon_why2_h', p: 'spon_why2_p' },
  { ic: '✨', color: 'var(--mag-ink)', h: 'spon_why3_h', p: 'spon_why3_p' },
] as const

interface Tier { id: string; feat?: boolean; name: string; desc: string; feats: [string, string, string]; btn: string }
const TIERS: Tier[] = [
  { id: 'presenting', feat: true, name: 'tier_presenting', desc: 'tier_presenting_p', feats: ['tp1a', 'tp1b', 'tp1c'], btn: 'btn-lime' },
  { id: 'match', name: 'tier_match', desc: 'tier_match_p', feats: ['tp2a', 'tp2b', 'tp2c'], btn: 'btn-ghost' },
  { id: 'prize', name: 'tier_prize', desc: 'tier_prize_p', feats: ['tp3a', 'tp3b', 'tp3c'], btn: 'btn-ghost' },
  { id: 'spot', name: 'tier_spot', desc: 'tier_spot_p', feats: ['tp4a', 'tp4b', 'tp4c'], btn: 'btn-ghost' },
]

function CheckIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 14 14">
      <path d="M3 7.5 L6 10.5 L11 4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function SponsorsPage() {
  const { t, tname } = useI18n()
  const { toast } = useToast()
  useReveal()

  const [tier, setTier] = useState('presenting')
  const submitRef = useRef<HTMLButtonElement>(null)
  const culture = sponsorById('culture')
  const groupA = GROUPS.A.slice(0, 3)

  const pickTier = (id: string) => {
    setTier(id)
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    toast(t('tier_' + id), '🤝')
  }

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    confetti(submitRef.current)
    toast(t('form_sent'), '✉')
    e.currentTarget.reset()
    setTier('presenting')
  }

  return (
    <>
      <Ticker>
        <span>
          ◢ {t('spon_kick')}{SEP}<b>12,400</b> {t('stat_players')}{SEP}31 {t('stat_days_c')}{SEP}
        </span>
      </Ticker>

      <SiteHeader wide cta={{ key: 'spon_cta1', to: '#contact' }} />

      {/* HERO */}
      <section className="spon-head">
        <div className="floodsweep"></div>
        <div className="wrap-wide">
          <span className="sec-kick reveal" style={{ color: 'var(--cyan-ink)', borderColor: 'rgba(52,231,255,.4)' }}>
            {t('spon_kick')}
          </span>
          <h1 className="reveal">
            {t('spon_h1_1')} <span className="cyan">{t('spon_h1_2')}</span>
          </h1>
          <p className="reveal">{t('spon_sub')}</p>
          <div className="head-cta reveal">
            <a href="#contact" className="btn btn-lime btn-lg">{t('spon_cta1')}</a>
            <a href="#packages" className="btn btn-ghost btn-lg">{t('spon_cta2')}</a>
          </div>
        </div>
      </section>

      {/* REACH */}
      <section className="block" style={{ paddingTop: 34 }}>
        <div className="wrap-wide">
          <div className="sec-head left reveal" style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 'clamp(26px,3vw,38px)' }}>{t('spon_reach_h')}</h2>
          </div>
          <div className="reach reveal">
            {REACH.map((s) => (
              <div className="stat" key={s.key}>
                <CountUp className="n" value={s.value} />
                <span className="l">{t(s.key)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY */}
      <section className="block" style={{ paddingTop: 0 }}>
        <div className="wrap-wide">
          <div className="sec-head left reveal" style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 'clamp(26px,3vw,38px)' }}>{t('spon_why_h')}</h2>
          </div>
          <div className="why">
            {WHY.map((w) => (
              <div className="why-card reveal" key={w.h}>
                <div className="ic" style={{ color: w.color }}>{w.ic}</div>
                <h3>{t(w.h)}</h3>
                <p>{t(w.p)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PACKAGES */}
      <section className="block" id="packages" style={{ paddingTop: 0 }}>
        <div className="wrap-wide">
          <div className="sec-head left reveal" style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 'clamp(26px,3vw,38px)' }}>{t('spon_tiers_h')}</h2>
            <p style={{ marginLeft: 0 }}>{t('spon_tiers_p')}</p>
          </div>
          <div className="tiers">
            {TIERS.map((tr) => (
              <div className={`tier reveal ${tr.feat ? 'feat' : ''}`.trim()} key={tr.id}>
                {tr.feat && <span className="pop">{t('tier_popular')}</span>}
                <div className="tname">{t(tr.name)}</div>
                <div className="tdesc">{t(tr.desc)}</div>
                <ul>
                  {tr.feats.map((f) => (
                    <li key={f}>
                      <CheckIcon />
                      <span>{t(f)}</span>
                    </li>
                  ))}
                </ul>
                <button className={`btn ${tr.btn} tier-pick`} onClick={() => pickTier(tr.id)}>
                  {t('tier_cta')}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INVENTORY */}
      <section className="block" style={{ paddingTop: 0 }}>
        <div className="wrap-wide">
          <div className="sec-head left reveal" style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 'clamp(26px,3vw,38px)' }}>{t('spon_inv_h')}</h2>
            <p style={{ marginLeft: 0 }}>{t('spon_inv_p')}</p>
          </div>
          <div className="inv">
            <div className="inv-card reveal">
              <div className="inv-h"><span className="dot"></span><span>{t('inv_board')}</span></div>
              <div className="inv-demo">
                <div className="demo-board">
                  <div className="db-top"><span>{t('board_match')}</span></div>
                  <PresentingLogo />
                </div>
              </div>
            </div>
            <div className="inv-card reveal">
              <div className="inv-h"><span className="dot"></span><span>{t('inv_group')}</span></div>
              <div className="inv-demo">
                <div className="demo-group">
                  <div className="dg-head">
                    <span className="dg-name">{t('group_word')} A</span>
                    {culture && <SponsorLogo sponsor={culture} size={22} nameSize={11} />}
                  </div>
                  {groupA.map((c) => (
                    <div className="dg-row" key={c}>
                      <Flag code={c} size={20} />
                      <span>{tname(c)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="inv-card reveal">
              <div className="inv-h"><span className="dot"></span><span>{t('inv_prize')}</span></div>
              <div className="inv-demo">
                <PrizeSponsor />
              </div>
            </div>
            <div className="inv-card reveal">
              <div className="inv-h"><span className="dot"></span><span>{t('inv_band')}</span></div>
              <div className="inv-demo" style={{ padding: 10 }}>
                <SponsorBand style={{ border: 'none', background: 'none', padding: 0, gap: 12 }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BACKERS */}
      <section className="block" style={{ paddingTop: 0 }}>
        <div className="wrap-wide">
          <div className="sec-head left reveal" style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 'clamp(26px,3vw,38px)' }}>{t('spon_backers_h')}</h2>
            <p style={{ marginLeft: 0 }}>{t('spon_backers_p')}</p>
          </div>
          <div className="sp-row reveal">
            {SPONSORS.map((s) => (
              <SponsorCard key={s.id} sponsor={s} />
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section className="block" id="contact" style={{ paddingTop: 0 }}>
        <div className="wrap-wide contact">
          <div className="contact-info reveal">
            <h2>{t('spon_form_h')}</h2>
            <p>{t('spon_form_p')}</p>
            <a className="mailto" href="mailto:partners@win2026.example">✉ partners@win2026.example</a>
          </div>
          <form className="form reveal" onSubmit={onSubmit}>
            <div className="form-row two">
              <div>
                <label>{t('form_name')}</label>
                <input type="text" name="name" required />
              </div>
              <div>
                <label>{t('form_company')}</label>
                <input type="text" name="company" required />
              </div>
            </div>
            <div className="form-row">
              <label>{t('form_email')}</label>
              <input type="email" name="email" required />
            </div>
            <div className="form-row">
              <label>{t('form_tier')}</label>
              <select name="tier" value={tier} onChange={(e) => setTier(e.target.value)}>
                {TIERS.map((tr) => (
                  <option value={tr.id} key={tr.id}>{t(tr.name)}</option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <label>{t('form_msg')}</label>
              <textarea name="msg"></textarea>
            </div>
            <button type="submit" className="btn btn-lime" ref={submitRef}>{t('form_send')}</button>
          </form>
        </div>
      </section>

      <SiteFooter wide noteKey="spon_foot">
        <Link to="/">{t('nav_home')}</Link>
        <Link to="/pickem">{t('nav_pickem')}</Link>
        <Link to="/brackets">{t('nav_brackets')}</Link>
        <a href="#" onClick={(e) => e.preventDefault()}>{t('foot_rules')}</a>
      </SiteFooter>
    </>
  )
}
