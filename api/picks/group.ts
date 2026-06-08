import type { ApiRequest, ApiResponse } from '../_lib/http.js'
import {
  readJsonBody,
  requireMethod,
  sendError,
  sendJson,
} from '../_lib/http.js'
import {
  loadGroupPicks,
  saveGroupPicks,
  validateGroupPicksPayload,
} from '../_lib/picks.js'
import { requireAuthContext, requireHandle } from '../_lib/session.js'

export default async function handler(
  request: ApiRequest,
  response: ApiResponse,
) {
  try {
    const method = (request.method ?? 'GET').toUpperCase()

    if (method === 'GET') {
      const context = await requireAuthContext(request)
      sendJson(response, 200, { groupPicks: await loadGroupPicks(context.user.id) })
      return
    }

    requireMethod(request, 'PUT')
    const context = await requireHandle(request)
    const body = await readJsonBody<unknown>(request)
    const groupPicks = await saveGroupPicks(
      context.user.id,
      validateGroupPicksPayload(body),
    )

    sendJson(response, 200, { groupPicks })
  } catch (error) {
    sendError(response, error, request)
  }
}
