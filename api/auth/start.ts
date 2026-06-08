import { randomBytes } from 'node:crypto'
import type { ApiRequest, ApiResponse } from '../_lib/http.js'
import { sendError } from '../_lib/http.js'
import { setAuthStateCookie } from '../_lib/cookies.js'
import {
  encodeAuthState,
  getAuthRedirectUri,
  getReturnTo,
} from '../_lib/request-url.js'
import { getAuth0AuthorizationUrl } from '../_lib/auth0.js'

export default function handler(request: ApiRequest, response: ApiResponse) {
  try {
    const returnTo = getReturnTo(request)
    const nonce = randomBytes(16).toString('base64url')
    const authorizationUrl = getAuth0AuthorizationUrl({
      redirectUri: getAuthRedirectUri(request),
      state: encodeAuthState(returnTo, nonce),
    })

    setAuthStateCookie(response, request, nonce)
    response.redirect(302, authorizationUrl)
  } catch (error) {
    sendError(response, error, request)
  }
}
