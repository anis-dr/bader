import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { db, connection } from './config'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'
import { getMigrationsPath } from './migrations'

export async function initializeDatabase(): Promise<BetterSQLite3Database<typeof schema>> {
  try {
    const migrationsFolder = getMigrationsPath()
    console.log('Running migrations from:', migrationsFolder)

    migrate(db, { migrationsFolder })
    console.log('Database migrations completed successfully')

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
