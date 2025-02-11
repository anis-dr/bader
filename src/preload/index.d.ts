import { ElectronAPI } from '@electron-toolkit/preload'

type JsonString = string

export type TrpcEvent = {
  procedureName: string
  data: JsonString
  meta?: {
    headers?: Record<string, string>
    clientId?: string
  }
}

declare global {
  interface Window {
    electron: ElectronAPI & {
      sendTrpcEvent: (payload: TrpcEvent) => Promise<unknown>
    }
    api: unknown
  }
}
