import { createTRPCProxyClient, httpLink } from '@trpc/client'
import { AppRouter } from '../../../main/router'

const ACCESS_TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'

interface RefreshResponse {
  accessToken: string
}

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

        // Handle both query params and mutation body
        let data = mockUrl.searchParams.get('input')

        // If it's a POST request (mutation), get data from the body
        if (init?.method === 'POST' && init.body) {
          const body = JSON.parse(init.body.toString())
          data = body
        }

        // Get the auth token
        const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY)
        const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)

        try {
          // First try with access token
          if (accessToken && procedureName !== 'auth.refresh') {
            try {
              const result = await makeRequest(procedureName, data, accessToken)
              return new Response(JSON.stringify({ result: { data: result } }))
            } catch (error) {
              // If unauthorized and we have a refresh token, try refresh flow
              if (
                error instanceof Error &&
                error.message.includes('Invalid or expired token') &&
                refreshToken
              ) {
                // Try to refresh the access token
                const refreshResult = await makeRequest<RefreshResponse>(
                  'auth.refresh',
                  { refreshToken },
                  null
                )
                localStorage.setItem(ACCESS_TOKEN_KEY, refreshResult.accessToken)

                // Retry the original request with the new access token
                const result = await makeRequest(procedureName, data, refreshResult.accessToken)
                return new Response(JSON.stringify({ result: { data: result } }))
              }
              throw error
            }
          }

          // If no access token or refresh token request
          const result = await makeRequest(procedureName, data, null)
          return new Response(JSON.stringify({ result: { data: result } }))
        } catch (error) {
          let errorMessage = 'An unexpected error occurred'

          if (error instanceof Error) {
            const match = error.message.match(/TRPCError: (.+)$/)
            if (match) {
              errorMessage = match[1]
            } else if (error.message.includes('Error invoking remote method')) {
              errorMessage = error.message.replace(
                /Error invoking remote method 'trpc': TRPCError: /,
                ''
              )
            } else {
              errorMessage = error.message
            }
          }

          return new Response(
            JSON.stringify({
              error: {
                message: errorMessage,
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

async function makeRequest<T = unknown>(
  procedureName: string,
  data: Record<string, unknown> | string | null,
  token: string | null
): Promise<T> {
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
