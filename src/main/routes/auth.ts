import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import * as bcrypt from 'bcryptjs'
import { router, publicProcedure } from '../trpc'
import { users } from '../db/schema/users'
import { db } from '../db'
import { eq } from 'drizzle-orm'
import { generateTokens, verifyRefreshToken } from '../utils/jwt'
import { RouterInput } from '../router'

const SALT_ROUNDS = 10

export type LoginInput = RouterInput['auth']['login']
export type RegisterInput = RouterInput['auth']['register']

const AuthOutputSchema = z.object({
  user: z.object({
    id: z.number(),
    username: z.string(),
    firstName: z.string().optional().nullable(),
    lastName: z.string().optional().nullable(),
    role: z.string()
  }),
  tokens: z.object({
    accessToken: z.string(),
    refreshToken: z.string()
  })
})

export type AuthOutput = z.infer<typeof AuthOutputSchema>

export const authRouter = router({
  register: publicProcedure
    .input(
      z.object({
        username: z.string().min(3).max(50),
        password: z.string().min(6),
        firstName: z.string().optional(),
        lastName: z.string().optional()
      })
    )
    .output(AuthOutputSchema)
    .mutation(async ({ input }) => {
      // Check if user already exists
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.username, input.username))
        .get()

      if (existingUser) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Username already exists'
        })
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS)

      // Create new user
      const newUser = await db
        .insert(users)
        .values({
          username: input.username,
          password: hashedPassword,
          ...(input.firstName && { firstName: input.firstName }),
          ...(input.lastName && { lastName: input.lastName })
        })
        .returning()
        .get()

      // Generate tokens
      const tokens = generateTokens({
        userId: newUser.id,
        username: newUser.username,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role
      })

      return {
        user: {
          id: newUser.id,
          username: newUser.username,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          role: newUser.role
        },
        tokens
      }
    }),

  login: publicProcedure
    .input(
      z.object({
        username: z.string(),
        password: z.string()
      })
    )
    .output(AuthOutputSchema)
    .mutation(async ({ input }) => {
      // Find user
      const user = await db.select().from(users).where(eq(users.username, input.username)).get()

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found'
        })
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(input.password, user.password)

      if (!isValidPassword) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid password'
        })
      }

      // Generate tokens
      const tokens = generateTokens({
        userId: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      })

      return {
        user: {
          id: user.id,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        },
        tokens
      }
    }),

  refresh: publicProcedure
    .input(z.object({ refreshToken: z.string() }))
    .output(z.object({ accessToken: z.string() }))
    .mutation(async ({ input }) => {
      const { userId } = verifyRefreshToken(input.refreshToken)

      const user = await db.select().from(users).where(eq(users.id, userId)).get()

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found'
        })
      }

      const tokens = generateTokens({
        userId: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      })

      return { accessToken: tokens.accessToken }
    })
})
