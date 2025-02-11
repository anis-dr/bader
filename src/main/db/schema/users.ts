import { sql } from 'drizzle-orm'
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  firstName: text('firstName'),
  lastName: text('lastName'),
  role: text('role').notNull().default('user'),
  active: integer('active').notNull().default(1),
  createdAt: text('createdAt').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updatedAt').default(sql`CURRENT_TIMESTAMP`)
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
