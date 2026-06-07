import type { ReactNode } from 'react'

/** marquee ticker — the content is rendered twice for a seamless loop (as in the source) */
export function Ticker({ children }: { children: ReactNode }) {
  return (
    <div className="ticker">
      <div className="t" style={{ minWidth: '200%' }}>
        {children}
        {children}
      </div>
    </div>
  )
}
