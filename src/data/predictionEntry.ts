import { z } from 'zod'
import type { TeamKey } from './worldCup.js'

export const usStateCodes = [
  'AL',
  'AK',
  'AZ',
  'AR',
  'CA',
  'CO',
  'CT',
  'DE',
  'DC',
  'FL',
  'GA',
  'HI',
  'ID',
  'IL',
  'IN',
  'IA',
  'KS',
  'KY',
  'LA',
  'ME',
  'MD',
  'MA',
  'MI',
  'MN',
  'MS',
  'MO',
  'MT',
  'NE',
  'NV',
  'NH',
  'NJ',
  'NM',
  'NY',
  'NC',
  'ND',
  'OH',
  'OK',
  'OR',
  'PA',
  'RI',
  'SC',
  'SD',
  'TN',
  'TX',
  'UT',
  'VT',
  'VA',
  'WA',
  'WV',
  'WI',
  'WY',
] as const

export const supporterTeamKeys = [
  'brazil',
  'argentina',
  'usa',
  'france',
  'england',
  'spain',
  'morocco',
  'japan',
] as const satisfies readonly TeamKey[]

export const predictionEntryFormSchema = z.object({
  addressLine1: z.string().trim().min(3, 'Address line 1 is required.'),
  addressLine2: z.string().trim().optional(),
  city: z.string().trim().min(2, 'City is required.'),
  country: z.literal('US'),
  email: z.string().trim().email('Enter a valid email address.'),
  firstName: z.string().trim().min(1, 'First name is required.'),
  lastName: z.string().trim().min(1, 'Last name is required.'),
  marketingConsent: z.boolean(),
  phone: z
    .string()
    .trim()
    .regex(
      /^\+?1?[-.\s(]*\d{3}[-.\s)]*\d{3}[-.\s]*\d{4}$/,
      'Enter a valid US phone number.',
    ),
  postalCode: z
    .string()
    .trim()
    .regex(/^\d{5}(?:-\d{4})?$/, 'Enter a valid US ZIP code.'),
  rulesAccepted: z
    .boolean()
    .refine((accepted) => accepted, 'Rules and eligibility must be accepted.'),
  state: z.enum(usStateCodes),
})

export const predictionEntryPayloadSchema = z.object({
  participant: predictionEntryFormSchema,
  prediction: z.object({
    awayScore: z.number().int().min(0).max(9),
    awayTeam: z.string().trim().min(1),
    homeScore: z.number().int().min(0).max(9),
    homeTeam: z.string().trim().min(1),
    matchId: z.string().trim().min(1),
    matchNumber: z.number().int().positive(),
    predictedOutcome: z.string().trim().min(1),
    prizeBundleId: z.string().trim().min(1),
    sponsorCampaignId: z.string().trim().min(1),
    supporterTeamKey: z.enum(supporterTeamKeys),
  }),
})

export type PredictionEntryForm = z.infer<typeof predictionEntryFormSchema>
export type PredictionEntryPayload = z.infer<typeof predictionEntryPayloadSchema>

export const emptyPredictionEntryForm: PredictionEntryForm = {
  addressLine1: '',
  addressLine2: '',
  city: '',
  country: 'US',
  email: '',
  firstName: '',
  lastName: '',
  marketingConsent: false,
  phone: '',
  postalCode: '',
  rulesAccepted: false,
  state: 'AL',
}
