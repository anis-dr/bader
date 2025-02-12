import { router, protectedProcedure } from '../trpc'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { db } from '../db'
import { orders, orderItems, products, users, clients } from '../db/schema'
import { eq, and, sql } from 'drizzle-orm'
import { RouterInput, RouterOutput } from '../router'

export type OrderInput = RouterInput['orders']['create']
export type OrderOutput = RouterOutput['orders']['create']

// Input validation schemas
const OrderItemSchema = z.object({
  productId: z.number(),
  quantity: z.number().int().positive(),
  price: z.number().positive()
})

const CreateOrderSchema = z.object({
  clientId: z.number(),
  creatorId: z.number(),
  total: z.number().positive(),
  amountPaid: z.number().min(0),
  change: z.number().default(0),
  status: z.enum(['completed', 'unpaid', 'cancelled']).default('completed'),
  note: z.string().optional(),
  isUnpaid: z.boolean().default(false),
  items: z.array(OrderItemSchema)
})

const UpdateOrderSchema = z.object({
  id: z.number(),
  amountPaid: z.number().min(0).optional(),
  status: z.enum(['completed', 'unpaid', 'cancelled']).optional(),
  note: z.string().optional(),
  isUnpaid: z.boolean().optional()
})

export const ordersRouter = router({
  // Get all orders with creator and client info
  getAll: protectedProcedure.query(async () => {
    try {
      const result = db
        .select({
          id: orders.id,
          total: orders.total,
          amountPaid: orders.amountPaid,
          change: orders.change,
          status: orders.status,
          note: orders.note,
          isUnpaid: orders.isUnpaid,
          createdAt: orders.createdAt,
          updatedAt: orders.updatedAt,
          creator: {
            id: users.id,
            name: sql<string>`coalesce(${users.firstName} || ' ' || ${users.lastName}, ${users.username})`.as('name')
          },
          client: {
            id: clients.id,
            name: clients.name
          }
        })
        .from(orders)
        .leftJoin(users, eq(orders.creatorId, users.id))
        .leftJoin(clients, eq(orders.clientId, clients.id))
        .all()

      return result
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch orders'
      })
    }
  }),

  // Get order by ID with its items and related info
  getById: protectedProcedure
    .input(z.number())
    .query(async ({ input: id }) => {
      try {
        const order = db
          .select({
            id: orders.id,
            total: orders.total,
            amountPaid: orders.amountPaid,
            change: orders.change,
            status: orders.status,
            note: orders.note,
            isUnpaid: orders.isUnpaid,
            createdAt: orders.createdAt,
            updatedAt: orders.updatedAt,
            creator: {
              id: users.id,
              name: sql<string>`coalesce(${users.firstName} || ' ' || ${users.lastName}, ${users.username})`.as('name')
            },
            client: {
              id: clients.id,
              name: clients.name
            }
          })
          .from(orders)
          .leftJoin(users, eq(orders.creatorId, users.id))
          .leftJoin(clients, eq(orders.clientId, clients.id))
          .where(eq(orders.id, id))
          .get()

        if (!order) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Order not found'
          })
        }

        const items = db
          .select({
            id: orderItems.id,
            quantity: orderItems.quantity,
            price: orderItems.price,
            product: {
              id: products.id,
              name: products.name
            }
          })
          .from(orderItems)
          .leftJoin(products, eq(orderItems.productId, products.id))
          .where(eq(orderItems.orderId, id))
          .all()

        return { ...order, items }
      } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch order'
        })
      }
    }),

  // Create new order
  create: protectedProcedure
    .input(CreateOrderSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        // Start a transaction
        return db.transaction(async (tx) => {
          // Create the order
          console.log({ctx})
          const newOrder = tx
            .insert(orders)
            .values({
              clientId: input.clientId,
              creatorId: input.creatorId,
              total: input.total,
              amountPaid: input.amountPaid,
              change: input.change,
              status: input.status,
              note: input.note,
              isUnpaid: input.isUnpaid
            })
            .returning()
            .get()

          // Create order items
          const orderItemsToInsert = input.items.map(item => ({
            orderId: newOrder.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price
          }))

          // Insert all order items
          const items = tx
            .insert(orderItems)
            .values(orderItemsToInsert)
            .returning()
            .all()

          // Update product stock quantities if tracking is enabled
          for (const item of input.items) {
            const product = tx
              .select()
              .from(products)
              .where(eq(products.id, item.productId))
              .get()

            if (product && product.trackStock) {
              tx.update(products)
                .set({
                  stockQuantity: product.stockQuantity - item.quantity,
                  updatedAt: new Date().toISOString()
                })
                .where(eq(products.id, item.productId))
                .run()
            }
          }

          return { ...newOrder, items }
        })
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create order'
        })
      }
    }),

  // Update order
  update: protectedProcedure
    .input(UpdateOrderSchema)
    .mutation(async ({ input }) => {
      try {
        const updatedOrder = db
          .update(orders)
          .set({
            ...input,
            updatedAt: new Date().toISOString()
          })
          .where(eq(orders.id, input.id))
          .returning()
          .get()

        if (!updatedOrder) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Order not found'
          })
        }

        return updatedOrder
      } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update order'
        })
      }
    }),

  // Cancel order
  cancel: protectedProcedure
    .input(z.object({ 
      id: z.number(),
      note: z.string().optional()
    }))
    .mutation(async ({ input }) => {
      try {
        return db.transaction(async (tx) => {
          // Get order items to restore stock
          const items = tx
            .select()
            .from(orderItems)
            .where(eq(orderItems.orderId, input.id))
            .all()

          // Restore product quantities
          for (const item of items) {
            const product = tx
              .select()
              .from(products)
              .where(eq(products.id, item.productId))
              .get()

            if (product && product.trackStock) {
              tx.update(products)
                .set({
                  stockQuantity: product.stockQuantity + item.quantity,
                  updatedAt: new Date().toISOString()
                })
                .where(eq(products.id, item.productId))
                .run()
            }
          }

          // Update order status
          const cancelledOrder = tx
            .update(orders)
            .set({
              status: 'cancelled',
              note: input.note,
              updatedAt: new Date().toISOString()
            })
            .where(eq(orders.id, input.id))
            .returning()
            .get()

          if (!cancelledOrder) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Order not found'
            })
          }

          return cancelledOrder
        })
      } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to cancel order'
        })
      }
    })
}) 