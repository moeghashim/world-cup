import { readdir, readFile } from 'node:fs/promises'
import { neon } from '@neondatabase/serverless'

const connectionString = process.env.PRIMARY_DB_CONNECTION_STRING

if (!connectionString) {
  throw new Error('PRIMARY_DB_CONNECTION_STRING is required to apply schema')
}

const sql = neon(connectionString)
const migrations = (await readdir('db/migrations'))
  .filter((name) => name.endsWith('.sql'))
  .sort()

function isMissingColumnError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === '42703'
  )
}

function isKnownWorkosReplayNoop(migration: string, statement: string): boolean {
  return (
    migration === '002_auth0_provider.sql' &&
    statement.includes('alter column workos_user_id drop not null')
  )
}

for (const migration of migrations) {
  const migrationPath = `db/migrations/${migration}`
  const schema = await readFile(migrationPath, 'utf8')
  const statements = schema
    .split(';')
    .map((statement) => statement.trim())
    .filter(Boolean)

  for (const statement of statements) {
    try {
      await sql.query(statement, [])
    } catch (error) {
      if (
        isMissingColumnError(error) &&
        isKnownWorkosReplayNoop(migration, statement)
      ) {
        console.log(`Skipped known replay no-op in ${migration}`)
        continue
      }

      throw error
    }
  }

  console.log(`Applied ${migrationPath}`)
}
