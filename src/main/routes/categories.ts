import { router, protectedProcedure } from '../trpc'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { db } from '../db'
import { categories } from '../db/schema'
import { eq } from 'drizzle-orm'
import { RouterInput, RouterOutput } from '../router'
import { hasPermission } from '../middlewares/permissions'

export type CategoryInput = RouterInput['categories']['create']
export type CategoryOutput = RouterOutput['categories']['create']

// Input validation schemas
const CreateCategorySchema = z.object({
  name: z.string().min(2).max(50),
  description: z.string().optional(),
  active: z.boolean().default(true)
})

const UpdateCategorySchema = z.object({
  id: z.number(),
  name: z.string().min(2).max(50).optional(),
  description: z.string().optional(),
  active: z.boolean().optional()
})

export const categoriesRouter = router({
  // Get all categories
  getAll: hasPermission('categories.view')
    .query(async () => {
      try {
        const result = db.select().from(categories).where(eq(categories.active, true)).all()
        return result
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch categories'
        })
      }
    }),

  // Get a single category by ID
  getById: protectedProcedure.input(z.number()).query(async ({ input: id }) => {
    const category = db.select().from(categories).where(eq(categories.id, id)).get()

    if (!category) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Category not found'
      })
    }

    return category
  }),

  // Create a new category
  create: hasPermission('categories.create')
    .input(CreateCategorySchema)
    .mutation(async ({ input, ctx }) => {
      // Check if user has admin role
      if (ctx.tokenPayload.role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only admins can create categories'
        })
      }

      try {
        // Check if category with same name exists
        const existing = db.select().from(categories).where(eq(categories.name, input.name)).get()

        if (existing) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Category with this name already exists'
          })
        }

        // Create new category
        const newCategory = db
          .insert(categories)
          .values({
            name: input.name,
            description: input.description,
            active: input.active
          })
          .returning()
          .get()

        return newCategory
      } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create category'
        })
      }
    }),

  // Update a category
  update: hasPermission('categories.edit')
    .input(UpdateCategorySchema)
    .mutation(async ({ input, ctx }) => {
      // Check if user has admin role
      if (ctx.tokenPayload.role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only admins can update categories'
        })
      }

      try {
        // Check if category exists
        const existing = db.select().from(categories).where(eq(categories.id, input.id)).get()

        if (!existing) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Category not found'
          })
        }

        // If name is being updated, check for duplicates
        if (input.name && input.name !== existing.name) {
          const nameExists = db.select().from(categories).where(eq(categories.name, input.name)).get()

          if (nameExists) {
            throw new TRPCError({
              code: 'CONFLICT',
              message: 'Category with this name already exists'
            })
          }
        }

        // Update category
        const updatedCategory = db
          .update(categories)
          .set({
            ...input
          })
          .where(eq(categories.id, input.id))
          .returning()
          .get()

        return updatedCategory
      } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update category'
        })
      }
    }),

  // Delete (soft delete) a category
  delete: hasPermission('categories.delete')
    .input(z.number())
    .mutation(async ({ input: id, ctx }) => {
      // Check if user has admin role
      if (ctx.tokenPayload?.role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only admins can delete categories'
        })
      }

      try {
        // Soft delete by setting active to false
        const deletedCategory = db
          .update(categories)
          .set({
            active: false,
            updatedAt: new Date().toISOString()
          })
          .where(eq(categories.id, id))
          .returning()
          .get()

        if (!deletedCategory) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Category not found'
          })
        }

        return deletedCategory
      } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete category'
        })
      }
    }),

  // Restore a soft-deleted category
  restore: protectedProcedure.input(z.number()).mutation(async ({ input: id, ctx }) => {
    // Check if user has admin role
    if (ctx.tokenPayload?.role !== 'admin') {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Only admins can restore categories'
      })
    }

    try {
      const restoredCategory = db
        .update(categories)
        .set({
          active: true,
          updatedAt: new Date().toISOString()
        })
        .where(eq(categories.id, id))
        .returning()
        .get()

      if (!restoredCategory) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Category not found'
        })
      }

      return restoredCategory
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to restore category'
      })
    }
  })
})
