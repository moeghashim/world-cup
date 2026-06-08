export type ApiRequest = {
  method?: string
  query?: Record<string, string | string[] | undefined>
  headers: Record<string, string | string[] | undefined>
  body?: unknown
}

export type ApiResponse = {
  status: (statusCode: number) => ApiResponse
  json: (body: unknown) => void
  redirect: (statusOrUrl: number | string, url?: string) => void
  setHeader: (name: string, value: string | string[]) => void
}

export type ApiErrorCode =
  | 'bad_request'
  | 'method_not_allowed'
  | 'not_authenticated'
  | 'handle_required'
  | 'handle_taken'
  | 'server_error'

export class HttpError extends Error {
  status: number
  code: ApiErrorCode

  constructor(
    status: number,
    code: ApiErrorCode,
    message: string,
  ) {
    super(message)
    this.status = status
    this.code = code
  }
}

export function requireMethod(request: ApiRequest, method: string) {
  if ((request.method ?? 'GET').toUpperCase() !== method) {
    throw new HttpError(405, 'method_not_allowed', `Use ${method}`)
  }
}

export function sendJson(response: ApiResponse, status: number, body: unknown) {
  response.status(status).json(body)
}

export function sendError(response: ApiResponse, error: unknown) {
  if (error instanceof HttpError) {
    response.status(error.status).json({
      error: {
        code: error.code,
        message: error.message,
      },
    })
    return
  }

  response.status(500).json({
    error: {
      code: 'server_error',
      message: 'Something went wrong.',
    },
  })
}

export async function readJsonBody<T>(request: ApiRequest): Promise<T> {
  if (
    typeof request.body === 'object' &&
    request.body !== null &&
    !Buffer.isBuffer(request.body)
  ) {
    return request.body as T
  }

  if (typeof request.body === 'string' && request.body.trim()) {
    return JSON.parse(request.body) as T
  }

  return {} as T
}
