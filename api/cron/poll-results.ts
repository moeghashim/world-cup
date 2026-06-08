import type { ApiRequest, ApiResponse } from '../_lib/http.js'
import { requireMethod, sendError, sendJson } from '../_lib/http.js'
import { requireCronSecret, nowForCron } from '../_lib/cron.js'
import { pollAndCacheResults } from '../_lib/results-cache.js'
import { scoreAndPersistStandings } from '../_lib/scoring.js'

export default async function handler(
  request: ApiRequest,
  response: ApiResponse,
) {
  try {
    requireMethod(request, 'GET')
    requireCronSecret(request)
    const results = await pollAndCacheResults(nowForCron(request))
    const standings = results.cached > 0 ? await scoreAndPersistStandings() : null

    sendJson(response, 200, {
      ok: true,
      results,
      standings,
    })
  } catch (error) {
    sendError(response, error, request)
  }
}
