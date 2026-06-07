import { TEAMS } from '../data'

/** legible text colour over a team's flag colour (luminance test, ported from site.js) */
function flagText(code: string): string {
  const c = TEAMS[code]?.c || '#888'
  const m = /^#?([0-9a-f]{6})$/i.exec(c)
  if (!m) return '#fff'
  const n = parseInt(m[1], 16)
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  return 0.299 * r + 0.587 * g + 0.114 * b > 165 ? '#0b1020' : '#fff'
}

/** flag disc showing the team CODE on its brand colour */
export function Flag({ code, size = 34, className = '' }: { code: string; size?: number; className?: string }) {
  const c = TEAMS[code]?.c || '#888'
  return (
    <span
      className={`flag ${className}`.trim()}
      style={{ width: size, height: size, background: c, color: flagText(code), fontSize: Math.round(size * 0.33) }}
    >
      {code}
    </span>
  )
}
