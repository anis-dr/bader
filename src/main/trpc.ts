import { initTRPC, TRPCError } from '@trpc/server'
import { ipcMain } from 'electron'
import type { TrpcEvent } from '../preload/index.d'
import type { AppRouter } from './router'
import { verifyAccessToken } from './utils/jwt'

export interface Context {
  meta?: {
    headers?: Record<string, string>
    clientId?: string
  }
  user?: {
    id: number
    username: string
    role: string
  }
}

/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
const t = initTRPC.context<Context>().create({ isServer: true })

/**
 * Middleware to check authentication
 */
const isAuthed = t.middleware(async ({ ctx, next }) => {
  const authHeader = ctx.meta?.headers?.authorization

  if (!authHeader) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Missing authorization header'
    })
  }

  const token = authHeader.split(' ')[1]
  if (!token) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Invalid authorization header'
    })
  }

  try {
    const user = verifyAccessToken(token)
    return next({
      ctx: {
        ...ctx,
        user
      }
    })
  } catch (error) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Invalid or expired token'
    })
  }
})

/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
export const router = t.router
export const publicProcedure = t.procedure
export const protectedProcedure = t.procedure.use(isAuthed)
export const createCallerFactory = t.createCallerFactory

export function registerTrpcIpcListener(appRouter: AppRouter) {
  ipcMain.handle('trpc', async (_, payload: TrpcEvent) => {
    try {
      // Create context with metadata
      const ctx: Context = { meta: payload.meta }

      // Create a caller with context for this request
      const caller = createCallerFactory(appRouter)(ctx)

      // Parse the input data
      const inputData = payload.data ? JSON.parse(payload.data) : undefined
      if (typeof caller[payload.procedureName] === 'function') {
        const result = await caller[payload.procedureName](inputData)
        return result
      } else {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Procedure ${payload.procedureName} does not exist or is not callable`
        })
      }
    } catch (error) {
      console.error('TRPC Error:', error)
      throw error
    }
  })
}
