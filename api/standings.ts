import type { ApiRequest, ApiResponse } from './_lib/http.js'
import { requireMethod, sendError, sendJson } from './_lib/http.js'
import { parseCookies, sessionCookieName } from './_lib/cookies.js'
import { loadStandings } from './_lib/standings.js'

async function optionalUserId(request: ApiRequest): Promise<string | undefined> {
  if (!parseCookies(request)[sessionCookieName]) return undefined

  const { getAuthContext } = await import('./_lib/session.js')
  const context = await getAuthContext(request)
  return context?.user.id
}

export default async function handler(
  request: ApiRequest,
  response: ApiResponse,
) {
  try {
    requireMethod(request, 'GET')
    response.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300')
    sendJson(response, 200, await loadStandings(await optionalUserId(request)))
  } catch (error) {
    sendError(response, error, request)
  }
}
