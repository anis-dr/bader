import Versions from './components/Versions'
import electronLogo from './assets/electron.svg'
import { api } from './providers/trpc'
import { useQuery } from '@tanstack/react-query'

export const HelloElectron = () => {
  const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')
  const { data } = useQuery({
    queryKey: ['greeting', 'hello'],
    queryFn: () => api.greeting.hello.query({ name: 'Electron' })
  })

  console.log('🚀 ~ data:', data)
  return (
    <>
      <img alt="logo" className="logo" src={electronLogo} />
      <div className="creator">Powered by electron-vite</div>
      <div className="text">
        Build an Electron app with <span className="react">React</span>
        &nbsp;and <span className="ts">TypeScript</span>
      </div>
      <p className="tip">
        Please try pressing <code>F12</code> to open the devTool
      </p>
      <div className="actions">
        <div className="action">
          <a href="https://electron-vite.org/" target="_blank" rel="noreferrer">
            Documentation
          </a>
        </div>
        <div className="action">
          <a target="_blank" rel="noreferrer" onClick={ipcHandle}>
            Send IPC
          </a>
        </div>
      </div>
      <Versions></Versions>
    </>
  )
}
