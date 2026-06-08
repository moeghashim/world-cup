import type { ApiRequest, ApiResponse } from '../_lib/http.js'
import { requireMethod, sendError, sendJson } from '../_lib/http.js'
import { requireCronSecret } from '../_lib/cron.js'
import { refreshFixtureCache } from '../_lib/results-cache.js'

export default async function handler(
  request: ApiRequest,
  response: ApiResponse,
) {
  try {
    requireMethod(request, 'GET')
    requireCronSecret(request)

    sendJson(response, 200, {
      ok: true,
      fixtures: await refreshFixtureCache(),
    })
  } catch (error) {
    sendError(response, error, request)
  }
}
