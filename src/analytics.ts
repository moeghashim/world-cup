import posthog from 'posthog-js'

declare const __WORLDCUP_API_KEY__: string
declare const __WORLDCUP_HOST__: string

const defaultMeasurementId = 'G-RFPJRPKYQR'
const scriptId = 'google-analytics-gtag'
const metaEnv =
  (import.meta as ImportMeta & {
    env?: Record<string, string | undefined>
  }).env ?? {}
const worldCupApiKey =
  typeof __WORLDCUP_API_KEY__ === 'undefined' ? '' : __WORLDCUP_API_KEY__
const worldCupHost =
  typeof __WORLDCUP_HOST__ === 'undefined' ? '' : __WORLDCUP_HOST__

export const googleAnalyticsMeasurementId =
  metaEnv.VITE_GA_MEASUREMENT_ID || defaultMeasurementId
export const posthogKey = worldCupApiKey
export const posthogUiHost = worldCupHost || 'https://us.posthog.com'

type GtagArguments = [string, ...unknown[]]
type AnalyticsProperties = Record<
  string,
  string | number | boolean | null | undefined
>

declare global {
  interface Window {
    dataLayer?: GtagArguments[]
    gtag?: (...args: GtagArguments) => void
  }
}

let hasInitializedAnalytics = false
let hasInitializedPostHog = false

export function initializeGoogleAnalytics() {
  if (hasInitializedAnalytics || !googleAnalyticsMeasurementId) return

  if (window.gtag) {
    hasInitializedAnalytics = true
    return
  }

  window.dataLayer = window.dataLayer ?? []
  window.gtag = (...args: GtagArguments) => {
    window.dataLayer?.push(args)
  }

  if (!document.getElementById(scriptId)) {
    const script = document.createElement('script')
    script.async = true
    script.id = scriptId
    script.src = `https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsMeasurementId}`
    document.head.appendChild(script)
  }

  window.gtag('js', new Date())
  window.gtag('config', googleAnalyticsMeasurementId)

  hasInitializedAnalytics = true
}

export function initializePostHog() {
  if (hasInitializedPostHog || !posthogKey) return

  posthog.init(posthogKey, {
    api_host: '/ingest',
    ui_host: posthogUiHost,
    capture_pageview: 'history_change',
    capture_pageleave: true,
    person_profiles: 'identified_only',
  })

  hasInitializedPostHog = true
}

export function captureAnalyticsEvent(
  eventName: string,
  properties: AnalyticsProperties = {},
) {
  window.gtag?.('event', eventName, properties)

  if (!hasInitializedPostHog || !posthogKey) return

  posthog.capture(eventName, properties)
}
