import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { db, connection } from './config'
import { join } from 'path'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import { app } from 'electron'
import * as schema from './schema'

export async function initializeDatabase(): Promise<BetterSQLite3Database<typeof schema>> {
  try {
    // Determine the correct migrations path based on the environment
    const isDev = !app.isPackaged
    const migrationsFolder = isDev
      ? join(process.cwd(), 'src/main/db/migrations')
      : join(process.resourcesPath, 'src/main/db/migrations')

    try {
      console.log('Running migrations from:', migrationsFolder)
      await migrate(db, { migrationsFolder })
      console.log('Database migrations completed successfully')
    } catch (migrateError) {
      console.error('Migration failed:', migrateError)
    }

    return db
  } catch (error) {
    console.error('Failed to initialize database:', error)
    throw error
  }
}

// Export the database instance
export { db }

// Cleanup function to be called when the app is closing
export function closeDatabase(): void {
  connection.close()
}
