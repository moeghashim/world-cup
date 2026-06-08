import type { ApiRequest, ApiResponse } from '../_lib/http.js'
import { requireMethod, sendError, sendJson } from '../_lib/http.js'
import { loadPublicHost, shapeHostForPublicApi } from '../_lib/hosts.js'

export default async function handler(
  request: ApiRequest,
  response: ApiResponse,
) {
  try {
    requireMethod(request, 'GET')
    const slug = Array.isArray(request.query?.slug)
      ? request.query?.slug[0]
      : request.query?.slug
    const host = await loadPublicHost(slug)

    sendJson(response, 200, { host: shapeHostForPublicApi(host) })
  } catch (error) {
    sendError(response, error, request)
  }
}
