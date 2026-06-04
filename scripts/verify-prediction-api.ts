/// <reference types="node" />

import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { neon } from '@neondatabase/serverless'
import matchPrizeBundlesHandler from '../api/match-prize-bundles'
import predictionEntriesHandler from '../api/prediction-entries'

type ApiRequest = {
  body?: unknown
  method?: string
  query?: Record<string, string | string[]>
}

type ApiResponse = {
  json: (body: unknown) => void
  setHeader: (name: string, value: string) => void
  status: (code: number) => ApiResponse
}

type ApiHandler = (request: ApiRequest, response: ApiResponse) => Promise<void> | void

type BundleResponse = {
  bundles: Array<{
    fixture: {
      away: string
      home: string
      matchNumber: number
    }
    prizeBundle: {
      id: string
      sponsorCampaignId: string
    }
  }>
}

type EntryResponse = {
  joinedCount: number
  participantEmail: string
  persisted: boolean
  persistenceMode: string
  predictedOutcome: string
  receiptHash: string
  receiptId: string
}

type VerificationMode = 'dev' | 'fallback' | 'persisted' | 'remote' | 'vercel'

const mode = (process.argv[2] ?? 'fallback') as VerificationMode
const originalConnectionString = process.env.PRIMARY_DB_CONNECTION_STRING
const apiBaseUrl = (
  mode === 'dev'
    ? (process.env.PREDICTION_API_BASE_URL ?? 'http://127.0.0.1:5173')
    : process.env.PREDICTION_API_BASE_URL
)?.replace(/\/$/, '')
const vercelProtectionBypassSecret = process.env.VERCEL_PROTECTION_BYPASS_SECRET
const execFileAsync = promisify(execFile)

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message)
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

async function invokeHandler(handler: ApiHandler, request: ApiRequest) {
  let statusCode = 200
  const headers: Record<string, string> = {}
  let body: unknown

  const response: ApiResponse = {
    json(responseBody: unknown) {
      body = responseBody
    },
    setHeader(name: string, value: string) {
      headers[name] = value
    },
    status(code: number) {
      statusCode = code
      return response
    },
  }

  await handler(request, response)

  return { body, headers, statusCode }
}

async function getFirstBundle() {
  if (mode === 'dev' || mode === 'remote' || mode === 'vercel') {
    assert(
      apiBaseUrl,
      'PREDICTION_API_BASE_URL is required for HTTP verification.',
    )

    const { body, statusCode } = await fetchJson<BundleResponse>(
      `${apiBaseUrl}/api/match-prize-bundles?limit=1`,
      'Remote prize bundle endpoint',
    )

    assert(statusCode === 200, 'Remote prize bundle endpoint did not return 200.')
    assert(body.bundles[0], 'Remote prize bundle endpoint returned no bundles.')

    return body.bundles[0]
  }

  const result = await invokeHandler(matchPrizeBundlesHandler, {
    method: 'GET',
    query: { limit: '1' },
  })

  assert(result.statusCode === 200, 'Prize bundle endpoint did not return 200.')
  assert(isObject(result.body), 'Prize bundle endpoint returned a non-object body.')

  const body = result.body as BundleResponse
  const firstBundle = body.bundles[0]

  assert(firstBundle, 'Prize bundle endpoint returned no bundles.')

  return firstBundle
}

async function fetchJson<ResponseBody>(
  url: string,
  label: string,
  init?: RequestInit,
) {
  if (mode === 'vercel') {
    return fetchVercelJson<ResponseBody>(url, label, init)
  }

  const headers = new Headers(init?.headers)

  if (vercelProtectionBypassSecret) {
    headers.set('x-vercel-protection-bypass', vercelProtectionBypassSecret)
  }

  const response = await fetch(url, {
    ...init,
    headers,
  })
  const responseText = await response.text()

  try {
    return {
      body: JSON.parse(responseText) as ResponseBody,
      statusCode: response.status,
    }
  } catch {
    throw new Error(
      `${label} returned non-JSON content. The deployment may be protected; set VERCEL_PROTECTION_BYPASS_SECRET if available.`,
    )
  }
}

