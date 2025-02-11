import { ElectronAPI } from '@electron-toolkit/preload'

type JsonString = string

export type TrpcEvent = {
  procedureName: string
  data: JsonString
}

declare global {
  interface Window {
    electron: ElectronAPI & {
      sendTrpcEvent: (payload: TrpcEvent) => Promise<unknown>
    }
    api: unknown
  }
}
