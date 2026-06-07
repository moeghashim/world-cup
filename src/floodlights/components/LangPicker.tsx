import { useEffect, useRef, useState } from 'react'
import { LANGS, langMeta } from '../i18n/dictionaries'
import { useI18n } from '../i18n/context'

export function LangPicker() {
  const { lang, setLang } = useI18n()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const cur = langMeta(lang)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: globalThis.MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('click', onDoc)
    return () => document.removeEventListener('click', onDoc)
  }, [open])

  const choose = (code: string) => {
    setLang(code)
    setOpen(false)
  }

  return (
    <div className={`lang-picker ${open ? 'open' : ''}`} ref={ref} aria-label="Language">
      <button
        className="lp-btn"
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation()
          setOpen((o) => !o)
        }}
      >
        <svg className="lp-globe" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c2.5 2.6 2.5 15.4 0 18M12 3c-2.5 2.6-2.5 15.4 0 18" />
        </svg>
        <span className="lp-cur">{cur.short}</span>
        <svg className="lp-caret" width="10" height="10" viewBox="0 0 12 12" aria-hidden="true">
          <path d="M2 4 L6 8 L10 4" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <ul className="lp-menu" role="listbox">
        {LANGS.map((l) => (
          <li
            key={l.code}
            className={`lp-item ${l.code === cur.code ? 'on' : ''}`}
            role="option"
            aria-selected={l.code === cur.code}
            tabIndex={0}
            onClick={() => choose(l.code)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                choose(l.code)
              }
            }}
          >
            <span className="lp-short">{l.short}</span>
            <span className="lp-name">{l.name}</span>
            <svg className="lp-check" width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
              <path d="M3 7.5 L6 10.5 L11 4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </li>
        ))}
      </ul>
    </div>
  )
}
