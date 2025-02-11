import { initTRPC } from '@trpc/server'
import { ipcMain } from 'electron'
import type { TrpcEvent } from '../preload/index.d'
import type { AppRouter } from './router'

/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
const t = initTRPC.create({ isServer: true })

/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
export const router = t.router
export const publicProcedure = t.procedure
export const createCallerFactory = t.createCallerFactory

// We'll create and export the caller after the router is initialized
let caller: ReturnType<ReturnType<typeof createCallerFactory<AppRouter>>> | null = null

export function initializeCaller(appRouter: AppRouter) {
  caller = createCallerFactory(appRouter)({})
}

export function registerTrpcIpcListener() {
  ipcMain.handle('trpc', (_, payload: TrpcEvent) => {
    // eslint-disable-next-line @typescript-eslint/ban-types
    return (caller?.[payload.procedureName as keyof typeof caller] as Function)?.(
      JSON.parse(payload.data)
    )
  })
}
