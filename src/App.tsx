import { useEffect } from 'react'
import {
  captureAnalyticsEvent,
  googleAnalyticsMeasurementId,
  initializeGoogleAnalytics,
  initializePostHog,
  posthogUiHost,
} from './analytics'
import './App.css'

const aiBuildUsage = {
  totalTokens: '~6.3M',
  estimatedCost: '~$56',
  updatedAt: '2026-06-07',
}

const preservedIntegrations = [
  {
    name: 'Vercel',
    description: 'Deployment config and first-party analytics rewrites stay in place.',
  },
  {
    name: 'Google Analytics',
    description: `Static GA4 tag remains active for ${googleAnalyticsMeasurementId}.`,
  },
  {
    name: 'PostHog',
    description: `Env-gated product analytics stays wired through ${posthogUiHost}.`,
  },
  {
    name: 'Stripe Projects',
    description: 'Local project state and environment placeholders are preserved.',
  },
]

function App() {
  useEffect(() => {
    initializeGoogleAnalytics()
    initializePostHog()
    captureAnalyticsEvent('clean_slate_viewed', {
      total_tokens: aiBuildUsage.totalTokens,
      estimated_cost: aiBuildUsage.estimatedCost,
    })
  }, [])

  return (
    <main className="reset-shell">
      <section className="reset-hero" aria-labelledby="reset-title">
        <p className="eyebrow">winworldcup2026.com</p>
        <h1 id="reset-title">Clean slate for the next build.</h1>
        <p className="hero-copy">
          The old prototype surface has been removed so the next version can start
          from a fresh design while keeping the live deployment and analytics
          plumbing intact.
        </p>
      </section>

      <section className="status-grid" aria-label="Preserved project state">
        <article className="status-card">
          <span className="label">AI Build Usage</span>
          <strong>{aiBuildUsage.totalTokens}</strong>
          <p>{aiBuildUsage.estimatedCost} estimated API-equivalent cost.</p>
          <small>Updated {aiBuildUsage.updatedAt}</small>
        </article>

        <article className="status-card">
          <span className="label">GA4 Measurement</span>
          <strong>{googleAnalyticsMeasurementId}</strong>
          <p>The canonical Google tag remains in the document head.</p>
          <small>Visible in the homepage HTML source.</small>
        </article>
      </section>

      <section className="integration-panel" aria-labelledby="integrations-title">
        <p className="eyebrow">Preserved integrations</p>
        <h2 id="integrations-title">Infrastructure kept for the restart</h2>
        <div className="integration-list">
          {preservedIntegrations.map((integration) => (
            <article key={integration.name}>
              <h3>{integration.name}</h3>
              <p>{integration.description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}

export default App
