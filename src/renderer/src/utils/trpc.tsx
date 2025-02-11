import { createTRPCProxyClient, httpLink } from '@trpc/client'
import { AppRouter } from '../../../main/router'
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '@renderer/contexts/auth'
import type { RefreshTokenOutput } from 'src/main/routes/auth'

interface RequestConfig {
  procedureName: string
  data: Record<string, unknown> | string | null
  token: string | null
}

// Auth utilities
let logoutFn: () => void

export function setLogoutFunction(fn: () => void) {
  logoutFn = fn
}

function clearAuthData() {
  if (logoutFn) {
    logoutFn()
  }
}

// Core request handling
async function makeRequest<T = unknown>({ procedureName, data, token }: RequestConfig): Promise<T> {
  const response = await window.electron.sendTrpcEvent({
    procedureName,
    data: typeof data === 'string' ? data : JSON.stringify(data),
    meta: {
      headers: {
        'user-agent': 'My Custom Client',
        ...(token && { authorization: `Bearer ${token}` })
      },
      clientId: 'client-123'
    }
  })
  return response as T
}

// Token refresh handling
async function handleTokenRefresh(refreshToken: string): Promise<string> {
  const refreshResult = await makeRequest<RefreshTokenOutput>({
    procedureName: 'auth.refresh',
    data: { refreshToken },
    token: null
  })
  localStorage.setItem(ACCESS_TOKEN_KEY, refreshResult.accessToken)
  return refreshResult.accessToken
}

// Request parsing
function parseRequest(
  input: string,
  init?: RequestInit
): {
  procedureName: string
  data: Record<string, unknown> | string | null
} {
  const mockUrl = new URL('http://dummy' + input)
  const procedureName = mockUrl.pathname.replace('/', '')

  let data = mockUrl.searchParams.get('input')
  if (init?.method === 'POST' && init.body) {
    data = JSON.parse(init.body.toString())
  }

  return { procedureName, data }
}

// Response formatting
function createSuccessResponse(result: unknown): Response {
  return new Response(JSON.stringify({ result: { data: result } }), {
    status: 200,
    headers: { 'content-type': 'application/json' }
  })
}

function createErrorResponse(error: unknown, procedureName: string): Response {
  const errorData = {
    code: 'INTERNAL_SERVER_ERROR',
    httpStatus: 500,
    path: procedureName
  }

  return new Response(
    JSON.stringify({
      error: {
        message: formatErrorMessage(error),
        code: -32000,
        data: errorData
      }
    }),
    {
      status: 500,
      headers: { 'content-type': 'application/json' }
    }
  )
}

// Error handling
function formatErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const match = error.message.match(/TRPCError: (.+)$/)
    if (match) return match[1]
    if (error.message.includes('Error invoking remote method')) {
      return error.message.replace(/Error invoking remote method 'trpc': TRPCError: /, '')
    }
    return error.message
  }
  return 'An unexpected error occurred'
}

// Protected request handling
async function handleProtectedRequest(
  procedureName: string,
  data: Record<string, unknown> | string | null,
  accessToken: string,
  refreshToken: string | null
): Promise<Response> {
  try {
    const result = await makeRequest({
      procedureName,
      data,
      token: accessToken
    })
    return createSuccessResponse(result)
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes('Invalid or expired token') &&
      refreshToken
    ) {
      try {
        const newAccessToken = await handleTokenRefresh(refreshToken)
        const result = await makeRequest({
          procedureName,
          data,
          token: newAccessToken
        })
        return createSuccessResponse(result)
      } catch (refreshError) {
        clearAuthData()
        throw refreshError
      }
    }
    throw error
  }
}

// Main TRPC client configuration
export const api = createTRPCProxyClient<AppRouter>({
  links: [
    httpLink({
      url: '',
      fetch: async (input, init) => {
        if (typeof input !== 'string') {
          throw new Error('Unexpected input format')
        }

        const { procedureName, data } = parseRequest(input, init)
        const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY)
        const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)

        try {
          // Handle authenticated requests
          if (accessToken && procedureName !== 'auth.refresh') {
            return await handleProtectedRequest(procedureName, data, accessToken, refreshToken)
          }

          // Handle public requests
          const result = await makeRequest({ procedureName, data, token: null })
          return createSuccessResponse(result)
        } catch (error) {
          return createErrorResponse(error, procedureName)
        }
      }
    })
  ]
})
