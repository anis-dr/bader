import { initTRPC } from '@trpc/server'
import { ipcMain } from 'electron'
import type { TrpcEvent } from '../preload/index.d'
import type { AppRouter } from './router'

export interface Context {
  meta?: {
    headers?: Record<string, string>
    clientId?: string
  }
}

/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
const t = initTRPC.context<Context>().create({ isServer: true })

/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
export const router = t.router
export const publicProcedure = t.procedure
export const createCallerFactory = t.createCallerFactory

export function registerTrpcIpcListener(appRouter: AppRouter) {
  ipcMain.handle('trpc', (_, payload: TrpcEvent) => {
    // Create context with metadata
    const ctx: Context = { meta: payload.meta }

    // Create a caller with context for this request
    const caller = createCallerFactory(appRouter)(ctx)

    // eslint-disable-next-line @typescript-eslint/ban-types
    return (caller[payload.procedureName as keyof typeof caller] as Function)?.(
      JSON.parse(payload.data)
    )
  })
}
