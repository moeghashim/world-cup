import type { ApiRequest, ApiResponse } from './_lib/http.js'
import { requireMethod, sendError, sendJson } from './_lib/http.js'
import { requireAuthContext } from './_lib/session.js'

export default async function handler(
  request: ApiRequest,
  response: ApiResponse,
) {
  try {
    requireMethod(request, 'GET')
    const context = await requireAuthContext(request)

    sendJson(response, 200, {
      user: context.user,
      needsHandle: !context.user.handle,
    })
  } catch (error) {
    sendError(response, error)
  }
}

