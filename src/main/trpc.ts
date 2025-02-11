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

// Store both the router and caller
let appRouter: AppRouter | null = null
let caller: ReturnType<ReturnType<typeof createCallerFactory<AppRouter>>> | null = null

export function initializeCaller(router: AppRouter) {
  appRouter = router
  caller = createCallerFactory(router)({})
}

export function registerTrpcIpcListener() {
  ipcMain.handle('trpc', (_, payload: TrpcEvent) => {
    if (!caller || !appRouter) throw new Error('tRPC caller not initialized')

    // Create context with metadata
    const ctx: Context = { meta: payload.meta }

    // Create a new caller with context for this request
    const callerWithContext = createCallerFactory(appRouter)(ctx)

    // eslint-disable-next-line @typescript-eslint/ban-types
    return (callerWithContext[payload.procedureName as keyof typeof caller] as Function)?.(
      JSON.parse(payload.data)
    )
  })
}
