import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useI18n } from '../i18n/context'
import { BrandLogo } from './BrandLogo'
import { LangPicker } from './LangPicker'
import { ThemeToggle } from './ThemeToggle'
import { HashLink } from './HashLink'

export interface HeaderCta {
  key: string
  to: string
  variant?: string
}

const navClass = ({ isActive }: { isActive: boolean }) => (isActive ? 'active' : '')

export function SiteHeader({ wide = false, cta }: { wide?: boolean; cta: HeaderCta }) {
  const { t } = useI18n()
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = () => setMenuOpen(false)
  const ctaHash = cta.to.startsWith('#')
  const ctaClass = `btn ${cta.variant ?? 'btn-lime'} btn-sm`

  return (
    <header className="site-header">
      <div className={`${wide ? 'wrap-wide' : 'wrap'} nav`}>
        <Link className="logo" to="/" aria-label="WIN 2026" onClick={closeMenu}>
          <BrandLogo />
        </Link>
        <nav className={`navlinks ${menuOpen ? 'open' : ''}`}>
          <NavLink to="/" end className={navClass} onClick={closeMenu}>{t('nav_home')}</NavLink>
          <NavLink to="/pickem" className={navClass} onClick={closeMenu}>{t('nav_pickem')}</NavLink>
          <NavLink to="/brackets" className={navClass} onClick={closeMenu}>{t('nav_brackets')}</NavLink>
          <HashLink to="/" hash="prizes" onNavigate={closeMenu}>{t('nav_prizes')}</HashLink>
          <NavLink to="/sponsors" className={navClass} onClick={closeMenu}>{t('nav_sponsor')}</NavLink>
        </nav>
        <div className="nav-tools">
          <LangPicker />
          <ThemeToggle />
          {ctaHash ? (
            <a href={cta.to} className={ctaClass}>{t(cta.key)}</a>
          ) : (
            <Link to={cta.to} className={ctaClass}>{t(cta.key)}</Link>
          )}
          <button className="burger" aria-label="Menu" onClick={() => setMenuOpen((o) => !o)}>
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
    </header>
  )
}
