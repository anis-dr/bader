import { createTRPCProxyClient, httpLink } from '@trpc/client'
import { AppRouter } from '../../../main/router'
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '@renderer/contexts/auth'

// Types
interface RefreshResponse {
  accessToken: string
}

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
  const refreshResult = await makeRequest<RefreshResponse>({
    procedureName: 'auth.refresh',
    data: { refreshToken },
    token: null
  })
  localStorage.setItem(ACCESS_TOKEN_KEY, refreshResult.accessToken)
  return refreshResult.accessToken
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

// Main TRPC client configuration
export const api = createTRPCProxyClient<AppRouter>({
  links: [
    httpLink({
      url: '',
      fetch: async (input, init) => {
        if (typeof input !== 'string') {
          throw new Error('Unexpected input format')
        }

        const mockUrl = new URL('http://dummy' + input)
        const procedureName = mockUrl.pathname.replace('/', '')

        // Handle request data
        let data = mockUrl.searchParams.get('input')
        if (init?.method === 'POST' && init.body) {
          data = JSON.parse(init.body.toString())
        }

        // Get tokens
        const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY)
        const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)

        try {
          // Handle authenticated requests
          if (accessToken && procedureName !== 'auth.refresh') {
            try {
              const result = await makeRequest({
                procedureName,
                data,
                token: accessToken
              })
              return new Response(JSON.stringify({ result: { data: result } }))
            } catch (error) {
              // Handle token refresh
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
                  return new Response(JSON.stringify({ result: { data: result } }))
                } catch (refreshError) {
                  clearAuthData()
                  throw refreshError
                }
              }
              throw error
            }
          }

          // Handle public requests
          const result = await makeRequest({ procedureName, data, token: null })
          return new Response(JSON.stringify({ result: { data: result } }))
        } catch (error) {
          return new Response(
            JSON.stringify({
              error: {
                message: formatErrorMessage(error),
                code: -32000,
                data: {
                  code: 'INTERNAL_SERVER_ERROR',
                  httpStatus: 500,
                  path: procedureName
                }
              }
            }),
            {
              status: 500,
              headers: {
                'content-type': 'application/json'
              }
            }
          )
        }
      }
    })
  ]
})
