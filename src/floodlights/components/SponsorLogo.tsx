import type { CSSProperties, ReactElement } from 'react'
import { SPONSORS, sponsorById } from '../data'
import type { Sponsor, SponsorMarkType } from '../data'
import { useI18n } from '../i18n/context'

const GLYPHS: Record<SponsorMarkType, ReactElement> = {
  play: <path d="M16 13 L28 20 L16 27 Z" fill="#0A0F1A" />,
  drop: <path d="M13 17 L20 25 L27 17" fill="none" stroke="#0A0F1A" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />,
  rings: (
    <>
      <circle cx={17} cy={20} r={6} fill="none" stroke="#0A0F1A" strokeWidth={2.6} />
      <circle cx={24} cy={20} r={6} fill="none" stroke="#0A0F1A" strokeWidth={2.6} />
    </>
  ),
  arrow: <path d="M14 26 L26 14 M19 14 L26 14 L26 21" fill="none" stroke="#0A0F1A" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />,
  star: <path d="M20 12 L22.4 17.6 L28.5 18.2 L23.9 22.3 L25.3 28.2 L20 25 L14.7 28.2 L16.1 22.3 L11.5 18.2 L17.6 17.6 Z" fill="#0A0F1A" />,
  hex: <path d="M20 12 L27 16 L27 24 L20 28 L13 24 L13 16 Z" fill="none" stroke="#0A0F1A" strokeWidth={2.8} strokeLinejoin="round" />,
}

export function SponsorMark({ type, color, size = 30 }: { type: SponsorMarkType; color: string; size?: number }) {
  return (
    <svg className="sp-mark" width={size} height={size} viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x={2} y={2} width={36} height={36} rx={10} fill={color} />
      {GLYPHS[type]}
    </svg>
  )
}

export function SponsorLogo({ sponsor, size = 30, nameSize, showName = true }: { sponsor: Sponsor; size?: number; nameSize?: number; showName?: boolean }) {
  return (
    <span className="splogo" title={sponsor.name}>
      <SponsorMark type={sponsor.mark} color={sponsor.c} size={size} />
      {showName && (
        <span className="spname" style={nameSize ? { fontSize: nameSize } : undefined}>
          {sponsor.name}
        </span>
      )}
    </span>
  )
}

export function SponsorCard({ sponsor }: { sponsor: Sponsor }) {
  return (
    <span className="sp-card">
      <SponsorLogo sponsor={sponsor} size={34} />
    </span>
  )
}

export function SponsorBand({ className = '', style }: { className?: string; style?: CSSProperties }) {
  const { t } = useI18n()
  return (
    <div className={`sponsor-band ${className}`.trim()} style={style}>
      <span className="sb-label">{t('sponsors_k')}</span>
      {SPONSORS.slice(0, 5).map((s) => (
        <SponsorLogo key={s.id} sponsor={s} size={26} />
      ))}
    </div>
  )
}

export function PresentingLogo() {
  const { t } = useI18n()
  const s = sponsorById('matchday')
  if (!s) return null
  return (
    <span data-presenting="">
      <span className="presented-lbl">{t('presented_by')}</span>
      <SponsorLogo sponsor={s} size={24} />
    </span>
  )
}

export function PrizeSponsor() {
  const { t } = useI18n()
  const s = sponsorById('prizedrop')
  if (!s) return null
  return (
    <div data-prize-sponsor="">
      <span className="ps-lbl">{t('prize_partner')}</span>
      <SponsorLogo sponsor={s} size={28} />
    </div>
  )
}
