import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { db, connection } from './config'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'
import { getMigrationsPath } from './migrations'
import * as bcrypt from 'bcryptjs'
import { initialPermissions, permissions } from './schema/permissions'

export async function initializeDatabase(): Promise<BetterSQLite3Database<typeof schema>> {
  try {
    // Get migrations path
    const migrationsFolder = getMigrationsPath()
    console.log('Running migrations from:', migrationsFolder)

    // Run migrations
    await migrate(db, { migrationsFolder })
    console.log('Database migrations completed successfully')

    // Check if permissions exist
    const existingPermissions = await db.select().from(permissions).limit(1).all()
    if (existingPermissions.length === 0) {
      console.log('Seeding permissions...')
      await db.insert(permissions).values(initialPermissions)
      console.log('Permissions seeded successfully')
    }

    // Create default admin user if no users exist
    const user = await db.select().from(schema.users).limit(1).all()
    if (user.length === 0) {
      console.log('Creating default admin user...')
      const hashedPassword = await bcrypt.hash('adminadmin01', 10)
      await db.insert(schema.users).values({
        username: 'admin',
        password: hashedPassword,
        role: 'admin',
        active: 1
      })
      console.log('Default admin user created')
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
