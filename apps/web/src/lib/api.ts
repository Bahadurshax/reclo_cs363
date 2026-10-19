import {
  apiErrorSchema,
  authResponseSchema,
  healthResponseSchema,
  type ApiError,
  type HealthResponse,
  type LoginRequest,
  type PublicUser,
  type RegisterRequest,
} from '@reclo/shared'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'

/** An error response from the API, with the field errors when the server sent them. */
export class ApiRequestError extends Error {
  readonly status: number
  readonly fieldErrors: ApiError['fieldErrors']

  constructor(status: number, message: string, fieldErrors?: ApiError['fieldErrors']) {
    super(message)
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

async function request(path: string, init: { method: string; body?: unknown }): Promise<Response> {
  let response: Response
  try {
    response = await fetch(`${API_URL}${path}`, {
      method: init.method,
      credentials: 'include',
      headers: init.body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
    })
  } catch {
    throw new ApiRequestError(0, 'Cannot reach the server. Check your connection and try again.')
  }
  if (!response.ok) {
    const parsed = apiErrorSchema.safeParse(await response.json().catch(() => null))
    throw new ApiRequestError(
      response.status,
      parsed.success ? parsed.data.error : 'Something went wrong. Please try again.',
      parsed.success ? parsed.data.fieldErrors : undefined,
    )
  }
  return response
}

async function requestUser(path: string, method: string, body?: unknown): Promise<PublicUser> {
  const response = await request(path, { method, body })
  return authResponseSchema.parse(await response.json()).user
}

export async function fetchHealth(): Promise<HealthResponse> {
  const response = await fetch(`${API_URL}/health`)
  const health = healthResponseSchema.parse(await response.json())
  if (health.status !== 'ok') {
    throw new Error('The API is running but cannot reach the database')
  }
  return health
}

export const register = (input: RegisterRequest) => requestUser('/api/auth/register', 'POST', input)
export const login = (input: LoginRequest) => requestUser('/api/auth/login', 'POST', input)

export async function logout(): Promise<void> {
  await request('/api/auth/logout', { method: 'POST' })
}

/** The signed-in user, or null when there is no valid session. */
export async function fetchMe(): Promise<PublicUser | null> {
  try {
    return await requestUser('/api/auth/me', 'GET')
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 401) return null
    throw error
  }
}
