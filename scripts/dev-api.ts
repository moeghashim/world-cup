import { createServer } from 'node:http'
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { ApiRequest, ApiResponse } from '../api/_lib/http.js'

const port = Number(process.env.DEV_API_PORT ?? 5181)

type Handler = (request: ApiRequest, response: ApiResponse) => unknown

const routes: Record<string, () => Promise<{ default: Handler }>> = {
  '/api/auth/start': () => import('../api/auth/start.js'),
  '/api/auth/callback': () => import('../api/auth/callback.js'),
  '/api/auth/logout': () => import('../api/auth/logout.js'),
  '/api/auth/me': () => import('../api/auth/me.js'),
  '/api/auth/passwordless/start': () =>
    import('../api/auth/passwordless-start.js'),
  '/api/auth/passwordless/verify': () =>
    import('../api/auth/passwordless-verify.js'),
  '/api/profile': () => import('../api/profile.js'),
  '/api/profile/handle': () => import('../api/profile/handle.js'),
  '/api/data/fixtures': () => import('../api/data/fixtures.js'),
  '/api/data/community': () => import('../api/data/community.js'),
  '/api/data/results': () => import('../api/data/results.js'),
  '/api/standings': () => import('../api/standings.js'),
  '/api/cron/refresh-fixtures': () =>
    import('../api/cron/refresh-fixtures.js'),
  '/api/cron/poll-results': () => import('../api/cron/poll-results.js'),
  '/api/cron/score': () => import('../api/cron/score.js'),
  '/api/hosts': () => import('../api/hosts/index.js'),
  '/api/hosts/join': () => import('../api/hosts/join.js'),
  '/api/picks/bracket': () => import('../api/picks/bracket.js'),
  '/api/picks/group': () => import('../api/picks/group.js'),
  '/api/picks/predict': () => import('../api/picks/predict.js'),
}

function queryToObject(
  query: NodeJS.Dict<string | string[]>,
): Record<string, string | string[] | undefined> {
  return Object.entries(query).reduce<Record<string, string | string[] | undefined>>((record, [key, value]) => {
    record[key] = value
    return record
  }, {})
}

async function readBody(request: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = []
  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }

  const raw = Buffer.concat(chunks).toString('utf8')
  if (!raw.trim()) return undefined

  const contentType = request.headers['content-type'] ?? ''
  if (String(contentType).includes('application/json')) {
    return JSON.parse(raw)
  }

  return raw
}

function createApiResponse(response: ServerResponse): ApiResponse {
  return {
    status(statusCode) {
      response.statusCode = statusCode
      return this
    },
    json(body) {
      response.setHeader('Content-Type', 'application/json')
      response.end(JSON.stringify(body))
    },
    redirect(statusOrUrl, url) {
      const statusCode = typeof statusOrUrl === 'number' ? statusOrUrl : 302
      const location = typeof statusOrUrl === 'string' ? statusOrUrl : url ?? '/'
      response.statusCode = statusCode
      response.setHeader('Location', location)
      response.end()
    },
    setHeader(name, value) {
      response.setHeader(name, value)
    },
  }
}

const server = createServer(async (incoming, outgoing) => {
  const parsedUrl = new URL(
    incoming.url ?? '/',
    `http://${incoming.headers.host ?? `127.0.0.1:${port}`}`,
  )
  let loader = routes[parsedUrl.pathname]
  const hostMatch = /^\/api\/hosts\/([^/]+)$/.exec(parsedUrl.pathname)
  if (!loader && hostMatch) {
    parsedUrl.searchParams.set('slug', hostMatch[1])
    loader = () => import('../api/hosts/[slug].js')
  }

  if (!loader) {
    outgoing.statusCode = 404
    outgoing.end('Not found')
    return
  }

  try {
    const { default: handler } = await loader()
    await handler(
      {
        method: incoming.method,
        headers: incoming.headers,
        query: queryToObject(
          Object.fromEntries(parsedUrl.searchParams.entries()),
        ),
        body: await readBody(incoming),
      },
      createApiResponse(outgoing),
    )
  } catch (error) {
    outgoing.statusCode = 500
    outgoing.setHeader('Content-Type', 'application/json')
    outgoing.end(
      JSON.stringify({
        error: {
          code: 'server_error',
          message: error instanceof Error ? error.message : 'Server error',
        },
      }),
    )
  }
})

server.listen(port, '127.0.0.1', () => {
  console.log(`API shim ready at http://127.0.0.1:${port}`)
})
