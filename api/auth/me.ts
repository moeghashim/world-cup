import type { ApiRequest, ApiResponse } from '../_lib/http.js'
import { requireMethod, sendError, sendJson } from '../_lib/http.js'
import { getAuthContext } from '../_lib/session.js'
import type { SessionPayload } from '../_lib/types.js'

export default async function handler(
  request: ApiRequest,
  response: ApiResponse,
) {
  try {
    requireMethod(request, 'GET')

    const context = await getAuthContext(request)
    const body: SessionPayload = context
      ? {
          authenticated: true,
          needsHandle: !context.user.handle,
          user: context.user,
        }
      : {
          authenticated: false,
          needsHandle: false,
          user: null,
        }

    sendJson(response, 200, body)
  } catch (error) {
    sendError(response, error, request)
  }
}
