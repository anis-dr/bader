import { router } from '../trpc'
import { z } from 'zod'
import { publicProcedure } from '../trpc'

export const greetingRouter = router({
  hello: publicProcedure.input(z.object({ name: z.string() })).query(({ input, ctx }) => {
    // Access metadata from context
    const clientId = ctx.meta?.clientId
    const userAgent = ctx.meta?.headers?.['user-agent']

    return {
      message: `Hello, ${input.name}!`,
      clientInfo: {
        clientId,
        userAgent
      }
    }
  })
})
