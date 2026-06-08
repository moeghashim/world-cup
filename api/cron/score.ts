import type { ApiRequest, ApiResponse } from '../_lib/http.js'
import { requireMethod, sendError, sendJson } from '../_lib/http.js'
import { requireCronSecret } from '../_lib/cron.js'
import { scoreAndPersistStandings } from '../_lib/scoring.js'

export default async function handler(
  request: ApiRequest,
  response: ApiResponse,
) {
  try {
    requireMethod(request, 'GET')
    requireCronSecret(request)

    sendJson(response, 200, {
      ok: true,
      standings: await scoreAndPersistStandings(),
    })
  } catch (error) {
    sendError(response, error, request)
  }
}
