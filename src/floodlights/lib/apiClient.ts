import type { ApiErrorBody } from './accountTypes'

export class ApiClientError extends Error {
  status: number
  code: string

  constructor(
    status: number,
    code: string,
    message: string,
  ) {
    super(message)
    this.status = status
    this.code = code
  }
}

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const response = await fetch(path, {
    credentials: 'include',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body:
      options.body === undefined ? undefined : JSON.stringify(options.body),
  })

  const text = await response.text()
  const parsed = text ? (JSON.parse(text) as T | ApiErrorBody) : null

  if (!response.ok) {
    const errorBody = parsed as ApiErrorBody | null
    throw new ApiClientError(
      response.status,
      errorBody?.error?.code ?? 'request_failed',
      errorBody?.error?.message ?? 'Request failed.',
    )
  }

  return parsed as T
}
