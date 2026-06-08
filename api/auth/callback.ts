import type { ApiRequest, ApiResponse } from '../_lib/http.js'
import { HttpError, sendError } from '../_lib/http.js'
import {
  clearedAuthStateCookie,
  getAuthStateCookie,
  setSessionCookie,
} from '../_lib/cookies.js'
import {
  decodeAuthState,
  getAuthRedirectUri,
  getQueryString,
} from '../_lib/request-url.js'
import { createAppSession, exchangeAuth0Code } from '../_lib/auth0.js'
import {
  getSignupCountry,
  upsertLocalUserFromAuth0,
} from '../_lib/users.js'

export default async function handler(
  request: ApiRequest,
  response: ApiResponse,
) {
  try {
    const code = getQueryString(request.query?.code)
    if (!code) {
      throw new HttpError(400, 'bad_request', 'Missing Auth0 callback code.')
    }

    const { returnTo, nonce } = decodeAuthState(request.query?.state)
    if (!nonce || nonce !== getAuthStateCookie(request)) {
      throw new HttpError(400, 'bad_request', 'Invalid authentication state.')
    }

    const auth0User = await exchangeAuth0Code({
      code,
      redirectUri: getAuthRedirectUri(request),
    })
    const user = await upsertLocalUserFromAuth0(
      auth0User,
      getSignupCountry(request.headers),
    )
    const destination = user.handle
      ? returnTo
      : `/profile?setup=handle&returnTo=${encodeURIComponent(returnTo)}`

    setSessionCookie(response, request, createAppSession(auth0User.id), [
      clearedAuthStateCookie(request),
    ])
    response.redirect(302, destination)
  } catch (error) {
    sendError(response, error, request)
  }
}
