import { router } from './trpc'
import { greetingRouter } from './routes/greeting'

export const appRouter = router({
  greeting: greetingRouter
})

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter
