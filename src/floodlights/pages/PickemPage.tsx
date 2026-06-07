import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import '../styles/pickem.css'
import { GROUPS, GROUP_KEYS, KO_PTS, KO_ROUNDS, MATCHES, MAX_KO_PICKS, SPONSORS } from '../data'
import { useI18n } from '../i18n/context'
import { useToast } from '../lib/toastContext'
import { useReveal } from '../lib/useReveal'
import { confetti, pop } from '../lib/confetti'
import { load, save } from '../lib/storage'
import {
  champion,
  decodeState,
  emptyState,
  encodeState,
  koCount,
  koKey,
  koPick,
  normalize,
  teamsFor,
} from '../lib/bracket'
import type { BracketState } from '../lib/bracket'
import { Ticker } from '../components/Ticker'
import { SiteHeader } from '../components/SiteHeader'
import { SiteFooter } from '../components/SiteFooter'
import { Flag } from '../components/Flag'
import { SponsorBand } from '../components/SponsorLogo'

const SEP = '  ·  '
const R_KEYS = ['r_r32', 'r_r16', 'r_qf', 'r_sf', 'r_final']

/** decode a shared bracket from the current URL hash, if any (read once on mount) */
function readSharedBracket(): BracketState | null {
  if (typeof window === 'undefined') return null
  const m = /[#&]b=([^&]+)/.exec(window.location.hash)
  if (!m) return null
  return decodeState(m[1])
}

const groupDoneIn = (groups: Record<string, string[]>, g: string) => (groups[g] || []).length >= 3
const allGroupsDoneIn = (groups: Record<string, string[]>) => GROUP_KEYS.every((g) => groupDoneIn(groups, g))
const wildReady = (st: BracketState) => allGroupsDoneIn(st.groups) && st.thirds.length === 8
const fullyDone = (st: BracketState) => wildReady(st) && koCount(st) === MAX_KO_PICKS
const fourth = (st: BracketState, g: string): string | null => {
  const r = st.groups[g] || []
  if (r.length < 3) return null
  return GROUPS[g].find((c) => r.indexOf(c) < 0) ?? null
}
const potPts = (st: BracketState) => Object.keys(st.ko).reduce((p, k) => p + KO_PTS[+k.charAt(1)], 0)

interface GroupPicks { picks: Record<number, string>; locked: boolean }

export function PickemPage() {
  const { t, tname } = useI18n()
  const { toast } = useToast()
  useReveal()

  const [state, setState] = useState<BracketState>(() => readSharedBracket() ?? normalize(load('bracket', {})))
  const [viewing, setViewing] = useState(() => readSharedBracket() !== null)
  const [showBanner, setShowBanner] = useState(() => readSharedBracket() !== null)
  const [gp, setGp] = useState<GroupPicks>(() => {
    const g = load<GroupPicks>('grouppicks', { picks: {}, locked: false })
    return { picks: g.picks || {}, locked: !!g.locked }
  })
  const [modalOpen, setModalOpen] = useState(false)
  const [shareUrl, setShareUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const popTarget = useRef<{ r: number; m: number } | null>(null)
  const lockRef = useRef<HTMLButtonElement>(null)
  const gpLockRef = useRef<HTMLButtonElement>(null)

  const commit = (next: BracketState, isViewing = viewing) => {
    setState(next)
    if (!isViewing) save('bracket', next)
  }

  // pop the freshly-advanced knockout slot after a render
  useEffect(() => {
    const tgt = popTarget.current
    if (!tgt) return
    popTarget.current = null
    pop(document.querySelector(`.slot.sel[data-r="${tgt.r}"][data-m="${tgt.m}"]`))
  }, [state])

  /* ---------------- groups ---------------- */
  const chooseGroup = (g: string, code: string) => {
    if (viewing || state.locked) return
    let rank = (state.groups[g] || []).slice()
    const idx = rank.indexOf(code)
    if (idx >= 0) rank = rank.slice(0, idx)
    else if (rank.length < 3) rank.push(code)
    else return
    const groups = { ...state.groups, [g]: rank }
    const thirds = state.thirds.filter((tg) => groupDoneIn(groups, tg))
    commit({ ...state, groups, thirds, ko: {} })
  }

  /* ---------------- wildcards ---------------- */
  const toggleWild = (g: string) => {
    if (viewing || state.locked) return
    const i = state.thirds.indexOf(g)
    const thirds = state.thirds.slice()
    if (i > -1) thirds.splice(i, 1)
    else {
      if (thirds.length >= 8) {
        toast(t('wild_h'), '🃏')
        return
      }
      thirds.push(g)
    }
    thirds.sort((a, b) => GROUP_KEYS.indexOf(a) - GROUP_KEYS.indexOf(b))
    commit({ ...state, thirds, ko: {} })
  }

  /* ---------------- knockout ---------------- */
  const clearKoPath = (ko: Record<string, string>, r: number, m: number) => {
    if (r >= KO_ROUNDS.length - 1) return
    const dr = r + 1
    const dm = Math.floor(m / 2)
    const k = koKey(dr, dm)
    if (ko[k]) {
      delete ko[k]
      clearKoPath(ko, dr, dm)
    }
  }
  const chooseKo = (r: number, m: number, code: string) => {
    if (viewing || state.locked) {
      if (state.locked) toast(t('toast_locked_bracket'), '🔒')
      return
    }
    if (koPick(state, r, m) === code) return
    const ko = { ...state.ko, [koKey(r, m)]: code }
    clearKoPath(ko, r, m)
    const next = { ...state, ko }
    popTarget.current = { r, m }
    commit(next)
    if (champion(next) && fullyDone(next)) toast(t('toast_champ', tname(champion(next) as string)), '🏆')
  }

  /* ---------------- actions ---------------- */
  const lockBracket = () => {
    if (state.locked || viewing || !fullyDone(state)) return
    const next = { ...state, locked: true }
    commit(next)
    confetti(lockRef.current)
    toast(t('toast_locked'), '🎟')
  }
  const resetBracket = () => {
    commit(emptyState())
    toast(t('toast_cleared'), '↺')
  }
  const autoFill = () => {
    if (viewing || state.locked) return
    const groups: Record<string, string[]> = {}
    GROUP_KEYS.forEach((g) => (groups[g] = GROUPS[g].slice(0, 3)))
    const thirds = GROUP_KEYS.slice(0, 8)
    const next: BracketState = { groups, thirds, ko: {}, locked: false }
    for (let r = 0; r < KO_ROUNDS.length; r++) {
      for (let m = 0; m < KO_ROUNDS[r]; m++) {
        const tt = teamsFor(next, r, m)
        if (tt[0]) next.ko[koKey(r, m)] = tt[0]
      }
    }
    commit(next)
    toast(t('toast_filled'), '⚡')
  }

  /* ---------------- share ---------------- */
  const openShare = () => {
    setShareUrl(window.location.origin + window.location.pathname + '#b=' + encodeState(state))
    setCopied(false)
    setModalOpen(true)
  }
  const copyShare = () => {
    try {
      navigator.clipboard.writeText(shareUrl)
    } catch {
      /* clipboard unavailable */
    }
    setCopied(true)
    toast(t('share_copied'), '🔗')
  }
  const loadShared = () => {
    const next = { ...state, locked: false }
    setViewing(false)
    save('bracket', next)
    setState(next)
    window.history.replaceState(null, '', window.location.pathname)
    setShowBanner(false)
    toast(t('toast_loaded'), '✓')
  }
  const dismissShared = () => {
    setViewing(false)
    setState(normalize(load('bracket', {})))
    window.history.replaceState(null, '', window.location.pathname)
    setShowBanner(false)
  }

  /* ---------------- group quick pick'em ---------------- */
  const gpPick = (i: number, p: string, el: Element) => {
    if (gp.locked) return
    const next = { ...gp, picks: { ...gp.picks, [i]: p } }
    setGp(next)
    save('grouppicks', next)
    pop(el, 1.12)
  }
  const gpLock = () => {
    if (gp.locked || Object.keys(gp.picks).length < MATCHES.length) return
    const next = { ...gp, locked: true }
    setGp(next)
    save('grouppicks', next)
    confetti(gpLockRef.current)
    toast(t('toast_pred'), '🎟')
  }

  /* ---------------- derived ---------------- */
  const groupsDoneCount = GROUP_KEYS.filter((g) => groupDoneIn(state.groups, g)).length
  const allGroupsDone = allGroupsDoneIn(state.groups)
  const koN = koCount(state)
  const champ = champion(state)
  const isFull = fullyDone(state)
  const showShare = koN > 0 || allGroupsDone
  const showReset = !state.locked && !viewing && (allGroupsDone || koN > 0)
  const gpN = Object.keys(gp.picks).length
  const bracketLocked = state.locked || viewing

  const bracketRows: { label: string; codes: (string | null)[]; accent: string }[] = [
    { label: t('r_champ'), codes: [champ], accent: 'var(--lime-ink)' },
    { label: t('finalists'), codes: teamsFor(state, 4, 0), accent: 'var(--mag-ink)' },
    { label: t('semifinalists'), codes: teamsFor(state, 3, 0).concat(teamsFor(state, 3, 1)), accent: 'var(--cyan-ink)' },
  ]

  return (
    <>
      <Ticker>
        <span>
          ◢ {t('pk_h1_1')} {t('pk_h1_2')} · 48 {t('teams_word')}{SEP}{t('prize_free')}{SEP}
        </span>
      </Ticker>

      <SiteHeader wide cta={{ key: 'cta_compare', to: '/brackets', variant: 'btn-cyan' }} />

      <section className="pk-head">
        <div className="wrap-wide">
          <div className="head-row">
            <div>
              <h1 className="reveal">
                {t('pk_h1_1')} <span className="lime">{t('pk_h1_2')}</span>
              </h1>
              <p className="reveal">{t('pk_sub')}</p>
            </div>
            <div className="presented reveal">
              <span>{t('presented_by')}</span> <span className="plogo"><span className="pdot"></span>Prize Drop</span>
            </div>
          </div>

          <div className="stage-flow reveal">
            <div className={`stage ${groupsDoneCount === 12 ? 'done' : ''}`.trim()}>
              <span className="sno">1</span>
              <div><div className="stxt">{t('stage_groups')}</div><div className="scnt">{groupsDoneCount}/12</div></div>
            </div>
            <div className={`stage ${wildReady(state) ? 'done' : ''}`.trim()}>
              <span className="sno">2</span>
              <div><div className="stxt">{t('stage_wild')}</div><div className="scnt">{state.thirds.length}/8</div></div>
            </div>
            <div className={`stage ${isFull ? 'done' : ''}`.trim()}>
              <span className="sno">3</span>
              <div><div className="stxt">{t('stage_knockout')}</div><div className="scnt">{koN}/31</div></div>
            </div>
            <div className={`stage ${champ ? 'done' : ''}`.trim()}>
              <span className="sno">4</span>
              <div><div className="stxt">{t('stage_champ')}</div><div className="scnt">🏆</div></div>
            </div>
          </div>

          <div className={`shared-banner ${showBanner ? 'show' : ''}`.trim()}>
            <span className="sb-txt">{t('viewing_banner')}</span>
            <button className="btn btn-lime btn-sm" onClick={loadShared}>{t('viewing_load')}</button>
            <button className="btn btn-ghost btn-sm" onClick={dismissShared}>{t('viewing_dismiss')}</button>
          </div>
        </div>
      </section>

      {/* GROUPS */}
      <section className="wrap-wide pk-sec">
        <div className="pk-sec-head reveal">
          <div>
            <h2>{t('groups_h')}</h2>
            <div className="sub">{t('groups_p')}</div>
          </div>
          <div className="pk-tools">
            <button className="btn btn-ghost btn-sm" onClick={autoFill}>{t('autofill')}</button>
            {showReset && <button className="btn btn-ghost btn-sm" onClick={resetBracket}>{t('clear_all')}</button>}
          </div>
        </div>
        <div className="groups-grid">
          {GROUP_KEYS.map((g, gi) => {
            const rank = state.groups[g] || []
            const done = groupDoneIn(state.groups, g)
            const f = fourth(state, g)
            const sp = SPONSORS[gi % SPONSORS.length]
            return (
              <div className={`group-card pop-in ${done ? 'done' : ''}`.trim()} key={g}>
                <div className="group-head">
                  <span className="gh-name">{t('group_word')} {g}</span>
                  <span className="sponsor-tag"><span className="sdot" style={{ background: sp.c }}></span>{sp.name}</span>
                </div>
                {GROUPS[g].map((code) => {
                  const idx = rank.indexOf(code)
                  const posn = idx >= 0 ? idx + 1 : done && code === f ? 4 : 0
                  const cls = posn === 1 || posn === 2 ? 'q' : posn === 3 ? 'w' : posn === 4 ? 'out' : ''
                  const tag = posn === 1 || posn === 2 ? t('qualifies') : posn === 3 ? t('wildcard') : ''
                  return (
                    <div
                      className={`grow ${cls}`.trim()}
                      key={code}
                      role="button"
                      tabIndex={0}
                      onClick={() => chooseGroup(g, code)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          chooseGroup(g, code)
                        }
                      }}
                    >
                      {posn ? <span className="gpos">{posn}</span> : <span className="gpos e"></span>}
                      <Flag code={code} size={26} />
                      <span className="gnm">{tname(code)}</span>
                      {tag && <span className="gtag">{tag}</span>}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </section>

      {/* WILDCARDS */}
      <section className="wrap-wide pk-sec">
        <div className="pk-sec-head reveal">
          <div>
            <h2>{t('wild_h')}</h2>
            <div className="sub">{t('wild_p')}</div>
          </div>
          <div className="wild-count"><span>{allGroupsDone ? state.thirds.length : 0} / 8</span></div>
        </div>
        <div className="wild-wrap reveal">
          <div className="wild-grid">
            {!allGroupsDone ? (
              <div className="locked-hint">🔒 {t('groups_p')}</div>
            ) : (
              GROUP_KEYS.map((g) => {
                const code = (state.groups[g] || [])[2]
                if (!code) return null
                const on = state.thirds.indexOf(g) > -1
                return (
                  <div
                    className={`wild-chip pop-in ${on ? 'on' : ''}`.trim()}
                    key={g}
                    role="button"
                    tabIndex={0}
                    onClick={() => toggleWild(g)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        toggleWild(g)
                      }
                    }}
                  >
                    <span className="wtick">✓</span>
                    <Flag code={code} size={28} />
                    <span className="wnm">{tname(code)}</span>
                    <span className="wg">{g}3</span>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </section>

      {/* KNOCKOUT */}
      <section className="wrap-wide pk-sec">
        <div className="pk-sec-head reveal"><div><h2>{t('knockout_h')}</h2></div></div>
        <div className="pick-layout">
          <div className="bracket-wrap reveal">
            <div className="bracket-labels">
              {R_KEYS.map((k) => <div className="rl" key={k}>{t(k)}</div>)}
              <div className="rl champ">{t('r_champ')}</div>
            </div>
            <div className={`bracket ${bracketLocked ? 'locked' : ''}`.trim()}>
              {!wildReady(state) ? (
                <div className="ko-lock">🔒 {t('knockout_locked_hint')}</div>
              ) : (
                <>
                  {KO_ROUNDS.map((count, r) => (
                    <div className="round" key={r}>
                      {Array.from({ length: count }, (_, m) => {
                        const adv = koPick(state, r, m)
                        return (
                          <div className={`match stub ${r > 0 ? 'lstub' : ''} ${adv ? 'advanced' : ''}`.trim()} key={m}>
                            {[0, 1].map((side) => {
                              const code = teamsFor(state, r, m)[side]
                              if (!code) {
                                return <div className="slot empty" key={side}>{r === 0 ? '·' : t('not_picked')}</div>
                              }
                              const sel = adv === code ? 'sel' : adv ? 'dim' : ''
                              return (
                                <div
                                  className={`slot ${sel}`.trim()}
                                  key={side}
                                  data-r={r}
                                  data-m={m}
                                  role="button"
                                  tabIndex={0}
                                  onClick={() => chooseKo(r, m, code)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                      e.preventDefault()
                                      chooseKo(r, m, code)
                                    }
                                  }}
                                >
                                  <Flag code={code} size={22} />
                                  <span className="snm">{tname(code)}</span>
                                </div>
                              )
                            })}
                          </div>
                        )
                      })}
                    </div>
                  ))}
                  <div className="round round-champ">
                    <div className={`champ ${champ ? 'has' : ''}`.trim()}>
                      <div className="champ-cap">🏆 {t('r_champ')}</div>
                      {champ ? (
                        <>
                          <Flag code={champ} size={54} />
                          <div className="champ-nm">{tname(champ)}</div>
                        </>
                      ) : (
                        <div className="champ-empty" dangerouslySetInnerHTML={{ __html: t('champ_empty') }} />
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="hint">{t('tip_change')}</div>
          </div>

          <aside className="summary">
            <div className="sum-card reveal">
              <h3>{t('your_bracket')}</h3>
              <div className="bk-prog">
                <span className="bk-count">
                  <b>{koN}</b>
                  <span className="of">{t('picks_made')}</span>
                  <span style={{ color: 'var(--mut)', fontSize: 13 }}>/ 31</span>
                </span>
                <span className="bk-track">
                  <span className="bk-fill" style={{ width: `${(koN / MAX_KO_PICKS) * 100}%` }}></span>
                </span>
              </div>
              <div className="bk-champ">
                <span className="clbl">{t('champion_l')}</span>
                {champ ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <Flag code={champ} size={26} />
                    <span>{tname(champ)}</span>
                  </span>
                ) : (
                  <span className="mut">{t('not_picked')}</span>
                )}
              </div>
              <div className="bk-pts"><span>{t('pot_points')}</span> <b>{potPts(state)}</b></div>
              <div className="bk-actions">
                <button
                  className={`btn btn-lime lock-bracket-btn ${state.locked ? 'locked' : ''}`.trim()}
                  ref={lockRef}
                  disabled={!state.locked && !isFull}
                  onClick={lockBracket}
                >
                  {state.locked ? t('lock_bracket_done') : isFull ? t('lock_bracket') : t('lock_bracket_need')}
                </button>
                {showShare && (
                  <div className="bk-row2">
                    <button className="btn btn-ghost btn-sm" onClick={openShare}>{t('share_bracket')}</button>
                  </div>
                )}
              </div>
            </div>
            <div className="sum-card reveal">
              <h3>{t('picks_by_round')}</h3>
              <div>
                {bracketRows.map((row) => (
                  <div className="bl-row" key={row.label}>
                    <span className="bl-lbl" style={{ color: row.accent }}>{row.label}</span>
                    <div className="bl-chips">
                      {row.codes.map((c, i) =>
                        c ? (
                          <span className="bl-chip" key={`${c}-${i}`}><Flag code={c} size={20} />{tname(c)}</span>
                        ) : (
                          <span className="bl-chip empty" key={`empty-${i}`}>—</span>
                        ),
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* GROUP QUICK PICK'EM */}
      <section className="wrap-wide pk-sec" style={{ marginTop: 40 }}>
        <div className="pk-sec-head reveal">
          <div>
            <span className="sec-kick" style={{ color: 'var(--cyan-ink)', borderColor: 'rgba(52,231,255,.4)', display: 'inline-block', marginBottom: 8 }}>{t('gp_kick')}</span>
            <h2>{t('gp_h2')}</h2>
            <div className="sub">{t('gp_sub')}</div>
          </div>
        </div>
        <div className="gpbar reveal">
          <div className="gp-l">
            <span className="gp-cnt"><b>{gpN}</b><span className="of">/ {MATCHES.length} {t('gp_picks_made')}</span></span>
            <span className="gp-track"><i style={{ width: `${(gpN / MATCHES.length) * 100}%` }}></i></span>
          </div>
          <div className="flex ac gap-12" style={{ flexWrap: 'wrap' }}>
            <span className="gp-pts">⚡ <b>{gpN * 10}</b> pts</span>
            <button className={`btn btn-lime gp-lock-btn ${gp.locked ? 'locked' : ''}`.trim()} ref={gpLockRef} disabled={!gp.locked && gpN < MATCHES.length} onClick={gpLock}>
              {gp.locked ? t('gp_lock_done') : gpN < MATCHES.length ? `${t('gp_picks_made')} (${gpN}/${MATCHES.length})` : t('gp_lock')}
            </button>
          </div>
        </div>
        <div className="gp-grid">
          {MATCHES.map((m, i) => {
            const sel = gp.picks[i]
            const opt = (side: string, code: string) => (
              <div className={`gp-opt ${sel === side ? 'sel' : ''}`.trim()} role="button" tabIndex={0} onClick={(e) => gpPick(i, side, e.currentTarget)}>
                <span className="gp-tick">✓</span>
                <Flag code={code} size={34} />
                <span className="nm">{tname(code)}</span>
              </div>
            )
            return (
              <div className={`gp-card ${sel ? 'picked' : ''}`.trim()} key={i}>
                <span className="gp-stamp">✓</span>
                <div className="gp-top">
                  <span className="g">{t('group_word')} {m.g}</span>
                  <span>{m.live ? t('qp_live') : m.d}</span>
                </div>
                <div className="gp-row">
                  {opt('a', m.a)}
                  <div className={`gp-draw ${sel === 'd' ? 'sel' : ''}`.trim()} role="button" tabIndex={0} onClick={(e) => gpPick(i, 'd', e.currentTarget)}>
                    {t('qp_draw')}
                  </div>
                  {opt('b', m.b)}
                </div>
                <div className="gp-foot"><span>{m.j} {t('qp_in')}</span><span className="pts">+10</span></div>
              </div>
            )
          })}
        </div>
      </section>

      <SponsorBand />

      <SiteFooter wide noteKey="footer_note">
        <Link to="/">{t('nav_home')}</Link>
        <Link to="/brackets">{t('nav_brackets')}</Link>
        <a href="#" onClick={(e) => e.preventDefault()}>{t('foot_rules')}</a>
      </SiteFooter>

      {/* SHARE MODAL */}
      <div className={`modal ${modalOpen ? 'open' : ''}`.trim()} onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false) }}>
        <div className="modal-card">
          <h3>{t('share_title')}</h3>
          <p>{t('share_desc')}</p>
          <div className="share-field">
            <input value={shareUrl} readOnly />
            <button className="btn btn-lime btn-sm" onClick={copyShare}>{copied ? t('share_copied') : t('share_copy')}</button>
          </div>
          <div className="modal-foot">
            <button className="btn btn-ghost btn-sm" onClick={() => setModalOpen(false)}>{t('share_close')}</button>
          </div>
        </div>
      </div>
    </>
  )
}
