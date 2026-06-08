import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { ThemeProvider } from './floodlights/theme/ThemeProvider'
import { I18nProvider } from './floodlights/i18n/I18nProvider'
import { ToastProvider } from './floodlights/lib/ToastProvider'
import { AuthProvider } from './floodlights/lib/AuthProvider'
import { HomePage } from './floodlights/pages/HomePage'
import { PickemPage } from './floodlights/pages/PickemPage'
import { BracketsPage } from './floodlights/pages/BracketsPage'
import { SponsorsPage } from './floodlights/pages/SponsorsPage'
import { initializeGoogleAnalytics, initializePostHog } from './analytics'

/** scroll to top on navigation, or to an in-page anchor when the URL has a hash */
function ScrollToHash() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash && !hash.startsWith('#b=')) {
      const id = hash.slice(1)
      requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }))
    } else {
      window.scrollTo(0, 0)
    }
  }, [pathname, hash])
  return null
}

function App() {
  useEffect(() => {
    initializeGoogleAnalytics()
    initializePostHog()
  }, [])

  return (
    <ThemeProvider>
      <I18nProvider>
        <AuthProvider>
          <ToastProvider>
            <ScrollToHash />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/pickem" element={<PickemPage />} />
              <Route path="/brackets" element={<BracketsPage />} />
              <Route path="/sponsors" element={<SponsorsPage />} />
              <Route path="*" element={<HomePage />} />
            </Routes>
          </ToastProvider>
        </AuthProvider>
      </I18nProvider>
    </ThemeProvider>
  )
}

export default App
