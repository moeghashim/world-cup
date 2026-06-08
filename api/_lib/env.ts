type RequiredEnvName =
  | 'PRIMARY_DB_CONNECTION_STRING'
  | 'WORKOS_API_KEY'
  | 'WORKOS_CLIENT_ID'
  | 'WORKOS_COOKIE_PASSWORD'

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
