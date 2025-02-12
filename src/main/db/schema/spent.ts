import { integer, text, real } from 'drizzle-orm/sqlite-core'
import { sqliteTable } from 'drizzle-orm/sqlite-core'
import { users } from './users'

export const spents = sqliteTable('spents', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  amount: real('amount').notNull(),
  note: text('note'),
  creatorId: integer('creator_id').notNull().references(() => users.id),
  createdAt: text('created_at').notNull().default(new Date().toISOString()),
  updatedAt: text('updated_at').notNull().default(new Date().toISOString())
})

export type Spent = typeof spents.$inferSelect
export type NewSpent = typeof spents.$inferInsert 