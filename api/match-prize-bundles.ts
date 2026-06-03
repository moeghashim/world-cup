import { getPrizeBundlesForFixtures } from '../src/data/homepagePrizeBundles.js'
import { getUpcomingHomepageFixtures } from '../src/data/homepageFixtures.js'

type ApiRequest = {
  method?: string
  query?: Record<string, string | string[] | undefined>
}

type ApiResponse = {
  json: (body: unknown) => void
  setHeader: (name: string, value: string) => void
  status: (code: number) => ApiResponse
}

function getLimit(query: ApiRequest['query']) {
  const rawLimit = Array.isArray(query?.limit) ? query?.limit[0] : query?.limit
  const parsedLimit = Number(rawLimit ?? 8)

  if (!Number.isFinite(parsedLimit)) return 8

  return Math.max(1, Math.min(72, Math.trunc(parsedLimit)))
}

export default function handler(request: ApiRequest, response: ApiResponse) {
  if (request.method && request.method !== 'GET') {
    response.setHeader('Allow', 'GET')
    response.status(405).json({ error: 'Method not allowed' })
    return
  }

  const fixtures = getUpcomingHomepageFixtures(getLimit(request.query))

  response.status(200).json({
    bundles: getPrizeBundlesForFixtures(fixtures).map(
      ({ fixture, prizeBundle }) => ({
        fixture: {
          away: fixture.away,
          date: fixture.date,
          group: fixture.group,
          home: fixture.home,
          matchNumber: fixture.matchNumber,
          note: fixture.note ?? null,
          timeET: fixture.timeET,
          venue: fixture.venue,
        },
        prizeBundle,
      }),
    ),
    source: 'static-schedule-snapshot',
  })
}
