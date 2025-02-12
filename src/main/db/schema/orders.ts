import { sql } from 'drizzle-orm'
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'
import { users } from './users'
import { clients } from './clients'
import { products } from './products'

export const orders = sqliteTable('orders', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  total: real('total').notNull(),
  amountPaid: real('amountPaid').notNull().default(0),
  change: real('change').notNull().default(0),
  status: text('status')
    .notNull()
    .default('completed')
    .$type<'completed' | 'unpaid' | 'cancelled'>(),
  note: text('note'),
  isUnpaid: integer('isUnpaid', { mode: 'boolean' }).notNull().default(false),
  creatorId: integer('creatorId')
    .notNull()
    .references(() => users.id),
  clientId: integer('clientId')
    .notNull()
    .references(() => clients.id),
  createdAt: text('createdAt').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updatedAt').default(sql`CURRENT_TIMESTAMP`)
})

export const orderItems = sqliteTable('order_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  quantity: integer('quantity').notNull(),
  price: real('price').notNull(),
  orderId: integer('orderId')
    .notNull()
    .references(() => orders.id),
  productId: integer('productId')
    .notNull()
    .references(() => products.id, { onDelete: 'cascade' }),
  createdAt: text('createdAt').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updatedAt').default(sql`CURRENT_TIMESTAMP`)
})

export type Order = typeof orders.$inferSelect
export type NewOrder = typeof orders.$inferInsert
export type OrderItem = typeof orderItems.$inferSelect
export type NewOrderItem = typeof orderItems.$inferInsert
