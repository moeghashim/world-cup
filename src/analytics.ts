const defaultMeasurementId = 'G-RFPJRPKYQR'
const scriptId = 'google-analytics-gtag'

export const googleAnalyticsMeasurementId =
  import.meta.env.VITE_GA_MEASUREMENT_ID || defaultMeasurementId

type GtagArguments = [string, ...unknown[]]

declare global {
  interface Window {
    dataLayer?: GtagArguments[]
    gtag?: (...args: GtagArguments) => void
  }
}

let hasInitializedAnalytics = false

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
