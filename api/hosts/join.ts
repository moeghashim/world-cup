import type { ApiRequest, ApiResponse } from '../_lib/http.js'
import {
  readJsonBody,
  requireMethod,
  sendError,
  sendJson,
} from '../_lib/http.js'
import { joinHostForUser } from '../_lib/hosts.js'
import { requireHandle } from '../_lib/session.js'

type JoinHostBody = {
  slug?: unknown
  code?: unknown
}

export default async function handler(
  request: ApiRequest,
  response: ApiResponse,
) {
  try {
    requireMethod(request, 'POST')
    const context = await requireHandle(request)
    const body = await readJsonBody<JoinHostBody>(request)
    const host = await joinHostForUser({
      slug: body.slug,
      code: body.code,
      userId: context.user.id,
    })

    sendJson(response, 200, { host })
  } catch (error) {
    sendError(response, error, request)
  }
}
