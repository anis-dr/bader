import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import * as bcrypt from 'bcryptjs'
import { router, publicProcedure } from '../trpc'
import { users } from '../db/schema/users'
import { db } from '../db'
import { eq } from 'drizzle-orm'
import { generateToken } from '../utils/jwt'
import { RouterInput } from '../router'

const SALT_ROUNDS = 10

export type LoginInput = RouterInput['auth']['login']
export type RegisterInput = RouterInput['auth']['register']

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

      // Generate token
      const token = generateToken({
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
        token
      }
    }),

  login: publicProcedure
    .input(
      z.object({
        username: z.string(),
        password: z.string()
      })
    )
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

      // Generate token
      const token = generateToken({
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
        token
      }
    })
})
