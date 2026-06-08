import type { ApiRequest, ApiResponse } from '../_lib/http.js'
import { requireMethod, sendError, sendJson } from '../_lib/http.js'
import {
  getLiveResultsProvider,
  liveResultsAttribution,
} from '../_lib/live-results.js'
import { loadCachedResults } from '../_lib/results-cache.js'

export default async function handler(
  request: ApiRequest,
  response: ApiResponse,
) {
  try {
    requireMethod(request, 'GET')
    const provider = getLiveResultsProvider()
    response.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300')
    sendJson(response, 200, {
      results: await loadCachedResults(),
      source: {
        fallback: !process.env.PRIMARY_DB_CONNECTION_STRING,
        provider,
        attribution: liveResultsAttribution(provider),
        generatedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    sendError(response, error, request)
  }
}
