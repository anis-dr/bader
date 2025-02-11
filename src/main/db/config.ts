import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { join } from 'path'
import { app } from 'electron'
import type { Database as DatabaseType } from 'better-sqlite3'
import * as schema from './schema'

// Get the user data path for the database
const dbPath = app.isPackaged
  ? join(app.getPath('userData'), 'database.db')
  : join(process.cwd(), 'database.db')

// Create SQLite database connection
const sqlite = new Database(dbPath)

// Create drizzle database instance with schema
export const db = drizzle(sqlite, { schema })

// Export the raw sqlite connection for migrations
export const connection: DatabaseType = sqlite
