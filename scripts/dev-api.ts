/// <reference types="node" />

import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import { URL } from 'node:url'
import matchPrizeBundlesHandler from '../api/match-prize-bundles'
import predictionEntriesHandler from '../api/prediction-entries'

type ApiResponseBody = Record<string, unknown> | unknown[]

type ApiRequest = {
  body?: unknown
  method?: string
  query?: Record<string, string | string[]>
}

type ApiResponse = {
  json: (body: unknown) => void
  setHeader: (name: string, value: string) => void
  status: (code: number) => ApiResponse
}

type ApiHandler = (request: ApiRequest, response: ApiResponse) => Promise<void> | void

const defaultPort = 5176
const port = Number(process.env.PREDICTION_API_PORT ?? defaultPort)
const handlers: Record<string, ApiHandler> = {
  '/api/match-prize-bundles': matchPrizeBundlesHandler,
  '/api/prediction-entries': predictionEntriesHandler,
}

function readRequestBody(request: IncomingMessage) {
  return new Promise<unknown>((resolveBody, reject) => {
    const chunks: Buffer[] = []

    request.on('data', (chunk) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
    })

    request.on('error', reject)

    request.on('end', () => {
      if (chunks.length === 0) {
        resolveBody(undefined)
        return
      }

      resolveBody(Buffer.concat(chunks).toString('utf8'))
    })
  })
}

function getQuery(url: URL) {
  const query: Record<string, string | string[]> = {}

  for (const [key, value] of url.searchParams.entries()) {
    const existingValue = query[key]

    if (Array.isArray(existingValue)) {
      existingValue.push(value)
    } else if (existingValue) {
      query[key] = [existingValue, value]
    } else {
      query[key] = value
    }
  }

  return query
}

function createResponse(serverResponse: ServerResponse): ApiResponse {
  let statusCode = 200

  const apiResponse: ApiResponse = {
    json(body: unknown) {
      const responseBody = JSON.stringify(body)

      serverResponse.statusCode = statusCode
      serverResponse.setHeader('Content-Type', 'application/json')
      serverResponse.end(responseBody)
    },
    setHeader(name: string, value: string) {
      serverResponse.setHeader(name, value)
    },
    status(code: number) {
      statusCode = code
      return apiResponse
    },
  }

  return apiResponse
}

function sendJson(
  response: ServerResponse,
  statusCode: number,
  body: ApiResponseBody,
) {
  response.statusCode = statusCode
  response.setHeader('Content-Type', 'application/json')
  response.end(JSON.stringify(body))
}

const server = createServer(async (request, response) => {
  const requestUrl = new URL(request.url ?? '/', `http://${request.headers.host}`)
  const handler = handlers[requestUrl.pathname]

  if (!handler) {
    sendJson(response, 404, { error: 'API route not found.' })
    return
  }

  try {
    await handler(
      {
        body: await readRequestBody(request),
        method: request.method,
        query: getQuery(requestUrl),
      },
      createResponse(response),
    )
  } catch {
    sendJson(response, 500, {
      error: 'Local prediction API failed. Check the dev API process logs.',
    })
  }
})

server.listen(port, '127.0.0.1', () => {
  console.log(`Prediction API dev server listening on http://127.0.0.1:${port}`)
})
