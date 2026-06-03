import { z } from 'zod'

export const sponsorPackageIds = [
  'global',
  'website',
  'matchday',
  'fan',
] as const

export const sponsorOfferTypes = [
  'digital',
  'coupon',
  'trial',
  'ai-credits',
  'download',
  'physical',
  'service-consultation',
  'other',
] as const

export const sponsorFulfillmentOwners = [
  'platform',
  'sponsor',
  'pod-provider',
  '3pl',
] as const

export const sponsorApplicationStatuses = [
  'draft',
  'awaiting_payment',
  'payment_failed',
  'pending_review',
  'needs_changes',
  'approved',
  'active',
  'paused',
  'completed',
  'rejected',
  'refunded',
] as const

export const sponsorPackages = [
  {
    id: 'global',
    name: 'Global Cup Partner',
    priceLabel: '$50,000',
    priceUsd: 50000,
    spots: 2,
    checkoutEnvVar: 'STRIPE_SPONSOR_PRICE_GLOBAL',
  },
  {
    id: 'website',
    name: 'Website Sponsor',
    priceLabel: '$25,000',
    priceUsd: 25000,
    spots: 4,
    checkoutEnvVar: 'STRIPE_SPONSOR_PRICE_WEBSITE',
  },
  {
    id: 'matchday',
    name: 'Matchday Featured Sponsor',
    priceLabel: '$10,000',
    priceUsd: 10000,
    spots: 10,
    checkoutEnvVar: 'STRIPE_SPONSOR_PRICE_MATCHDAY',
  },
  {
    id: 'fan',
    name: 'Fan Drop Sponsor',
    priceLabel: '$5,000',
    priceUsd: 5000,
    spots: 30,
    checkoutEnvVar: 'STRIPE_SPONSOR_PRICE_FAN',
  },
] as const satisfies ReadonlyArray<{
  checkoutEnvVar: string
  id: SponsorPackageId
  name: string
  priceLabel: string
  priceUsd: number
  spots: number
}>

export type SponsorPackageId = (typeof sponsorPackageIds)[number]
export type SponsorOfferType = (typeof sponsorOfferTypes)[number]
export type SponsorFulfillmentOwner = (typeof sponsorFulfillmentOwners)[number]
export type SponsorApplicationStatus =
  (typeof sponsorApplicationStatuses)[number]

export const sponsorPackageById = Object.fromEntries(
  sponsorPackages.map((sponsorPackage) => [sponsorPackage.id, sponsorPackage]),
) as Record<SponsorPackageId, (typeof sponsorPackages)[number]>

export const sponsorOfferTypeLabels: Record<SponsorOfferType, string> = {
  'ai-credits': 'AI credits',
  coupon: 'Coupon',
  digital: 'Digital product',
  download: 'Download',
  other: 'Other',
  physical: 'Physical product',
  'service-consultation': 'Service consultation',
  trial: 'Trial',
}

export const sponsorFulfillmentOwnerLabels: Record<
  SponsorFulfillmentOwner,
  string
> = {
  '3pl': '3PL or kitting partner',
  platform: 'World Cup Predictor platform',
  'pod-provider': 'Print-on-demand provider',
  sponsor: 'Sponsor',
}

