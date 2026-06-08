import { readFile } from 'node:fs/promises'
import { neon } from '@neondatabase/serverless'

const connectionString = process.env.PRIMARY_DB_CONNECTION_STRING

if (!connectionString) {
  throw new Error('PRIMARY_DB_CONNECTION_STRING is required to apply schema')
}

const sql = neon(connectionString)
const schema = await readFile('db/migrations/001_accounts_persistence.sql', 'utf8')

const statements = schema
  .split(';')
  .map((statement) => statement.trim())
  .filter(Boolean)

for (const statement of statements) {
  await sql.query(statement, [])
}

console.log('Applied db/migrations/001_accounts_persistence.sql')
