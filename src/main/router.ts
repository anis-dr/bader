import { router } from './trpc'
import { greetingRouter } from './routes/greeting'
import { inferRouterInputs, inferRouterOutputs } from '@trpc/server'

export const appRouter = router({
  greeting: greetingRouter
})

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter
export type RouterInput = inferRouterInputs<AppRouter>
export type RouterOutput = inferRouterOutputs<AppRouter>
