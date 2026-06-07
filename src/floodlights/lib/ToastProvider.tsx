import { useCallback, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { ToastContext } from './toastContext'
import type { ToastValue } from './toastContext'

/** single bottom-center toast — ported from site.js FL.toast */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ msg: string; icon: string; show: boolean }>({ msg: '', icon: '✓', show: false })
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const toast = useCallback((msg: string, icon = '✓') => {
    setState({ msg, icon, show: true })
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setState((s) => ({ ...s, show: false })), 2800)
  }, [])

  const value = useMemo<ToastValue>(() => ({ toast }), [toast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className={`toast ${state.show ? 'show' : ''}`} role="status" aria-live="polite">
        <span className="ic">{state.icon}</span>
        <span>{state.msg}</span>
      </div>
    </ToastContext.Provider>
  )
}
