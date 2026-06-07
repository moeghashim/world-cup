import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import '../styles/brackets.css'
import { COMMUNITY, CROWD_CHAMPION, CROWD_R32, GROUPS, GROUP_KEYS, R32_TEMPLATE } from '../data'
import { useI18n } from '../i18n/context'
import { useToast } from '../lib/toastContext'
import { useReveal } from '../lib/useReveal'
import { CountUp, GrowI } from '../lib/motion'
import { load } from '../lib/storage'
import { emptyState, koPick, normalize, resolve, teamsFor } from '../lib/bracket'
import { Ticker } from '../components/Ticker'
import { SiteHeader } from '../components/SiteHeader'
import { SiteFooter } from '../components/SiteFooter'
import { Flag } from '../components/Flag'
import { SponsorBand } from '../components/SponsorLogo'

const SEP = '  ·  '

export function BracketsPage() {
  const { t, tname, cname } = useI18n()
  const { toast } = useToast()
  useReveal()
  const [selected, setSelected] = useState(0)

  // saved bracket (read once on mount)
  const br = useMemo(() => normalize(load('bracket', {})), [])
  const userChamp = koPick(br, 4, 0)
  const userFinal = teamsFor(br, 4, 0)
  const userSemis = teamsFor(br, 3, 0).concat(teamsFor(br, 3, 1))
  const userR32 = useMemo(() => Array.from({ length: 16 }, (_, i) => koPick(br, 0, i)), [br])
  const hasBracket = userR32.filter(Boolean).length > 0

  // default favourites seeding for stable consensus display
  const DEF = useMemo(() => {
    const d = emptyState()
    d.thirds = GROUP_KEYS.slice(0, 8)
    GROUP_KEYS.forEach((g) => (d.groups[g] = GROUPS[g].slice(0, 3)))
    return d
  }, [])
  const defR32 = (m: number): [string, string] => [
    resolve(DEF, R32_TEMPLATE[m][0]) as string,
    resolve(DEF, R32_TEMPLATE[m][1]) as string,
  ]
  const favSlot = (m: number) => (CROWD_R32[m] >= 50 ? 0 : 1)

  // you vs the crowd
  let agree = 0
  let decided = 0
  userR32.forEach((w, m) => {
    if (w) {
      decided++
      if (w === teamsFor(br, 0, m)[favSlot(m)]) agree++
    }
  })
  const agreePct = decided ? Math.round((agree / decided) * 100) : 0
  const champPop = CROWD_CHAMPION.find((c) => c.code === userChamp)
  const champPct = champPop ? champPop.pct : 3

  const maxChamp = Math.max(...CROWD_CHAMPION.map((c) => c.pct))

  const u = COMMUNITY[selected]
  const select = (i: number) => setSelected(i)
  const selectCompare = (i: number) => {
    setSelected(i)
    toast(t('toast_compare', cname(COMMUNITY[i])), '⚔')
  }

  // compare verdict
  let verdict: string
  if (!hasBracket) {
    verdict = t('verdict_nobracket', cname(u))
  } else {
    const sameChamp = !!userChamp && userChamp === u.champ
    const semiOverlap = userSemis.filter((c) => c && u.semis.indexOf(c) > -1).length
    verdict =
      (sameChamp ? t('verdict_same', tname(u.champ)) : t('verdict_diff', userChamp ? tname(userChamp) : '—', cname(u), tname(u.champ))) +
      t('verdict_share', semiOverlap)
  }
  const statusTxt = hasBracket ? (br.locked ? t('cmp_locked') : t('cmp_inprogress')) : t('cmp_nobracket')

  const cmpRow = (label: string, codes: (string | null)[], them: string[], highlight: boolean) => (
    <div className="cmp-line" key={label}>
      <span className="cmp-lbl">{label}</span>
      <div className="cmp-chips">
        {codes.map((c, i) =>
          c ? (
            <span className={`cmp-chip ${highlight && them.indexOf(c) > -1 ? 'match' : ''}`.trim()} key={`${c}-${i}`}>
              <Flag code={c} size={18} />
              {tname(c)}
            </span>
          ) : (
            <span className="cmp-chip empty" key={`empty-${i}`}>—</span>
          ),
        )}
      </div>
    </div>
  )

  return (
    <>
      <Ticker>
        <span>
          ◢ <b>12,400</b> {t('stat_locked')}{SEP}{t('feat_pb_h')}{SEP}
        </span>
      </Ticker>

      <SiteHeader wide cta={{ key: 'cta_build', to: '/pickem' }} />

      <section className="bk-head">
        <div className="wrap-wide">
          <span className="sec-kick reveal" style={{ color: 'var(--cyan-ink)', borderColor: 'rgba(52,231,255,.4)' }}>{t('pb_kick')}</span>
          <h1 className="reveal">
            {t('pb_h1_1')} <span className="cyan">{t('pb_h1_2')}</span>
          </h1>
          <p className="reveal">{t('pb_sub')}</p>
          <div className="stat-strip reveal">
            <div className="bk-stat"><CountUp className="n" value={12400} /><span className="l">{t('stat_locked')}</span></div>
            <div className="bk-stat"><CountUp className="n" value={21} suffix="%" /><span className="l">{t('stat_back')}</span></div>
            <div className="bk-stat"><CountUp className="n" value={16} /><span className="l">{t('stat_live')}</span></div>
          </div>
        </div>
      </section>

      {/* YOU VS CROWD */}
      <section className="block" style={{ paddingTop: 30 }}>
        <div className="wrap-wide">
          <div className="sec-head left reveal" style={{ marginBottom: 22 }}>
            <h2 style={{ fontSize: 'clamp(26px,3vw,38px)' }}>{t('yvc_h')}</h2>
          </div>
          <div className="panel-pad reveal" id="youCrowd">
            {hasBracket ? (
              <div className="yc-grid">
                <div className="yc-stat">
                  <div className="yc-champ">
                    {userChamp && <Flag code={userChamp} size={44} />}
                    <div>
                      <div className="yc-cap">{t('yvc_champ_cap')}</div>
                      <div className="yc-val">{userChamp ? tname(userChamp) : '—'}</div>
                    </div>
                  </div>
                  <div className="yc-sub">{t('yvc_agree_sub', champPct)}</div>
                </div>
                <div className="yc-stat">
                  <div className="yc-big t-lime">{agreePct}%</div>
                  <div className="yc-cap">{t('yvc_picks_cap')}</div>
                  <div className="yc-sub">{t('yvc_picks_sub', agree, decided)}</div>
                </div>
                <div className="yc-stat">
                  <div className="yc-big t-mag">{decided - agree}</div>
                  <div className="yc-cap">{t('yvc_contra_cap')}</div>
                  <div className="yc-sub">{t('yvc_contra_sub')}</div>
                </div>
              </div>
            ) : (
              <div className="empty-cta">
                <div className="ec-ic">🏆</div>
                <h3>{t('yvc_empty_h')}</h3>
                <p>{t('yvc_empty_p')}</p>
                <Link to="/pickem" className="btn btn-lime btn-lg">{t('yvc_build')}</Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CHAMP DIST + CONSENSUS */}
      <section className="block" style={{ paddingTop: 0 }}>
        <div className="wrap-wide">
          <div className="champ-grid">
            <div className="reveal">
              <div className="sec-head left" style={{ marginBottom: 18 }}>
                <h2 style={{ fontSize: 'clamp(24px,2.6vw,32px)' }}>{t('champ_dist_h')}</h2>
              </div>
              <div className="panel-pad" id="champDist">
                {CROWD_CHAMPION.map((c) => {
                  const isYou = c.code === userChamp
                  const name = c.code === 'Other' ? t('other_team') : tname(c.code)
                  return (
                    <div className={`cd-row ${isYou ? 'you' : ''}`.trim()} key={c.code}>
                      <div className="cd-team">
                        {c.code === 'Other' ? (
                          <span className="flag" style={{ width: 30, height: 30, background: 'var(--panel-3)', color: 'var(--mut)', fontSize: 11 }}>··</span>
                        ) : (
                          <Flag code={c.code} size={30} />
                        )}
                        <span>
                          {name}
                          {isYou && <em> · {t('you_tag')}</em>}
                        </span>
                      </div>
                      <div className="cd-bar"><GrowI width={`${(c.pct / maxChamp) * 100}%`} /></div>
                      <span className="cd-pct">{c.pct}%</span>
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="reveal">
              <div className="sec-head left" style={{ marginBottom: 18 }}>
                <h2 style={{ fontSize: 'clamp(24px,2.6vw,32px)' }}>{t('consensus_h')}</h2>
              </div>
              <div className="panel-pad" id="matchConsensus">
                {Array.from({ length: 8 }, (_, m) => {
                  const pair = hasBracket ? teamsFor(br, 0, m) : defR32(m)
                  const dflt = defR32(m)
                  const a = pair[0] ?? dflt[0]
                  const b = pair[1] ?? dflt[1]
                  const pa = CROWD_R32[m]
                  const pb = 100 - pa
                  const uw = userR32[m]
                  return (
                    <div className="mc-row" key={m}>
                      <div className="mc-gp">{t('r_r32').split(' ')[0]} M{m + 1}</div>
                      <div className={`mc-side l ${uw === a ? 'picked' : ''}`.trim()}>
                        <Flag code={a} size={26} />
                        <span className="mc-nm">{tname(a)}</span>
                        <span className="mc-pct">{pa}%</span>
                      </div>
                      <div className="mc-bar"><GrowI className="l" width={`${pa}%`} /><GrowI className="r" width={`${pb}%`} /></div>
                      <div className={`mc-side r ${uw === b ? 'picked' : ''}`.trim()}>
                        <Flag code={b} size={26} />
                        <span className="mc-nm">{tname(b)}</span>
                        <span className="mc-pct">{pb}%</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LEADERBOARD + COMPARE */}
      <section className="block" style={{ paddingTop: 0 }}>
        <div className="wrap-wide">
          <div className="sec-head left reveal" style={{ marginBottom: 22 }}>
            <h2 style={{ fontSize: 'clamp(26px,3vw,38px)' }}>{t('top_brackets')}</h2>
            <p style={{ marginLeft: 0 }}>{t('top_brackets_p')}</p>
          </div>
          <div className="two-col">
            <div className="lb-list reveal">
              {COMMUNITY.map((p, i) => (
                <div
                  className={`lb-card ${i === selected ? 'active' : ''}`.trim()}
                  key={p.handle}
                  role="button"
                  tabIndex={0}
                  onClick={() => select(i)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      select(i)
                    }
                  }}
                >
                  <div className="lb-rank">{i + 1}</div>
                  <div className="lb-av" style={{ background: p.color }}>{cname(p).charAt(0)}</div>
                  <div className="lb-id">
                    <div className="lb-name">{cname(p)}</div>
                    <div className="lb-handle">{p.handle}</div>
                  </div>
                  <div className="lb-champ"><Flag code={p.champ} size={26} /><span>{tname(p.champ)}</span></div>
                  <div className="lb-semis">{p.semis.map((c, si) => <Flag code={c} size={20} key={`${c}-${si}`} />)}</div>
                  <div className="lb-pts"><b>{p.pts}</b><span>{t('cmp_pts')}</span></div>
                  <button
                    className="btn btn-ghost btn-sm lb-cmp"
                    onClick={(e) => {
                      e.stopPropagation()
                      selectCompare(i)
                    }}
                  >
                    {t('cta_compare')}
                  </button>
                </div>
              ))}
            </div>

            <div className="compare reveal">
              <div className="cmp-head">
                <div className="cmp-who you">
                  <div className="cmp-av" style={{ background: 'var(--lime)', color: 'var(--on-lime)' }}>Y</div>
                  <div>
                    <div className="cmp-name">{t('cmp_you')}</div>
                    <div className="cmp-sub">{statusTxt}</div>
                  </div>
                </div>
                <div className="cmp-vs">VS</div>
                <div className="cmp-who them">
                  <div className="cmp-av" style={{ background: u.color }}>{cname(u).charAt(0)}</div>
                  <div>
                    <div className="cmp-name">{cname(u)}</div>
                    <div className="cmp-sub">{u.pts} {t('cmp_pts')} · {u.handle}</div>
                  </div>
                </div>
              </div>
              <div className="cmp-cols">
                <div className="cmp-col">
                  <div className="cmp-coltag">{t('cmp_your_picks')}</div>
                  {hasBracket ? (
                    <>
                      {cmpRow(t('r_champ'), [userChamp], [u.champ], true)}
                      {cmpRow(t('finalists'), userFinal, u.semis, true)}
                      {cmpRow(t('semifinalists'), userSemis, u.semis, true)}
                    </>
                  ) : (
                    <div className="cmp-empty">
                      <p>{t('cmp_build')}</p>
                      <Link to="/pickem" className="btn btn-lime btn-sm">{t('cmp_build_btn')}</Link>
                    </div>
                  )}
                </div>
                <div className="cmp-col">
                  <div className="cmp-coltag">{t('cmp_their_picks', cname(u))}</div>
                  {cmpRow(t('r_champ'), [u.champ], [], false)}
                  {cmpRow(t('semifinalists'), u.semis, [], false)}
                </div>
              </div>
              <div className="cmp-verdict" dangerouslySetInnerHTML={{ __html: verdict }} />
            </div>
          </div>
        </div>
      </section>

      <SponsorBand />

      <SiteFooter wide noteKey="brackets_footnote">
        <Link to="/">{t('nav_home')}</Link>
        <Link to="/pickem">{t('nav_pickem')}</Link>
        <a href="#" onClick={(e) => e.preventDefault()}>{t('foot_rules')}</a>
      </SiteFooter>
    </>
  )
}
