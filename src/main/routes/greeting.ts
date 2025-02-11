import { router } from '../trpc'
import { z } from 'zod'
import { publicProcedure, protectedProcedure } from '../trpc'
import { RouterInput, RouterOutput } from '../router'

export type UserMeOutput = RouterOutput['greeting']['hello']
export type UserMeInput = RouterInput['greeting']['hello']

export const greetingRouter = router({
  hello: publicProcedure.input(z.string().optional()).query(({ input }) => {
    return `Hello ${input ?? 'World'}!`
  }),

  // Protected greeting that includes user info
  personalGreeting: protectedProcedure.query(({ ctx }) => {
    return `Hello ${ctx.user?.firstName || ctx.user?.username}! Your role is: ${ctx.user?.role}`
  }),

  // Protected greeting with input
  customGreeting: protectedProcedure
    .input(
      z.object({
        message: z.string()
      })
    )
    .mutation(({ ctx, input }) => {
      return {
        message: `${input.message}, ${ctx.user?.username}!`,
        timestamp: new Date().toISOString()
      }
    })
})
