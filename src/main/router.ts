import { z } from 'zod'
import { router, publicProcedure } from './trpc'

const greetingRouter = router({
  hello: publicProcedure.input(z.object({ name: z.string() })).query(({ input }) => {
    return `Hello, ${input.name}!`
  })
})

export const appRouter = router({
  greeting: greetingRouter
})

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter
