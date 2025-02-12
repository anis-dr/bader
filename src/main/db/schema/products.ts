import { sql } from 'drizzle-orm'
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'
import { categories } from './categories'

export const products = sqliteTable('products', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  price: real('price').notNull(),
  description: text('description'),
  image: text('image'),
  stockQuantity: integer('stockQuantity').notNull().default(0),
  trackStock: integer('trackStock', { mode: 'boolean' }).notNull().default(true),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
  categoryId: integer('categoryId').notNull().references(() => categories.id),
  createdAt: text('createdAt').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updatedAt').default(sql`CURRENT_TIMESTAMP`)
})

export type Product = typeof products.$inferSelect
export type NewProduct = typeof products.$inferInsert 