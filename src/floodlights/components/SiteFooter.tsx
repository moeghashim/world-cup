import type { ReactNode } from 'react'
import { useI18n } from '../i18n/context'

export function SiteFooter({ wide = false, noteKey, children }: { wide?: boolean; noteKey: string; children: ReactNode }) {
  const { t } = useI18n()
  return (
    <footer className="site-footer">
      <div className={`${wide ? 'wrap-wide' : 'wrap'} foot`}>
        <span className="wm">
          WIN<em>·</em>2026
        </span>
        <div className="links">{children}</div>
        <small>{t(noteKey)}</small>
      </div>
    </footer>
  )
}
