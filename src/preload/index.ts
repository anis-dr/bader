import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { api } from './api'

// Custom APIs for renderer
const trpcAPI = {
  sendTrpcEvent: (param) => ipcRenderer.invoke('trpc', param)
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('electron', {
      ...electronAPI,
      ...trpcAPI
    })
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.api = api
  // @ts-ignore (define in dts)
  window.electron = {
    ...electronAPI,
    ...trpcAPI
  }
}
