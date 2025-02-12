import { router, protectedProcedure } from '../trpc'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { db } from '../db'
import { spents, users } from '../db/schema'
import { eq } from 'drizzle-orm'
import { RouterInput, RouterOutput } from '../router'

export type SpentInput = RouterInput['spents']['create']
export type SpentOutput = RouterOutput['spents']['create']

// Input validation schemas
const CreateSpentSchema = z.object({
  title: z.string().min(2).max(100),
  amount: z.number().positive(),
  note: z.string().optional()
})

const UpdateSpentSchema = z.object({
  id: z.number(),
  title: z.string().min(2).max(100).optional(),
  amount: z.number().positive().optional(),
  note: z.string().optional()
})

export const spentsRouter = router({
  // Get all spents
  getAll: protectedProcedure.query(async () => {
    try {
      const result = db
        .select({
          id: spents.id,
          title: spents.title,
          amount: spents.amount,
          note: spents.note,
          createdAt: spents.createdAt,
          updatedAt: spents.updatedAt,
          creator: {
            id: users.id,
            username: users.username
          }
        })
        .from(spents)
        .leftJoin(users, eq(spents.creatorId, users.id))
        .all()

      return result
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch spents'
      })
    }
  }),

  // Get spent by ID
  getById: protectedProcedure.input(z.number()).query(async ({ input: id }) => {
    try {
      const spent = db
        .select({
          id: spents.id,
          title: spents.title,
          amount: spents.amount,
          note: spents.note,
          createdAt: spents.createdAt,
          updatedAt: spents.updatedAt,
          creator: {
            id: users.id,
            username: users.username
          }
        })
        .from(spents)
        .leftJoin(users, eq(spents.creatorId, users.id))
        .where(eq(spents.id, id))
        .get()

      if (!spent) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Spent not found'
        })
      }

      return spent
    } catch (error) {
      if (error instanceof TRPCError) throw error
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch spent'
      })
    }
  }),

  // Create new spent
  create: protectedProcedure.input(CreateSpentSchema).mutation(async ({ input, ctx }) => {
    try {
      const newSpent = db
        .insert(spents)
        .values({
          ...input,
          creatorId: ctx.tokenPayload.userId
        })
        .returning()
        .get()

      return newSpent
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create spent'
      })
    }
  }),

  // Update spent
  update: protectedProcedure.input(UpdateSpentSchema).mutation(async ({ input, ctx }) => {
    try {
      const spent = db.select().from(spents).where(eq(spents.id, input.id)).get()

      if (!spent) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Spent not found'
        })
      }

      // Only creator or admin can update
      if (spent.creatorId !== ctx.tokenPayload.userId && ctx.tokenPayload.role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Not authorized to update this spent'
        })
      }

      const updatedSpent = db
        .update(spents)
        .set({
          ...input,
          updatedAt: new Date().toISOString()
        })
        .where(eq(spents.id, input.id))
        .returning()
        .get()

      return updatedSpent
    } catch (error) {
      if (error instanceof TRPCError) throw error
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update spent'
      })
    }
  }),

  // Delete spent
  delete: protectedProcedure.input(z.number()).mutation(async ({ input: id, ctx }) => {
    try {
      const spent = db.select().from(spents).where(eq(spents.id, id)).get()

      if (!spent) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Spent not found'
        })
      }

      // Only creator or admin can delete
      if (spent.creatorId !== ctx.tokenPayload.userId && ctx.tokenPayload.role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Not authorized to delete this spent'
        })
      }

      return db.delete(spents).where(eq(spents.id, id)).returning().get()
    } catch (error) {
      if (error instanceof TRPCError) throw error
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to delete spent'
      })
    }
  })
}) 