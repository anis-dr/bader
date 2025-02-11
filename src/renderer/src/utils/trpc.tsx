import { createTRPCProxyClient, httpLink } from '@trpc/client'
import { AppRouter } from '../../../main/router'

const AUTH_TOKEN_KEY = 'auth_token'

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
        const token = localStorage.getItem(AUTH_TOKEN_KEY)

        try {
          const result = await window.electron.sendTrpcEvent({
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

          // Format response according to tRPC protocol
          return new Response(
            JSON.stringify({
              result: {
                data: result
              }
            })
          )
        } catch (error) {
          console.error('TRPC Error', error)

          // Extract the actual error message from the TRPCError
          let errorMessage = 'An unexpected error occurred'

          if (error instanceof Error) {
            // Match everything after "TRPCError: "
            const match = error.message.match(/TRPCError: (.+)$/)
            if (match) {
              errorMessage = match[1]
            } else if (error.message.includes('Error invoking remote method')) {
              // If it's a remote method error, clean up the message
              errorMessage = error.message.replace(
                /Error invoking remote method 'trpc': TRPCError: /,
                ''
              )
            } else {
              errorMessage = error.message
            }
          }

          // Format error response according to tRPC protocol
          return new Response(
            JSON.stringify({
              error: {
                message: errorMessage,
                code: -32000, // JSON-RPC error code
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
