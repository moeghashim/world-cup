import { useEffect, useRef, useState } from 'react'

function reducedMotion(): boolean {
  return typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** count-up number that animates 0 -> value when scrolled into view (ported from site.js countUp) */
export function CountUp({ value, suffix = '', className, locale = 'en-US' }: { value: number; suffix?: string; className?: string; locale?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  // start at the final value when motion is reduced (no animation), otherwise 0
  const [display, setDisplay] = useState(() => (reducedMotion() || document.hidden ? value : 0))

  useEffect(() => {
    if (reducedMotion() || document.hidden) return
    const el = ref.current
    if (!el) return
    let raf = 0
    let started = false
    const run = () => {
      if (started) return
      started = true
      const dur = 1100
      const t0 = performance.now()
      const step = (now: number) => {
        const p = Math.min(1, (now - t0) / dur)
        const e = 1 - Math.pow(1 - p, 3)
        setDisplay(Math.round(value * e))
        if (p < 1) raf = requestAnimationFrame(step)
      }
      raf = requestAnimationFrame(step)
    }
    if (el.getBoundingClientRect().top < window.innerHeight * 0.95) {
      run()
      return () => cancelAnimationFrame(raf)
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { run(); io.disconnect() } }),
      { threshold: 0.12 },
    )
    io.observe(el)
    return () => { io.disconnect(); cancelAnimationFrame(raf) }
  }, [value])

  return (
    <span ref={ref} className={className}>
      {display.toLocaleString(locale)}
      {suffix}
    </span>
  )
}

/** an `<i>` bar fill that animates its width from 0 to `width` on mount (CSS transition) */
export function GrowI({ width, className }: { width: string; className?: string }) {
  const [w, setW] = useState('0%')
  useEffect(() => {
    const id = requestAnimationFrame(() => setW(width))
    return () => cancelAnimationFrame(id)
  }, [width])
  return <i className={className} style={{ width: w }} />
}
