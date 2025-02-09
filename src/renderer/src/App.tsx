import { createTRPCReact } from '@trpc/react-query'
import { AppRouter } from '../../main/router'
import { HelloElectron } from './hello-electron'
import { TRPCProvider } from './providers/trpc'

export const trpcReact = createTRPCReact<AppRouter>()

const App = (): JSX.Element => {
  return (
    <TRPCProvider>
      <HelloElectron />
    </TRPCProvider>
  )
}

export default App
