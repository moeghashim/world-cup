import type { ApiRequest, ApiResponse } from '../_lib/http.js'
import {
  readJsonBody,
  requireMethod,
  sendError,
  sendJson,
} from '../_lib/http.js'
import { createHostForUser } from '../_lib/hosts.js'
import { requireHandle } from '../_lib/session.js'

type CreateHostBody = {
  name?: unknown
}

export default async function handler(
  request: ApiRequest,
  response: ApiResponse,
) {
  try {
    requireMethod(request, 'POST')
    const context = await requireHandle(request)
    const body = await readJsonBody<CreateHostBody>(request)
    const host = await createHostForUser(context.user.id, body.name)

    sendJson(response, 201, { host })
  } catch (error) {
    sendError(response, error, request)
  }
}
