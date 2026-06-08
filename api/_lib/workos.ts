import { WorkOS } from '@workos-inc/node'
import { getRequiredEnv } from './env.js'

let workos: WorkOS | undefined

export function getWorkOS(): WorkOS {
  workos ??= new WorkOS(getRequiredEnv('WORKOS_API_KEY'), {
    clientId: getRequiredEnv('WORKOS_CLIENT_ID'),
  })
  return workos
}

export function getWorkOSClientId(): string {
  return getRequiredEnv('WORKOS_CLIENT_ID')
}

export function getWorkOSCookiePassword(): string {
  return getRequiredEnv('WORKOS_COOKIE_PASSWORD')
}