export const sponsorApplicationFormSchema = z.object({
  aiOnePager: z.object({
    dataPrivacySummary: z.string().trim().max(900).optional(),
    isAiCompany: z.boolean(),
    productDescription: z.string().trim().max(900).optional(),
    supportUrl: z.string().trim().url('Enter a valid support URL.').optional().or(z.literal('')),
    targetAudience: z.string().trim().max(500).optional(),
    termsUrl: z.string().trim().url('Enter a valid terms URL.').optional().or(z.literal('')),
    usefulnessToFans: z.string().trim().max(900).optional(),
  }),
  company: z.object({
    category: z.string().trim().max(80).optional(),
    country: z.string().trim().min(2, 'Country is required.'),
    displayName: z.string().trim().min(2, 'Sponsor display name is required.'),
    legalName: z.string().trim().min(2, 'Company name is required.'),
    websiteUrl: z.string().trim().url('Enter a valid website URL.'),
  }),
  contact: z.object({
    billingEmail: z.string().trim().email('Enter a valid billing email.'),
    contactEmail: z.string().trim().email('Enter a valid contact email.'),
    contactName: z.string().trim().min(2, 'Contact name is required.'),
    phone: z.string().trim().max(40).optional(),
  }),
  logo: z.object({
    altText: z.string().trim().min(2, 'Logo alt text is required.'),
    fileName: z.string().trim().min(1, 'Logo file name is required.'),
    mimeType: z
      .string()
      .trim()
      .refine(
        (mimeType) =>
          [
            'image/svg+xml',
            'image/png',
            'image/jpeg',
            'image/webp',
          ].includes(mimeType),
        'Logo must be SVG, PNG, JPG, or WebP.',
      ),
    sizeBytes: z.number().int().min(1).max(5_000_000),
  }),
  packageId: z.enum(sponsorPackageIds),
  productOffer: z.object({
    description: z.string().trim().max(900).optional(),
    eligibleCountries: z.string().trim().max(300).optional(),
    expirationDate: z.string().trim().max(40).optional(),
    fulfillmentOwner: z.enum(sponsorFulfillmentOwners).optional(),
    productName: z.string().trim().max(120).optional(),
    quantityCap: z.number().int().nonnegative().optional(),
    redemptionInstructions: z.string().trim().max(900).optional(),
    redemptionUrl: z.string().trim().url('Enter a valid redemption URL.').optional().or(z.literal('')),
    supportUrl: z.string().trim().url('Enter a valid support URL.').optional().or(z.literal('')),
    termsUrl: z.string().trim().url('Enter a valid offer terms URL.').optional().or(z.literal('')),
    type: z.enum(sponsorOfferTypes).optional(),
    valueUsd: z.number().int().nonnegative().optional(),
    wantsToOffer: z.boolean(),
    winnerDataSharingConsent: z.boolean(),
  }),
  targeting: z.object({
    preferredDates: z.string().trim().max(300).optional(),
    targetCountries: z.string().trim().max(300).optional(),
    targetLanguages: z.string().trim().max(300).optional(),
    targetMatchesTeamsRegions: z.string().trim().max(500).optional(),
    utmDestinationUrl: z.string().trim().url('Enter a valid UTM destination URL.').optional().or(z.literal('')),
  }),
  terms: z.object({
    contentReviewAccepted: z
      .boolean()
      .refine((accepted) => accepted, 'Content review terms must be accepted.'),
    logoRightsAccepted: z
      .boolean()
      .refine((accepted) => accepted, 'Logo rights terms must be accepted.'),
    noGuaranteeAccepted: z
      .boolean()
      .refine((accepted) => accepted, 'No-guarantee terms must be accepted.'),
    sponsorAgreementAccepted: z
      .boolean()
      .refine((accepted) => accepted, 'Sponsorship terms must be accepted.'),
    winnerPrivacyAccepted: z
      .boolean()
      .refine((accepted) => accepted, 'Winner privacy terms must be accepted.'),
  }),
})

export const sponsorApplicationPayloadSchema =
  sponsorApplicationFormSchema.superRefine((application, context) => {
    if (application.productOffer.wantsToOffer) {
      if (!application.productOffer.productName?.trim()) {
        context.addIssue({
          code: 'custom',
          message: 'Product name is required when offering a free product.',
          path: ['productOffer', 'productName'],
        })
      }

      if (!application.productOffer.type) {
        context.addIssue({
          code: 'custom',
          message: 'Offer type is required when offering a free product.',
          path: ['productOffer', 'type'],
        })
      }

      if (!application.productOffer.redemptionInstructions?.trim()) {
        context.addIssue({
          code: 'custom',
          message: 'Redemption instructions are required.',
          path: ['productOffer', 'redemptionInstructions'],
        })
      }
    }

    if (application.aiOnePager.isAiCompany) {
      if (!application.aiOnePager.productDescription?.trim()) {
        context.addIssue({
          code: 'custom',
          message: 'AI product description is required.',
          path: ['aiOnePager', 'productDescription'],
        })
      }

      if (!application.aiOnePager.usefulnessToFans?.trim()) {
        context.addIssue({
          code: 'custom',
          message: 'Explain why the AI product is useful to fans or winners.',
          path: ['aiOnePager', 'usefulnessToFans'],
        })
      }

      if (!application.aiOnePager.dataPrivacySummary?.trim()) {
        context.addIssue({
          code: 'custom',
          message: 'AI data/privacy summary is required.',
          path: ['aiOnePager', 'dataPrivacySummary'],
        })
      }
    }
  })

export type SponsorApplicationPayload = z.infer<
  typeof sponsorApplicationPayloadSchema
>

export const emptySponsorApplicationForm: SponsorApplicationPayload = {
  aiOnePager: {
    dataPrivacySummary: '',
    isAiCompany: false,
    productDescription: '',
    supportUrl: '',
    targetAudience: '',
    termsUrl: '',
    usefulnessToFans: '',
  },
  company: {
    category: '',
    country: 'United States',
    displayName: '',
    legalName: '',
    websiteUrl: '',
  },
  contact: {
    billingEmail: '',
    contactEmail: '',
    contactName: '',
    phone: '',
  },
  logo: {
    altText: '',
    fileName: '',
    mimeType: '',
    sizeBytes: 0,
  },
  packageId: 'website',
  productOffer: {
    description: '',
    eligibleCountries: 'United States',
    expirationDate: '',
    fulfillmentOwner: 'platform',
    productName: '',
    quantityCap: 0,
    redemptionInstructions: '',
    redemptionUrl: '',
    supportUrl: '',
    termsUrl: '',
    type: 'digital',
    valueUsd: 0,
    wantsToOffer: false,
    winnerDataSharingConsent: false,
  },
  targeting: {
    preferredDates: '',
    targetCountries: '',
    targetLanguages: '',
    targetMatchesTeamsRegions: '',
    utmDestinationUrl: '',
  },
  terms: {
    contentReviewAccepted: false,
    logoRightsAccepted: false,
    noGuaranteeAccepted: false,
    sponsorAgreementAccepted: false,
    winnerPrivacyAccepted: false,
  },
}
