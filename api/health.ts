type HealthResponse = {
  status: (statusCode: number) => HealthResponse
  json: (body: unknown) => void
}

export default function handler(_request: unknown, response: HealthResponse) {
  response.status(200).json({
    ok: true,
    service: 'winworldcup2026',
    integrations: {
      vercel: true,
      googleAnalytics: 'G-RFPJRPKYQR',
      posthog: Boolean(process.env.WORLDCUP_API_KEY),
      stripeProjects: true,
      primaryDatabase: Boolean(process.env.PRIMARY_DB_CONNECTION_STRING),
      workos: Boolean(process.env.WORKOS_CLIENT_ID),
      sentry: Boolean(process.env.SENTRY_DSN),
    },
  })
}
