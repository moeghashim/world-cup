import type { ApiRequest, ApiResponse } from '../_lib/http.js'
import { HttpError, sendError } from '../_lib/http.js'
import { setSessionCookie } from '../_lib/cookies.js'
import { decodeAuthState, getQueryString } from '../_lib/request-url.js'
import {
  getWorkOS,
  getWorkOSClientId,
  getWorkOSCookiePassword,
} from '../_lib/workos.js'
import {
  getSignupCountry,
  upsertLocalUserFromWorkOS,
} from '../_lib/users.js'

export default async function handler(
  request: ApiRequest,
  response: ApiResponse,
) {
  try {
    const code = getQueryString(request.query?.code)
    if (!code) {
      throw new HttpError(400, 'bad_request', 'Missing WorkOS callback code.')
    }

    const authResponse = await getWorkOS().userManagement.authenticateWithCode({
      clientId: getWorkOSClientId(),
      code,
      session: {
        sealSession: true,
        cookiePassword: getWorkOSCookiePassword(),
      },
    })

    if (!authResponse.sealedSession) {
      throw new Error('WorkOS did not return a sealed session.')
    }

    const user = await upsertLocalUserFromWorkOS(
      authResponse.user,
      getSignupCountry(request.headers),
    )
    const { returnTo } = decodeAuthState(request.query?.state)
    const destination = user.handle
      ? returnTo
      : `/profile?setup=handle&returnTo=${encodeURIComponent(returnTo)}`

    setSessionCookie(response, request, authResponse.sealedSession)
    response.redirect(302, destination)
  } catch (error) {
    sendError(response, error, request)
  }
}
