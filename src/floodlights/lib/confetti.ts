/* confetti burst + scale pop — ported from site.js (FL.confetti / FL.pop / FL.accents) */

function accents(): string[] {
  const cs = getComputedStyle(document.documentElement)
  return ['--lime', '--cyan', '--mag', '--amber', '--violet'].map((v) => cs.getPropertyValue(v).trim())
}

export function confetti(origin?: Element | string | null): void {
  const cols = accents().concat(['#FFFFFF'])
  const src = (typeof origin === 'string' ? document.querySelector(origin) : origin) || document.body
  const r = src.getBoundingClientRect()
  const cx = r.left + r.width / 2
  const cy = r.top + r.height / 2
  for (let i = 0; i < 130; i++) {
    const c = document.createElement('div')
    c.style.cssText =
      'position:fixed;width:10px;height:13px;z-index:9999;pointer-events:none;left:' +
      cx + 'px;top:' + cy + 'px;background:' + cols[i % cols.length] +
      ';border-radius:' + (Math.random() > 0.5 ? '2px' : '50%') + ';'
    document.body.appendChild(c)
    const a = Math.random() * Math.PI * 2
    const v = 6 + Math.random() * 9
    const dx = Math.cos(a) * v * 14
    const dy = Math.sin(a) * v * 14 - 240
    c.animate(
      [
        { transform: 'translate(0,0) rotate(0)', opacity: 1 },
        { transform: 'translate(' + dx + 'px,' + (dy + 800) + 'px) rotate(' + 760 * Math.random() + 'deg)', opacity: 0 },
      ],
      { duration: 1600 + Math.random() * 900, easing: 'cubic-bezier(.2,.6,.4,1)' },
    ).onfinish = () => c.remove()
  }
}

export function pop(el: Element | null, from = 1.3): void {
  if (!el || document.hidden) return
  el.animate(
    [{ transform: 'scale(' + from + ')' }, { transform: 'scale(1)' }],
    { duration: 250, easing: 'cubic-bezier(.3,1.6,.5,1)' },
  )
}
