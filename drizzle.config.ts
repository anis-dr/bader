import type { Config } from 'drizzle-kit'
import { join } from 'path'

// For drizzle studio, we'll use a local database file
const dbPath = join(process.cwd(), 'database.db')

export default {
  schema: './src/main/db/schema.ts',
  out: './src/main/db/migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: dbPath
  },
  verbose: true,
  strict: true
} satisfies Config
