import type { ApiRequest, ApiResponse } from '../_lib/http.js'
import { sendError } from '../_lib/http.js'
import {
  encodeAuthState,
  getAuthRedirectUri,
  getReturnTo,
} from '../_lib/request-url.js'
import { getWorkOS, getWorkOSClientId } from '../_lib/workos.js'

export default function handler(request: ApiRequest, response: ApiResponse) {
  try {
    const returnTo = getReturnTo(request)
    const authorizationUrl = getWorkOS().userManagement.getAuthorizationUrl({
      clientId: getWorkOSClientId(),
      provider: 'authkit',
      redirectUri: getAuthRedirectUri(request),
      state: encodeAuthState(returnTo),
    })

    response.redirect(302, authorizationUrl)
  } catch (error) {
    sendError(response, error, request)
  }
}
