/// <reference types="node" />

import { createHash, randomUUID } from 'node:crypto'
import { neon, type NeonQueryFunction } from '@neondatabase/serverless'
import { z } from 'zod'
import {
  sponsorApplicationPayloadSchema,
  sponsorPackageById,
  type SponsorApplicationPayload,
  type SponsorApplicationStatus,
} from '../src/data/sponsorOnboarding.js'

type ApiRequest = {
  body?: unknown
  method?: string
}

type ApiResponse = {
  json: (body: unknown) => void
  setHeader: (name: string, value: string) => void
  status: (code: number) => ApiResponse
}

type SqlQuery = NeonQueryFunction<false, false>

let schemaReady: Promise<void> | null = null

function parseRequestBody(body: unknown) {
  if (typeof body !== 'string') return body

  return JSON.parse(body)
}

function createReceiptHash(parts: Array<number | string | boolean>) {
  return createHash('sha256')
    .update(parts.map(String).join('|'))
    .digest('hex')
    .slice(0, 28)
}

async function ensureSchema(sql: SqlQuery) {
  schemaReady ??= (async () => {
    await sql`
      CREATE TABLE IF NOT EXISTS sponsor_applications (
        id uuid PRIMARY KEY,
        receipt_hash text NOT NULL UNIQUE,
        status text NOT NULL,
        company_legal_name text NOT NULL,
        sponsor_display_name text NOT NULL,
        website_url text NOT NULL,
        company_country text NOT NULL,
        company_category text,
        contact_name text NOT NULL,
        contact_email text NOT NULL,
        billing_email text NOT NULL,
        contact_phone text,
        package_id text NOT NULL,
        package_name text NOT NULL,
        package_price_usd integer NOT NULL,
        logo_file_name text NOT NULL,
        logo_mime_type text NOT NULL,
        logo_size_bytes integer NOT NULL,
        logo_alt_text text NOT NULL,
        wants_product_offer boolean NOT NULL,
        product_offer jsonb NOT NULL DEFAULT '{}'::jsonb,
        ai_one_pager jsonb NOT NULL DEFAULT '{}'::jsonb,
        targeting jsonb NOT NULL DEFAULT '{}'::jsonb,
        terms jsonb NOT NULL DEFAULT '{}'::jsonb,
        checkout_mode text NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `

    await sql`
      CREATE INDEX IF NOT EXISTS sponsor_applications_status_idx
      ON sponsor_applications (status)
    `

    await sql`
      CREATE INDEX IF NOT EXISTS sponsor_applications_package_idx
      ON sponsor_applications (package_id)
    `
  })()

  await schemaReady
}

function getInitialStatus(): SponsorApplicationStatus {
  return 'awaiting_payment'
}

function getCheckoutMode() {
  return process.env.STRIPE_SECRET_KEY
    ? 'stripe-secret-present-price-not-wired'
    : 'stripe-checkout-not-configured'
}

function getApplicationResponse({
  applicationId,
  createdAt,
  payload,
  persisted,
  receiptHash,
}: {
  applicationId: string
  createdAt: string
  payload: SponsorApplicationPayload
  persisted: boolean
  receiptHash: string
}) {
  const sponsorPackage = sponsorPackageById[payload.packageId]
  const checkoutMode = getCheckoutMode()

  return {
    applicationId,
    billingEmail: payload.contact.billingEmail.toLowerCase(),
    checkoutMode,
    createdAt,
    message:
      checkoutMode === 'stripe-checkout-not-configured'
        ? 'Sponsor checkout is not configured for this environment, so this application is queued as awaiting payment.'
        : 'Stripe secret is present, but sponsor package price wiring is intentionally not active in this prototype endpoint.',
    packageName: sponsorPackage.name,
    packagePriceUsd: sponsorPackage.priceUsd,
    persisted,
    persistenceMode: persisted ? 'neon' : 'server-fallback-no-database',
    receiptHash,
    sponsorDisplayName: payload.company.displayName,
    status: getInitialStatus(),
  }
}

export default async function handler(
  request: ApiRequest,
  response: ApiResponse,
) {
  response.setHeader('Cache-Control', 'no-store')

  if (request.method !== 'POST') {
    response.status(405).json({ error: 'Method not allowed.' })
    return
  }

  let requestBody: unknown

  try {
    requestBody = parseRequestBody(request.body)
  } catch {
    response.status(400).json({ error: 'Invalid JSON request body.' })
    return
  }

  const parsedPayload = sponsorApplicationPayloadSchema.safeParse(requestBody)

  if (!parsedPayload.success) {
    response.status(400).json({
      error: 'Invalid sponsor application.',
      issues: z.flattenError(parsedPayload.error).fieldErrors,
    })
    return
  }

  const payload = parsedPayload.data
  const sponsorPackage = sponsorPackageById[payload.packageId]
  const applicationId = randomUUID()
  const createdAt = new Date().toISOString()
  const receiptHash = createReceiptHash([
    applicationId,
    payload.company.displayName,
    payload.contact.billingEmail.toLowerCase(),
    payload.packageId,
    sponsorPackage.priceUsd,
    createdAt,
  ])
  const connectionString = process.env.PRIMARY_DB_CONNECTION_STRING

  if (!connectionString) {
    response.status(202).json(
      getApplicationResponse({
        applicationId,
        createdAt,
        payload,
        persisted: false,
        receiptHash,
      }),
    )
    return
  }

  try {
    const sql = neon(connectionString)

    await ensureSchema(sql)
    await sql`
      INSERT INTO sponsor_applications (
        id,
        receipt_hash,
        status,
        company_legal_name,
        sponsor_display_name,
        website_url,
        company_country,
        company_category,
        contact_name,
        contact_email,
        billing_email,
        contact_phone,
        package_id,
        package_name,
        package_price_usd,
        logo_file_name,
        logo_mime_type,
        logo_size_bytes,
        logo_alt_text,
        wants_product_offer,
        product_offer,
        ai_one_pager,
        targeting,
        terms,
        checkout_mode
      )
      VALUES (
        ${applicationId},
        ${receiptHash},
        ${getInitialStatus()},
        ${payload.company.legalName},
        ${payload.company.displayName},
        ${payload.company.websiteUrl},
        ${payload.company.country},
        ${payload.company.category ?? ''},
        ${payload.contact.contactName},
        ${payload.contact.contactEmail.toLowerCase()},
        ${payload.contact.billingEmail.toLowerCase()},
        ${payload.contact.phone ?? ''},
        ${payload.packageId},
        ${sponsorPackage.name},
        ${sponsorPackage.priceUsd},
        ${payload.logo.fileName},
        ${payload.logo.mimeType},
        ${payload.logo.sizeBytes},
        ${payload.logo.altText},
        ${payload.productOffer.wantsToOffer},
        ${JSON.stringify(payload.productOffer)},
        ${JSON.stringify(payload.aiOnePager)},
        ${JSON.stringify(payload.targeting)},
        ${JSON.stringify(payload.terms)},
        ${getCheckoutMode()}
      )
    `

    response.status(201).json(
      getApplicationResponse({
        applicationId,
        createdAt,
        payload,
        persisted: true,
        receiptHash,
      }),
    )
  } catch {
    response.status(500).json({
      error: 'Sponsor application could not be saved. Please retry.',
    })
  }
}
