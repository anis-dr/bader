import { router, protectedProcedure } from '../trpc'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { db } from '../db'
import { clients } from '../db/schema'
import { eq } from 'drizzle-orm'
import { RouterInput, RouterOutput } from '../router'

export type ClientInput = RouterInput['clients']['create']
export type ClientOutput = RouterOutput['clients']['create']

// Input validation schemas
const CreateClientSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().optional(),
  address: z.string().optional(),
  active: z.boolean().default(true)
})

const UpdateClientSchema = z.object({
  id: z.number(),
  name: z.string().min(2).max(100).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  active: z.boolean().optional()
})

export const clientsRouter = router({
  // Get all active clients
  getAll: protectedProcedure.query(async () => {
    try {
      const result = db
        .select()
        .from(clients)
        .where(eq(clients.active, true))
        .all()
      return result
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch clients'
      })
    }
  }),

  // Get a single client by ID
  getById: protectedProcedure
    .input(z.number())
    .query(async ({ input: id }) => {
      const client = db
        .select()
        .from(clients)
        .where(eq(clients.id, id))
        .get()

      if (!client) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Client not found'
        })
      }

      return client
    }),

  // Create a new client
  create: protectedProcedure
    .input(CreateClientSchema)
    .mutation(async ({ input }) => {
      try {
        // Create new client
        const newClient = db
          .insert(clients)
          .values({
            name: input.name,
            phone: input.phone,
            address: input.address,
            active: input.active
          })
          .returning()
          .get()

        return newClient
      } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create client'
        })
      }
    }),

  // Update a client
  update: protectedProcedure
    .input(UpdateClientSchema)
    .mutation(async ({ input }) => {
      try {
        // Check if client exists
        const existing = db
          .select()
          .from(clients)
          .where(eq(clients.id, input.id))
          .get()

        if (!existing) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Client not found'
          })
        }

        // Update client
        const updatedClient = db
          .update(clients)
          .set({
            ...input,
            updatedAt: new Date().toISOString()
          })
          .where(eq(clients.id, input.id))
          .returning()
          .get()

        return updatedClient
      } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update client'
        })
      }
    }),

  // Delete (soft delete) a client
  delete: protectedProcedure
    .input(z.number())
    .mutation(async ({ input: id }) => {
      try {
        // Soft delete by setting active to false
        const deletedClient = db
          .update(clients)
          .set({
            active: false,
            updatedAt: new Date().toISOString()
          })
          .where(eq(clients.id, id))
          .returning()
          .get()

        if (!deletedClient) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Client not found'
          })
        }

        return deletedClient
      } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete client'
        })
      }
    }),

  // Restore a soft-deleted client
  restore: protectedProcedure
    .input(z.number())
    .mutation(async ({ input: id }) => {
      try {
        const restoredClient = db
          .update(clients)
          .set({
            active: true,
            updatedAt: new Date().toISOString()
          })
          .where(eq(clients.id, id))
          .returning()
          .get()

        if (!restoredClient) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Client not found'
          })
        }

        return restoredClient
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to restore client'
        })
      }
    })
})
