import type { ApiRequest, ApiResponse } from '../_lib/http.js'
import { clearSessionCookie } from '../_lib/cookies.js'
import { sendError } from '../_lib/http.js'
import { getRequestOrigin, getReturnTo } from '../_lib/request-url.js'
import { getWorkOSLogoutUrl } from '../_lib/session.js'

export default async function handler(
  request: ApiRequest,
  response: ApiResponse,
) {
  try {
    const returnPath = getReturnTo(request)
    const returnTo = `${getRequestOrigin(request)}${returnPath}`
    const logoutUrl = await getWorkOSLogoutUrl(request, returnTo)

    clearSessionCookie(response, request)

    if ((request.method ?? 'GET').toUpperCase() === 'POST') {
      response.status(200).json({ logoutUrl: logoutUrl ?? returnPath })
      return
    }

    response.redirect(302, logoutUrl ?? returnPath)
  } catch (error) {
    clearSessionCookie(response, request)
    sendError(response, error, request)
  }
}