function parseVercelCurlResult<ResponseBody>(output: string, label: string) {
  const statusMatch = output.match(/__HTTP_STATUS__:(\d{3})\s*$/)
  const statusCode = statusMatch ? Number(statusMatch[1]) : 200
  const outputWithoutStatus = output.replace(/\n?__HTTP_STATUS__:\d{3}\s*$/, '')
  const jsonLine = outputWithoutStatus
    .trim()
    .split(/\r?\n/)
    .reverse()
    .find((line) => line.trim().startsWith('{') || line.trim().startsWith('['))

  assert(jsonLine, `${label} did not return a JSON line through vercel curl.`)

  return {
    body: JSON.parse(jsonLine) as ResponseBody,
    statusCode,
  }
}

async function fetchVercelJson<ResponseBody>(
  url: string,
  label: string,
  init?: RequestInit,
) {
  assert(
    apiBaseUrl,
    'PREDICTION_API_BASE_URL is required for Vercel verification.',
  )

  const requestUrl = new URL(url)
  const path = `${requestUrl.pathname}${requestUrl.search}`
  const curlArgs = [
    'vercel',
    'curl',
    path,
    '--deployment',
    apiBaseUrl,
    '--',
    '--silent',
    '--show-error',
    '--write-out',
    '\\n__HTTP_STATUS__:%{http_code}',
  ]
  const headers = new Headers(init?.headers)

  if (init?.method) {
    curlArgs.push('--request', init.method)
  }

  for (const [name, value] of headers.entries()) {
    curlArgs.push('--header', `${name}: ${value}`)
  }

  if (typeof init?.body === 'string') {
    curlArgs.push('--data', init.body)
  }

  const { stdout } = await execFileAsync('npx', curlArgs, {
    maxBuffer: 1024 * 1024 * 5,
  })

  return parseVercelCurlResult<ResponseBody>(String(stdout), label)
}

async function submitEntry(payload: Record<string, unknown>) {
  if (mode === 'dev' || mode === 'remote' || mode === 'vercel') {
    assert(
      apiBaseUrl,
      'PREDICTION_API_BASE_URL is required for HTTP verification.',
    )

    const { body, statusCode } = await fetchJson<EntryResponse>(
      `${apiBaseUrl}/api/prediction-entries`,
      'Remote prediction entry endpoint',
      {
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
      },
    )

    return {
      body,
      headers: {},
      statusCode,
    }
  }

  return invokeHandler(predictionEntriesHandler, {
    body: payload,
    method: 'POST',
  })
}

async function verifyPersistedRow(entry: EntryResponse) {
  assert(
    originalConnectionString,
    'PRIMARY_DB_CONNECTION_STRING is required for persisted verification.',
  )

  const sql = neon(originalConnectionString)
  const rows = (await sql`
    SELECT
      pe.id,
      pe.receipt_hash,
      pe.match_number,
      pe.predicted_outcome,
      p.country,
      (p.address_line1 IS NOT NULL AND p.city IS NOT NULL) AS address_present
    FROM prediction_entries pe
    JOIN participants p ON p.id = pe.participant_id
    WHERE pe.receipt_hash = ${entry.receiptHash}
  `) as Array<{
    address_present: boolean
    country: string
    id: string
    match_number: number
    predicted_outcome: string
    receipt_hash: string
  }>

  const persistedRow = rows[0]

  assert(persistedRow, 'Prediction entry row was not found after API insert.')
  assert(
    persistedRow.address_present,
    'Participant address was not stored server-side.',
  )

  await sql`
    DELETE FROM prediction_entries
    WHERE receipt_hash = ${entry.receiptHash}
  `

  await sql`
    DELETE FROM participants
    WHERE email = ${entry.participantEmail}
  `

  return {
    country: persistedRow.country,
    matchNumber: persistedRow.match_number,
    predictedOutcome: persistedRow.predicted_outcome,
  }
}

