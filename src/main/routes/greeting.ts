import { router } from '../trpc'
import { z } from 'zod'
import { publicProcedure } from '../trpc'

export const greetingRouter = router({
  hello: publicProcedure.input(z.object({ name: z.string() })).query(({ input }) => {
    return `Hello, ${input.name}!`
  }),
  bader: publicProcedure.query(() => {
    return 'bader'
  })
})
