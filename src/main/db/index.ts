import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { db, connection } from './config'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'
import { getMigrationsPath } from './migrations'
import * as bcrypt from 'bcryptjs'

export async function initializeDatabase(): Promise<BetterSQLite3Database<typeof schema>> {
  try {
    const migrationsFolder = getMigrationsPath()
    console.log('Running migrations from:', migrationsFolder)

    migrate(db, { migrationsFolder })
    console.log('Database migrations completed successfully')

    const user = await db.select().from(schema.users).limit(1)
    if (user.length === 0) {
      const hashedPassword = await bcrypt.hash('adminadmin01', 10)
      await db.insert(schema.users).values({
        username: 'admin',
        password: hashedPassword,
        role: 'admin',
        active: 1
      })
    } else {
      console.log('Default user already exists')
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
