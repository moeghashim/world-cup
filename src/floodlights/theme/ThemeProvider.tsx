import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { load, save } from '../lib/storage'
import { ThemeContext } from './context'
import type { Theme, ThemeValue } from './context'

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => (load<Theme>('theme', 'dark') === 'light' ? 'light' : 'dark'))

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    save('theme', theme)
  }, [theme])

  const setTheme = useCallback((t: Theme) => setThemeState(t), [])
  const value = useMemo<ThemeValue>(() => ({ theme, setTheme }), [theme, setTheme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
