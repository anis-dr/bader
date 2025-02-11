import { join } from 'path'
import { app } from 'electron'
import { existsSync } from 'fs'

interface MigrationPaths {
  dev: string
  prod: string[]
}

const MIGRATION_PATHS: MigrationPaths = {
  dev: join(process.cwd(), 'src/main/db/migrations'),
  prod: [
    // Primary location in extraResources
    join(process.resourcesPath, 'database/migrations'),
    // Fallback locations
    join(process.resourcesPath, 'app.asar.unpacked/resources/database/migrations'),
    join(app.getAppPath(), '..', 'database/migrations')
  ]
}

export function getMigrationsPath(): string {
  const isDev = !app.isPackaged

  if (isDev) {
    return MIGRATION_PATHS.dev
  }

  const validPath = MIGRATION_PATHS.prod.find((path) => {
    const hasMetaFolder = existsSync(join(path, 'meta'))
    const hasJournalFile = existsSync(join(path, 'meta', '_journal.json'))
    return hasMetaFolder && hasJournalFile
  })

  if (!validPath) {
    throw new Error(
      'Could not find valid migrations folder. Checked paths:\n' + MIGRATION_PATHS.prod.join('\n')
    )
  }

  return validPath
}
