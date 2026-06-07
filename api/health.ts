type HealthResponse = {
  status: (statusCode: number) => HealthResponse
  json: (body: unknown) => void
}

declare const process: {
  env: Record<string, string | undefined>
}

export default function handler(_request: unknown, response: HealthResponse) {
  response.status(200).json({
    ok: true,
    service: 'winworldcup2026',
    integrations: {
      vercel: true,
      googleAnalytics: 'G-RFPJRPKYQR',
      posthog: Boolean(process.env.VITE_POSTHOG_KEY),
      stripeProjects: true,
      primaryDatabase: Boolean(process.env.PRIMARY_DB_CONNECTION_STRING),
    },
  })
}
