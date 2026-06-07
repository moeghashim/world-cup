import { createContext, useContext } from 'react'

export interface I18nValue {
  lang: string
  dir: 'ltr' | 'rtl'
  setLang: (l: string) => void
  /** translate a key with {0}/{1}/{2} interpolation */
  t: (key: string, ...args: (string | number)[]) => string
  /** localized team name for a code */
  tname: (code: string) => string
  /** localized name for a community record ({ name, ar }) */
  cname: (u: { name: string; ar: string }) => string
}

export const I18nContext = createContext<I18nValue | null>(null)

export function useI18n(): I18nValue {
  const v = useContext(I18nContext)
  if (!v) throw new Error('useI18n must be used within <I18nProvider>')
  return v
}
