import type { ApiRequest, ApiResponse } from '../_lib/http.js'
import {
  readJsonBody,
  requireMethod,
  sendError,
  sendJson,
} from '../_lib/http.js'
import { requireAuthContext } from '../_lib/session.js'
import { setUserHandle } from '../_lib/users.js'
import type { SessionPayload } from '../_lib/types.js'

type HandleRequestBody = {
  handle?: unknown
}

export default async function handler(
  request: ApiRequest,
  response: ApiResponse,
) {
  try {
    requireMethod(request, 'POST')

    const context = await requireAuthContext(request)
    const body = await readJsonBody<HandleRequestBody>(request)
    const user = await setUserHandle(context.user.id, body.handle)
    const payload: SessionPayload = {
      authenticated: true,
      needsHandle: false,
      user,
    }

    sendJson(response, 200, payload)
  } catch (error) {
    sendError(response, error)
  }
}

