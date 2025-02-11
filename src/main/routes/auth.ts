import { TRPCError } from '@trpc/server'
import { publicProcedure, router } from '../trpc'
import { db } from '../db'
import { users } from '../db/schema'
import { eq } from 'drizzle-orm'
import { generateToken, hashPassword, loginSchema, registerSchema } from '../utils/auth'

export const authRouter = router({
  register: publicProcedure.input(registerSchema).mutation(async ({ input }) => {
    const existingUser = await db.query.users.findFirst({
      where: eq(users.username, input.username)
    })

    if (existingUser) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'Username already exists'
      })
    }

    const hashedPassword = hashPassword(input.password)

    const [user] = await db
      .insert(users)
      .values({
        username: input.username,
        password: hashedPassword,
        firstName: input.firstName,
        lastName: input.lastName
      })
      .returning({ id: users.id, username: users.username })

    const token = generateToken(user.id)

    return {
      user: {
        id: user.id,
        username: user.username
      },
      token
    }
  }),

  login: publicProcedure.input(loginSchema).mutation(async ({ input }) => {
    const user = await db.query.users.findFirst({
      where: eq(users.username, input.username)
    })

    if (!user || user.password !== hashPassword(input.password)) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Invalid username or password'
      })
    }

    const token = generateToken(user.id)

    return {
      user: {
        id: user.id,
        username: user.username
      },
      token
    }
  })
})
