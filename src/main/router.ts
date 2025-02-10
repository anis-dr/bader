import { router } from './trpc'
import { greetingRouter } from './routes/greeting'
import { messagesRouter } from './routes/messages'

export const appRouter = router({
  greeting: greetingRouter,
  messages: messagesRouter
})

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter
