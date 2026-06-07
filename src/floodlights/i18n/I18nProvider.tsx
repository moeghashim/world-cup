import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { langMeta, teamName, translate } from './dictionaries'
import { load, save } from '../lib/storage'
import { I18nContext } from './context'
import type { I18nValue } from './context'

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<string>(() => langMeta(load<string>('lang', 'en')).code)
  const meta = langMeta(lang)

  useEffect(() => {
    const html = document.documentElement
    html.setAttribute('lang', meta.code)
    html.setAttribute('dir', meta.dir)
    html.classList.toggle('ar', meta.font === 'ar')
    html.setAttribute('data-lang', meta.code)
    save('lang', meta.code)
  }, [meta.code, meta.dir, meta.font])

  const setLang = useCallback((l: string) => setLangState(langMeta(l).code), [])

  const value = useMemo<I18nValue>(
    () => ({
      lang,
      dir: meta.dir,
      setLang,
      t: (key, ...args) => translate(lang, key, ...args),
      tname: (code) => teamName(lang, code),
      cname: (u) => (lang === 'ar' && u.ar ? u.ar : u.name),
    }),
    [lang, meta.dir, setLang],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
