import { QueryClientProvider } from '@tanstack/react-query'
import { QueryClient } from '@tanstack/react-query'
import { HelloElectron } from './hello-electron'

const queryClient = new QueryClient()

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <HelloElectron />
    </QueryClientProvider>
  )
}

export default App
