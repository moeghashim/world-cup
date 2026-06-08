type RequiredEnvName =
  | 'PRIMARY_DB_CONNECTION_STRING'
  | 'AUTH0_CLIENT_ID'
  | 'AUTH0_CLIENT_SECRET'
  | 'AUTH0_COOKIE_SECRET'
  | 'AUTH0_DOMAIN'

export function getRequiredEnv(name: RequiredEnvName): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

export function getOptionalEnv(name: string): string | undefined {
  const value = process.env[name]
  return value || undefined
}
