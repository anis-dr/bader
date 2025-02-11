import { t } from './trpc'
import { greetingRouter } from './routes/greeting'
import { authRouter } from './routes/auth'

export const appRouter = t.router({
  greeting: greetingRouter,
  auth: authRouter
})

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter
