import { ipcLink } from 'electron-trpc/renderer'
import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import superjson from 'superjson'
import { createTRPCReact } from '@trpc/react-query'
import { AppRouter } from '../../../main/router'

export const api = createTRPCReact<AppRouter>()

export const TRPCProvider = ({ children }: { children: React.ReactNode }): JSX.Element => {
  const [queryClient] = useState(() => new QueryClient())
  const [trpcClient] = useState(() =>
    api.createClient({
      links: [ipcLink()],
      transformer: superjson
    })
  )

  return (
    <api.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </api.Provider>
  )
}
