import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import '../styles/brackets.css'
import { GROUPS, GROUP_KEYS, R32_TEMPLATE } from '../data'
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
import {
  formatStatNumber,
  localeForLang,
  pctForPick,
  useCommunityStats,
} from '../lib/communityStats'

const SEP = '  ·  '

export function BracketsPage() {
  const { t, tname, cname, lang } = useI18n()
  const { toast } = useToast()
  useReveal()
  const [selected, setSelected] = useState(0)
  const communityStats = useCommunityStats()
  const locale = localeForLang(lang)
  const communityBrackets = communityStats.communityBrackets
  const selectedBracket = communityBrackets[selected] ?? communityBrackets[0] ?? null
  const topChampion = communityStats.championDistribution[0]
  const hasChampionDistribution = communityStats.championDistribution.length > 0
  const hasR32Consensus = communityStats.r32Consensus.some((item) => item.total > 0)

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
  // you vs the crowd
  let agree = 0
  let decided = 0
  userR32.forEach((w, m) => {
    const favourite = communityStats.r32Consensus[m]?.favourite
    if (w && favourite) {
      decided++
      if (w === favourite) agree++
    }
  })
  const agreePct = decided ? Math.round((agree / decided) * 100) : 0
  const champPop = communityStats.championDistribution.find((c) => c.code === userChamp)
  const champPct = champPop ? champPop.pct : 0

  const maxChamp = Math.max(
    1,
    ...communityStats.championDistribution.map((c) => c.pct),
  )

  const select = (i: number) => setSelected(i)
  const selectCompare = (i: number) => {
    const bracket = communityBrackets[i]
    if (!bracket) return
    setSelected(i)
    toast(t('toast_compare', cname(bracket)), '⚔')
  }

  // compare verdict
  let verdict = ''
  if (selectedBracket) {
    if (!hasBracket) {
      verdict = t('verdict_nobracket', cname(selectedBracket))
    } else {
      const sameChamp = !!userChamp && userChamp === selectedBracket.champ
      const theirChamp = selectedBracket.champ ? tname(selectedBracket.champ) : '—'
      const semiOverlap = userSemis.filter((c) => c && selectedBracket.semis.indexOf(c) > -1).length
      verdict =
        (sameChamp ? t('verdict_same', theirChamp) : t('verdict_diff', userChamp ? tname(userChamp) : '—', cname(selectedBracket), theirChamp)) +
        t('verdict_share', semiOverlap)
    }
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
          ◢ <b>{formatStatNumber(lang, communityStats.bracketsLocked)}</b> {t('stat_locked')}{SEP}{t('feat_pb_h')}{SEP}
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
            <div className="bk-stat"><CountUp className="n" value={communityStats.bracketsLocked} locale={locale} /><span className="l">{t('stat_locked')}</span></div>
            <div className="bk-stat"><CountUp className="n" value={topChampion?.pct ?? 0} suffix="%" locale={locale} /><span className="l">{t('stat_top_champion')}</span></div>
            <div className="bk-stat"><CountUp className="n" value={communityStats.hostsJoined} locale={locale} /><span className="l">{t('stat_hosts_joined')}</span></div>
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
                {hasChampionDistribution ? (
                  communityStats.championDistribution.map((c) => {
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
                  })
                ) : (
                  <div className="empty-cta stats-empty">
                    <div className="ec-ic">◢</div>
                    <h3>{t('stats_empty_h')}</h3>
                    <p>{t('stats_empty')}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="reveal">
              <div className="sec-head left" style={{ marginBottom: 18 }}>
                <h2 style={{ fontSize: 'clamp(24px,2.6vw,32px)' }}>{t('consensus_h')}</h2>
              </div>
              <div className="panel-pad" id="matchConsensus">
                {hasR32Consensus ? (
                  Array.from({ length: 8 }, (_, m) => {
                    const consensus = communityStats.r32Consensus[m]
                    const consensusPicks = consensus?.picks ?? []
                    const topPick = consensusPicks[0]?.code ?? null
                    const secondPick = consensusPicks.find((pick) => pick.code !== topPick)?.code ?? null
                    const pair = hasBracket
                      ? teamsFor(br, 0, m)
                      : [topPick, secondPick] as [string | null, string | null]
                    const dflt = defR32(m)
                    const a = pair[0] ?? dflt[0]
                    const b = pair[1] ?? dflt.find((code) => code !== a) ?? dflt[1]
                    const pa = pctForPick(consensus, a)
                    const pb = pctForPick(consensus, b)
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
                  })
                ) : (
                  <div className="empty-cta stats-empty">
                    <div className="ec-ic">⚔</div>
                    <h3>{t('stats_empty_h')}</h3>
                    <p>{t('consensus_empty')}</p>
                  </div>
                )}
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
              {communityBrackets.length > 0 ? (
                communityBrackets.map((p, i) => (
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
                    <div className="lb-champ">
                      {p.champ ? <Flag code={p.champ} size={26} /> : <span className="flag other-flag">··</span>}
                      <span>{p.champ ? tname(p.champ) : t('other_team')}</span>
                    </div>
                    <div className="lb-semis">{p.semis.map((c, si) => <Flag code={c} size={20} key={`${c}-${si}`} />)}</div>
                    <div className="lb-status">{t('cmp_locked')}</div>
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
                ))
              ) : (
                <div className="empty-cta community-empty">
                  <div className="ec-ic">🏆</div>
                  <h3>{t('community_empty_h')}</h3>
                  <p>{t('community_empty_p')}</p>
                  <Link to="/pickem" className="btn btn-lime btn-lg">{t('yvc_build')}</Link>
                </div>
              )}
            </div>

            <div className="compare reveal">
              {selectedBracket ? (
                <>
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
                      <div className="cmp-av" style={{ background: selectedBracket.color }}>{cname(selectedBracket).charAt(0)}</div>
                      <div>
                        <div className="cmp-name">{cname(selectedBracket)}</div>
                        <div className="cmp-sub">{selectedBracket.handle}</div>
                      </div>
                    </div>
                  </div>
                  <div className="cmp-cols">
                    <div className="cmp-col">
                      <div className="cmp-coltag">{t('cmp_your_picks')}</div>
                      {hasBracket ? (
                        <>
                          {cmpRow(t('r_champ'), [userChamp], selectedBracket.champ ? [selectedBracket.champ] : [], true)}
                          {cmpRow(t('finalists'), userFinal, selectedBracket.semis, true)}
                          {cmpRow(t('semifinalists'), userSemis, selectedBracket.semis, true)}
                        </>
                      ) : (
                        <div className="cmp-empty">
                          <p>{t('cmp_build')}</p>
                          <Link to="/pickem" className="btn btn-lime btn-sm">{t('cmp_build_btn')}</Link>
                        </div>
                      )}
                    </div>
                    <div className="cmp-col">
                      <div className="cmp-coltag">{t('cmp_their_picks', cname(selectedBracket))}</div>
                      {cmpRow(t('r_champ'), [selectedBracket.champ], [], false)}
                      {cmpRow(t('semifinalists'), selectedBracket.semis, [], false)}
                    </div>
                  </div>
                  <div className="cmp-verdict" dangerouslySetInnerHTML={{ __html: verdict }} />
                </>
              ) : (
                <div className="empty-cta community-empty">
                  <div className="ec-ic">⚔</div>
                  <h3>{t('community_empty_h')}</h3>
                  <p>{t('community_empty_p')}</p>
                </div>
              )}
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
