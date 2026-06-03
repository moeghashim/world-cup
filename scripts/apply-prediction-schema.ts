/// <reference types="node" />

import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { neon } from '@neondatabase/serverless'

const schemaPath = resolve('db/schema.sql')
const connectionString = process.env.PRIMARY_DB_CONNECTION_STRING

function getExecutableStatements(schemaSql: string) {
  return schemaSql
    .split(';')
    .map((statement) => statement.trim())
    .filter((statement) =>
      statement
        .replaceAll(/^--.*$/gm, '')
        .replaceAll(/\s/g, '')
        .trim(),
    )
}

if (!connectionString) {
  console.error(
    'PRIMARY_DB_CONNECTION_STRING is required to apply the prediction schema.',
  )
  process.exit(1)
}

const sql = neon(connectionString)
const schemaSql = await readFile(schemaPath, 'utf8')
const statements = getExecutableStatements(schemaSql)

for (const statement of statements) {
  await sql.query(statement)
}

console.log(
  JSON.stringify(
    {
      applied: true,
      schema: 'db/schema.sql',
      statements: statements.length,
    },
    null,
    2,
  ),
)
