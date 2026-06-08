import type { ApiRequest, ApiResponse } from '../_lib/http.js'
import { clearSessionCookie } from '../_lib/cookies.js'
import { sendError } from '../_lib/http.js'
import { getRequestOrigin, getReturnTo } from '../_lib/request-url.js'
import { getAuth0LogoutUrl } from '../_lib/auth0.js'

export default async function handler(
  request: ApiRequest,
  response: ApiResponse,
) {
  try {
    const returnPath = getReturnTo(request)
    const returnTo = `${getRequestOrigin(request)}${returnPath}`
    const logoutUrl = getAuth0LogoutUrl(returnTo)

    clearSessionCookie(response, request)

    if ((request.method ?? 'GET').toUpperCase() === 'POST') {
      response.status(200).json({ logoutUrl })
      return
    }

    response.redirect(302, logoutUrl)
  } catch (error) {
    clearSessionCookie(response, request)
    sendError(response, error, request)
  }
}
