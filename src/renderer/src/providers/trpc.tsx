import { trpcReact } from '@renderer/App'
import { ipcLink } from 'electron-trpc/renderer'
import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import superjson from 'superjson'

export const TRPCProvider = ({ children }: { children: React.ReactNode }): JSX.Element => {
  const [queryClient] = useState(() => new QueryClient())
  const [trpcClient] = useState(() =>
    trpcReact.createClient({
      links: [ipcLink()],
      transformer: superjson
    })
  )

  return (
    <trpcReact.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpcReact.Provider>
  )
}
