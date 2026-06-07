import { createContext, useContext } from 'react'

export type Theme = 'dark' | 'light'

export interface ThemeValue {
  theme: Theme
  setTheme: (t: Theme) => void
}

export const ThemeContext = createContext<ThemeValue | null>(null)

export function useTheme(): ThemeValue {
  const v = useContext(ThemeContext)
  if (!v) throw new Error('useTheme must be used within <ThemeProvider>')
  return v
}
