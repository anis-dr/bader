import { router, protectedProcedure } from '../trpc'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { db } from '../db'
import { products, categories } from '../db/schema'
import { eq, and } from 'drizzle-orm'
import { RouterInput, RouterOutput } from '../router'

export type ProductInput = RouterInput['products']['create']
export type ProductOutput = RouterOutput['products']['create']

// Input validation schemas
const CreateProductSchema = z.object({
  name: z.string().min(2).max(100),
  price: z.number().positive(),
  description: z.string().optional(),
  image: z.string().optional(),
  stockQuantity: z.number().int().min(0).default(0),
  trackStock: z.boolean().default(true),
  active: z.boolean().default(true),
  categoryId: z.number()
})

const UpdateProductSchema = z.object({
  id: z.number(),
  name: z.string().min(2).max(100).optional(),
  price: z.number().positive().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  stockQuantity: z.number().int().min(0).optional(),
  trackStock: z.boolean().optional(),
  active: z.boolean().optional(),
  categoryId: z.number().optional()
})

export const productsRouter = router({
  // Get all active products
  getAll: protectedProcedure.query(async () => {
    try {
      const result = db
        .select({
          id: products.id,
          name: products.name,
          price: products.price,
          description: products.description,
          image: products.image,
          stockQuantity: products.stockQuantity,
          trackStock: products.trackStock,
          categoryId: products.categoryId,
          createdAt: products.createdAt,
          updatedAt: products.updatedAt,
          category: {
            id: categories.id,
            name: categories.name
          }
        })
        .from(products)
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .all()

      return result
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch products'
      })
    }
  }),

  // Get products by category
  getByCategory: protectedProcedure.input(z.number()).query(async ({ input: categoryId }) => {
    try {
      const result = db
        .select()
        .from(products)
        .where(and(eq(products.categoryId, categoryId), eq(products.active, true)))
        .all()
      return result
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch products by category'
      })
    }
  }),

  // Get a single product by ID
  getById: protectedProcedure.input(z.number()).query(async ({ input: id }) => {
    const product = db.select().from(products).where(eq(products.id, id)).get()

    if (!product) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Product not found'
      })
    }

    return product
  }),

  // Create a new product
  create: protectedProcedure.input(CreateProductSchema).mutation(async ({ input, ctx }) => {
    // Check if user has admin role
    //if (ctx.tokenPayload?.role !== 'admin') {
    //  throw new TRPCError({
    //    code: 'FORBIDDEN',
    //    message: 'Only admins can create products'
    //  })
    //}

    try {
      // Check if category exists
      const category = db.select().from(categories).where(eq(categories.id, input.categoryId)).get()

      if (!category) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid category ID'
        })
      }

      // Create new product
      const newProduct = db
        .insert(products)
        .values({
          name: input.name,
          price: input.price,
          description: input.description,
          image: input.image,
          stockQuantity: input.stockQuantity,
          trackStock: input.trackStock,
          active: input.active,
          categoryId: input.categoryId
        })
        .returning()
        .get()

      return newProduct
    } catch (error) {
      if (error instanceof TRPCError) throw error
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create product'
      })
    }
  }),

  // Update a product
  update: protectedProcedure.input(UpdateProductSchema).mutation(async ({ input, ctx }) => {
    // Check if user has admin role
    if (ctx.tokenPayload?.role !== 'admin') {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Only admins can update products'
      })
    }

    try {
      // Check if product exists
      const existing = db.select().from(products).where(eq(products.id, input.id)).get()

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Product not found'
        })
      }

      // If categoryId is being updated, check if the new category exists
      if (input.categoryId) {
        const category = db
          .select()
          .from(categories)
          .where(eq(categories.id, input.categoryId))
          .get()

        if (!category) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Invalid category ID'
          })
        }
      }

      // Update product
      const updatedProduct = db
        .update(products)
        .set({
          ...input,
          updatedAt: new Date().toISOString()
        })
        .where(eq(products.id, input.id))
        .returning()
        .get()

      return updatedProduct
    } catch (error) {
      if (error instanceof TRPCError) throw error
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update product'
      })
    }
  }),

  // Delete (soft delete) a product
  delete: protectedProcedure.input(z.number()).mutation(async ({ input: id, ctx }) => {
    // Check if user has admin role
    if (ctx.tokenPayload?.role !== 'admin') {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Only admins can delete products'
      })
    }

    try {
      const deletedProduct = db.delete(products).where(eq(products.id, id)).returning().get()

      if (!deletedProduct) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Product not found'
        })
      }

      return deletedProduct
    } catch (error) {
      if (error instanceof TRPCError) throw error
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to delete product'
      })
    }
  }),

  // Restore a soft-deleted product
  restore: protectedProcedure.input(z.number()).mutation(async ({ input: id, ctx }) => {
    // Check if user has admin role
    if (ctx.tokenPayload?.role !== 'admin') {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Only admins can restore products'
      })
    }

    try {
      const restoredProduct = db
        .update(products)
        .set({
          active: true,
          updatedAt: new Date().toISOString()
        })
        .where(eq(products.id, id))
        .returning()
        .get()

      if (!restoredProduct) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Product not found'
        })
      }

      return restoredProduct
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to restore product'
      })
    }
  }),

  // Update stock quantity
  updateStock: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        quantity: z.number().int()
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Check if user has admin role
      if (ctx.tokenPayload?.role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only admins can update stock'
        })
      }

      try {
        const product = db.select().from(products).where(eq(products.id, input.id)).get()

        if (!product) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Product not found'
          })
        }

        if (!product.trackStock) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Stock tracking is disabled for this product'
          })
        }

        const updatedProduct = db
          .update(products)
          .set({
            stockQuantity: input.quantity,
            updatedAt: new Date().toISOString()
          })
          .where(eq(products.id, input.id))
          .returning()
          .get()

        return updatedProduct
      } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update stock'
        })
      }
    })
})
