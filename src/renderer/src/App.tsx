import { HelloElectron } from './hello-electron'
import { TRPCProvider } from './providers/trpc'

const App = (): JSX.Element => {
  return (
    <TRPCProvider>
      <HelloElectron />
    </TRPCProvider>
  )
}

export default App