if (
  mode !== 'dev' &&
  mode !== 'fallback' &&
  mode !== 'persisted' &&
  mode !== 'remote' &&
  mode !== 'vercel'
) {
  console.error(
    'Usage: npm run verify:api:dev, npm run verify:api:fallback, npm run verify:api:persisted, npm run verify:api:remote, or npm run verify:api:vercel',
  )
  process.exit(1)
}

if (mode === 'dev' || mode === 'fallback') {
  delete process.env.PRIMARY_DB_CONNECTION_STRING
} else if (!originalConnectionString) {
  console.error(
    'PRIMARY_DB_CONNECTION_STRING is required for persisted verification.',
  )
  process.exit(1)
} else if ((mode === 'remote' || mode === 'vercel') && !apiBaseUrl) {
  console.error(
    'PREDICTION_API_BASE_URL is required for remote or Vercel verification.',
  )
  process.exit(1)
}

const firstBundle = await getFirstBundle()
const smokeId = Date.now()
const hiddenAddressLine1 = `${smokeId} Codex Test Street`
const payload = {
  participant: {
    addressLine1: hiddenAddressLine1,
    addressLine2: 'Suite 2026',
    city: 'Austin',
    country: 'US',
    email: `prediction-smoke-${smokeId}@example.com`,
    firstName: 'Prediction',
    lastName: 'Smoke',
    marketingConsent: false,
    phone: '512-555-2026',
    postalCode: '78701',
    rulesAccepted: true,
    state: 'TX',
  },
  prediction: {
    awayScore: 1,
    awayTeam: firstBundle.fixture.away,
    homeScore: 2,
    homeTeam: firstBundle.fixture.home,
    matchId: `fixture-${firstBundle.fixture.matchNumber}`,
    matchNumber: firstBundle.fixture.matchNumber,
    predictedOutcome: firstBundle.fixture.home,
    prizeBundleId: firstBundle.prizeBundle.id,
    sponsorCampaignId: firstBundle.prizeBundle.sponsorCampaignId,
    supporterTeamKey: 'usa',
  },
}

const entryResult = await submitEntry(payload)

assert(isObject(entryResult.body), 'Prediction endpoint returned a non-object body.')

const entryBody = entryResult.body as EntryResponse
const responseText = JSON.stringify(entryResult.body)
const addressReturned = responseText.includes(hiddenAddressLine1)
const expectsFallbackReceipt = mode === 'dev' || mode === 'fallback'

if (expectsFallbackReceipt) {
  assert(entryResult.statusCode === 202, 'Fallback verification expected HTTP 202.')
  assert(entryBody.persisted === false, 'Fallback verification expected persisted=false.')
  assert(
    entryBody.persistenceMode === 'server-fallback-no-database',
    'Fallback verification returned the wrong persistence mode.',
  )
} else {
  assert(entryResult.statusCode === 201, 'Persisted verification expected HTTP 201.')
  assert(entryBody.persisted === true, 'Persisted verification expected persisted=true.')
  assert(
    entryBody.persistenceMode === 'neon',
    'Persisted verification returned the wrong persistence mode.',
  )
}

assert(entryBody.receiptHash, 'Prediction endpoint did not return a receipt hash.')
assert(!addressReturned, 'Prediction endpoint returned address data.')

const persistedRow =
  mode === 'persisted' || mode === 'remote' || mode === 'vercel'
    ? await verifyPersistedRow(entryBody)
    : null

console.log(
  JSON.stringify(
    {
      addressReturned,
      cleanup: Boolean(persistedRow),
      joinedCount: entryBody.joinedCount,
      mode,
      persisted: entryBody.persisted,
      persistenceMode: entryBody.persistenceMode,
      receiptHashPrefix: entryBody.receiptHash.slice(0, 12),
      rowVerified: Boolean(persistedRow),
      statusCode: entryResult.statusCode,
    },
    null,
    2,
  ),
)
