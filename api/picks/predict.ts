import type { ApiRequest, ApiResponse } from '../_lib/http.js'
import {
  readJsonBody,
  requireMethod,
  sendError,
  sendJson,
} from '../_lib/http.js'
import {
  loadPredictions,
  savePrediction,
  validatePredictionPayload,
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
      sendJson(response, 200, {
        predictions: await loadPredictions(context.user.id),
      })
      return
    }

    requireMethod(request, 'PUT')
    const context = await requireHandle(request)
    const body = await readJsonBody<unknown>(request)
    const prediction = await savePrediction(
      context.user.id,
      validatePredictionPayload(body),
    )

    sendJson(response, 200, { prediction })
  } catch (error) {
    sendError(response, error, request)
  }
}
