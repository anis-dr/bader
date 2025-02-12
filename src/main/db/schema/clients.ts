import { sql } from 'drizzle-orm'
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'

export const clients = sqliteTable('clients', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  phone: text('phone'),
  address: text('address'),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('createdAt').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updatedAt').default(sql`CURRENT_TIMESTAMP`)
})

export type Client = typeof clients.$inferSelect
export type NewClient = typeof clients.$inferInsert 