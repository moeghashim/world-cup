import type { MouseEvent, ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

/** anchor that scrolls to an in-page id, navigating to its page first if needed */
export function HashLink({
  to,
  hash,
  className,
  children,
  onNavigate,
}: {
  to: string
  hash: string
  className?: string
  children: ReactNode
  onNavigate?: () => void
}) {
  const navigate = useNavigate()
  const location = useLocation()
  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    onNavigate?.()
    if (location.pathname === to) {
      document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' })
      window.history.replaceState(null, '', `${to}#${hash}`)
    } else {
      navigate(`${to}#${hash}`)
    }
  }
  return (
    <a href={`${to}#${hash}`} className={className} onClick={onClick}>
      {children}
    </a>
  )
}
