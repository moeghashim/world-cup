import { useEffect } from 'react'

function reducedMotion(): boolean {
  return typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Scroll-reveal for `.reveal` elements on the mounted page — ported from site.js.
 * Content is visible by default (capture-safe); this only engages the slide-up.
 * The `in` class is added imperatively; React leaves it alone because reveal
 * elements keep a constant `className` prop, so it survives language re-renders.
 */
export function useReveal(): void {
  useEffect(() => {
    if (reducedMotion() || document.hidden) return
    const html = document.documentElement
    html.classList.add('anim')
    const reveals = Array.from(document.querySelectorAll<HTMLElement>('.reveal'))
    if (!reveals.length) return

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in')
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -7% 0px' },
    )
    reveals.forEach((el) => io.observe(el))

    const scan = () => {
      const h = window.innerHeight
      reveals.forEach((el) => {
        if (el.getBoundingClientRect().top < h * 0.95) el.classList.add('in')
      })
    }
    scan()
    window.addEventListener('scroll', scan, { passive: true })
    return () => {
      io.disconnect()
      window.removeEventListener('scroll', scan)
    }
  }, [])
}
