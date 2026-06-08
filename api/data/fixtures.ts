import type { ApiRequest, ApiResponse } from '../_lib/http.js'
import {
  requireMethod,
  sendError,
  sendJson,
} from '../_lib/http.js'
import { loadTournamentData } from '../_lib/tournament-data.js'

export default async function handler(
  request: ApiRequest,
  response: ApiResponse,
) {
  try {
    requireMethod(request, 'GET')
    response.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300')
    sendJson(response, 200, await loadTournamentData())
  } catch (error) {
    sendError(response, error, request)
  }
}
