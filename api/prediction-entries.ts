/// <reference types="node" />

import { createHash, randomUUID } from 'node:crypto'
import { neon, type NeonQueryFunction } from '@neondatabase/serverless'
import { z } from 'zod'
import { getPrizeBundleForFixture } from '../src/data/homepagePrizeBundles.js'
import { predictionEntryPayloadSchema } from '../src/data/predictionEntry.js'
import {
  worldCupFixtures,
  type TournamentFixture,
} from '../src/data/worldCupSchedule.js'

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

function getPredictedOutcome(
  fixture: TournamentFixture,
  homeScore: number,
  awayScore: number,
) {
  if (homeScore > awayScore) return fixture.home
  if (awayScore > homeScore) return fixture.away

  return 'Draw'
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
      CREATE TABLE IF NOT EXISTS participants (
        id uuid PRIMARY KEY,
        first_name text NOT NULL,
        last_name text NOT NULL,
        email text NOT NULL UNIQUE,
        phone text NOT NULL,
        address_line1 text NOT NULL,
        address_line2 text,
        city text NOT NULL,
        state text NOT NULL,
        postal_code text NOT NULL,
        country text NOT NULL DEFAULT 'US',
        rules_accepted_at timestamptz NOT NULL,
        marketing_consent boolean NOT NULL DEFAULT false,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS sponsor_campaigns (
        id text PRIMARY KEY,
        name text NOT NULL,
        display_name text NOT NULL,
        tier text NOT NULL,
        match_number integer NOT NULL,
        status text NOT NULL DEFAULT 'planned',
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS prize_bundles (
        id text PRIMARY KEY,
        match_number integer NOT NULL,
        title text NOT NULL,
        winner_slots integer NOT NULL,
        joined_count_seed integer NOT NULL,
        bonus_prize_label text NOT NULL,
        sponsor_campaign_id text REFERENCES sponsor_campaigns(id),
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS prize_items (
        id uuid PRIMARY KEY,
        prize_bundle_id text NOT NULL REFERENCES prize_bundles(id) ON DELETE CASCADE,
        label text NOT NULL,
        description text NOT NULL,
        country text NOT NULL,
        type text NOT NULL,
        display_order integer NOT NULL
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS prediction_entries (
        id uuid PRIMARY KEY,
        participant_id uuid NOT NULL REFERENCES participants(id),
        match_number integer NOT NULL,
        match_id text NOT NULL,
        home_team text NOT NULL,
        away_team text NOT NULL,
        home_score integer NOT NULL,
        away_score integer NOT NULL,
        predicted_outcome text NOT NULL,
        supporter_team_key text NOT NULL,
        prize_bundle_id text REFERENCES prize_bundles(id),
        sponsor_campaign_id text REFERENCES sponsor_campaigns(id),
        receipt_hash text NOT NULL UNIQUE,
        status text NOT NULL DEFAULT 'locked',
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `
  })()

  await schemaReady
}

async function upsertBundleRows(
  sql: SqlQuery,
  fixture: TournamentFixture,
  bundle: ReturnType<typeof getPrizeBundleForFixture>,
) {
  await sql`
    INSERT INTO sponsor_campaigns (
      id,
      name,
      display_name,
      tier,
      match_number,
      status,
      updated_at
    )
    VALUES (
      ${bundle.sponsorCampaignId},
      ${bundle.sponsorCampaignId},
      ${bundle.sponsorName},
      ${bundle.tag},
      ${fixture.matchNumber},
      'planned',
      now()
    )
    ON CONFLICT (id) DO UPDATE SET
      display_name = EXCLUDED.display_name,
      tier = EXCLUDED.tier,
      match_number = EXCLUDED.match_number,
      updated_at = now()
  `

  await sql`
    INSERT INTO prize_bundles (
      id,
      match_number,
      title,
      winner_slots,
      joined_count_seed,
      bonus_prize_label,
      sponsor_campaign_id,
      updated_at
    )
    VALUES (
      ${bundle.id},
      ${fixture.matchNumber},
      ${bundle.title},
      ${bundle.winnerSlots},
      ${bundle.joinedCountSeed},
      ${bundle.bonusPrizeLabel},
      ${bundle.sponsorCampaignId},
      now()
    )
    ON CONFLICT (id) DO UPDATE SET
      match_number = EXCLUDED.match_number,
      title = EXCLUDED.title,
      winner_slots = EXCLUDED.winner_slots,
      joined_count_seed = EXCLUDED.joined_count_seed,
      bonus_prize_label = EXCLUDED.bonus_prize_label,
      sponsor_campaign_id = EXCLUDED.sponsor_campaign_id,
      updated_at = now()
  `

  await sql`DELETE FROM prize_items WHERE prize_bundle_id = ${bundle.id}`

  for (const [index, item] of bundle.items.entries()) {
    await sql`
      INSERT INTO prize_items (
        id,
        prize_bundle_id,
        label,
        description,
        country,
        type,
        display_order
      )
      VALUES (
        ${randomUUID()},
        ${bundle.id},
        ${item.label},
        ${item.description},
        ${item.country},
        ${item.type},
        ${index + 1}
      )
    `
  }
}

export default async function handler(
  request: ApiRequest,
  response: ApiResponse,
) {
  if (request.method && request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    response.status(405).json({ error: 'Method not allowed' })
    return
  }

  let requestBody: unknown

  try {
    requestBody = parseRequestBody(request.body)
  } catch {
    response.status(400).json({ error: 'Invalid JSON request body.' })
    return
  }

  const parsedPayload = predictionEntryPayloadSchema.safeParse(requestBody)

  if (!parsedPayload.success) {
    response.status(400).json({
      error: 'Invalid prediction entry.',
      issues: z.flattenError(parsedPayload.error).fieldErrors,
    })
    return
  }

  const payload = parsedPayload.data
  const fixture = worldCupFixtures.find(
    (candidate) => candidate.matchNumber === payload.prediction.matchNumber,
  )

  if (!fixture) {
    response.status(400).json({ error: 'Unknown match number.' })
    return
  }

  const serverMatchId = `fixture-${fixture.matchNumber}`

  if (
    payload.prediction.matchId !== serverMatchId ||
    payload.prediction.homeTeam !== fixture.home ||
    payload.prediction.awayTeam !== fixture.away
  ) {
    response.status(400).json({ error: 'Prediction does not match fixture.' })
    return
  }

  const participant = {
    ...payload.participant,
    addressLine2: payload.participant.addressLine2 ?? '',
    email: payload.participant.email.toLowerCase(),
  }
  const bundle = getPrizeBundleForFixture(fixture)
  const predictedOutcome = getPredictedOutcome(
    fixture,
    payload.prediction.homeScore,
    payload.prediction.awayScore,
  )
  const entryId = randomUUID()
  const participantId = randomUUID()
  const createdAt = new Date().toISOString()
  const receiptHash = createReceiptHash([
    entryId,
    serverMatchId,
    participant.email,
    payload.prediction.homeScore,
    payload.prediction.awayScore,
    predictedOutcome,
    createdAt,
  ])

  if (
    payload.prediction.prizeBundleId !== bundle.id ||
    payload.prediction.sponsorCampaignId !== bundle.sponsorCampaignId
  ) {
    response.status(400).json({ error: 'Prediction does not match prize bundle.' })
    return
  }

  const connectionString = process.env.PRIMARY_DB_CONNECTION_STRING

  if (!connectionString) {
    response.status(202).json({
      createdAt,
      joinedCount: bundle.joinedCountSeed + 1,
      message:
        'Database persistence is not configured for this environment; this receipt was not saved.',
      participantEmail: participant.email,
      persisted: false,
      persistenceMode: 'server-fallback-no-database',
      predictedOutcome,
      receiptHash,
      receiptId: entryId,
    })
    return
  }

  try {
    const sql = neon(connectionString)
    await ensureSchema(sql)
    await upsertBundleRows(sql, fixture, bundle)

    const rulesAcceptedAt = new Date().toISOString()
    const participantRows = (await sql`
      INSERT INTO participants (
        id,
        first_name,
        last_name,
        email,
        phone,
        address_line1,
        address_line2,
        city,
        state,
        postal_code,
        country,
        rules_accepted_at,
        marketing_consent,
        updated_at
      )
      VALUES (
        ${participantId},
        ${participant.firstName},
        ${participant.lastName},
        ${participant.email},
        ${participant.phone},
        ${participant.addressLine1},
        ${participant.addressLine2},
        ${participant.city},
        ${participant.state},
        ${participant.postalCode},
        'US',
        ${rulesAcceptedAt},
        ${participant.marketingConsent},
        now()
      )
      ON CONFLICT (email) DO UPDATE SET
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        phone = EXCLUDED.phone,
        address_line1 = EXCLUDED.address_line1,
        address_line2 = EXCLUDED.address_line2,
        city = EXCLUDED.city,
        state = EXCLUDED.state,
        postal_code = EXCLUDED.postal_code,
        country = EXCLUDED.country,
        rules_accepted_at = EXCLUDED.rules_accepted_at,
        marketing_consent = EXCLUDED.marketing_consent,
        updated_at = now()
      RETURNING id
    `) as Array<{ id: string }>

    const savedParticipantId = participantRows[0]?.id

    if (!savedParticipantId) {
      throw new Error('Participant upsert did not return an id.')
    }

    const entryRows = (await sql`
      INSERT INTO prediction_entries (
        id,
        participant_id,
        match_number,
        match_id,
        home_team,
        away_team,
        home_score,
        away_score,
        predicted_outcome,
        supporter_team_key,
        prize_bundle_id,
        sponsor_campaign_id,
        receipt_hash,
        status
      )
      VALUES (
        ${entryId},
        ${savedParticipantId},
        ${fixture.matchNumber},
        ${serverMatchId},
        ${fixture.home},
        ${fixture.away},
        ${payload.prediction.homeScore},
        ${payload.prediction.awayScore},
        ${predictedOutcome},
        ${payload.prediction.supporterTeamKey},
        ${bundle.id},
        ${bundle.sponsorCampaignId},
        ${receiptHash},
        'locked'
      )
      RETURNING id, receipt_hash, created_at
    `) as Array<{ created_at: string; id: string; receipt_hash: string }>

    const joinedRows = (await sql`
      SELECT (${bundle.joinedCountSeed} + count(*))::int AS joined_count
      FROM prediction_entries
      WHERE match_number = ${fixture.matchNumber}
        AND prize_bundle_id = ${bundle.id}
    `) as Array<{ joined_count: number }>

    response.status(201).json({
      createdAt: entryRows[0]?.created_at ?? createdAt,
      joinedCount: joinedRows[0]?.joined_count ?? bundle.joinedCountSeed + 1,
      participantEmail: participant.email,
      persisted: true,
      persistenceMode: 'neon',
      predictedOutcome,
      receiptHash: entryRows[0]?.receipt_hash ?? receiptHash,
      receiptId: entryRows[0]?.id ?? entryId,
    })
  } catch {
    response.status(500).json({
      error:
        'Prediction entry could not be saved. Please retry before locking this entry.',
    })
  }
}
