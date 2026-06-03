# Sponsorship Plan

Last updated: 2026-06-03

## Goal

Create a complete sponsor onboarding process for the World Cup prediction website. Sponsors should be able to submit their brand assets, describe any free product offer, select and pay for a sponsorship package, receive confirmation by email, and move through review before anything goes live.

## Current Implementation Status

Built in this pass:

- `/sponsors` now includes a real sponsor application section after the package marketplace.
- Sponsors can enter company, contact, billing, category, and targeting details.
- Sponsors can upload a logo for local preview and provide logo alt text. The current MVP sends logo metadata to the API, not the binary file.
- Sponsors can select Global Cup Partner, Website Sponsor, Matchday Featured Sponsor, or Fan Drop Sponsor.
- Sponsors can opt into a free product offer and provide offer type, description, value, quantity cap, fulfillment owner, countries, redemption instructions, and winner data-sharing acknowledgement.
- AI companies can opt into a required one-pager flow with product description, usefulness-to-fans copy, and data/privacy summary.
- Required sponsorship terms are collected before payment.
- `POST /api/sponsor-applications` validates the same payload shape as the client, creates an `awaiting_payment` receipt, persists to Neon when `PRIMARY_DB_CONNECTION_STRING` is configured, and returns an explicit `server-fallback-no-database` response when persistence is unavailable.
- `.env.example` documents the future Stripe Checkout and webhook variables: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and package price IDs.

Not built yet:

- Real logo storage, SVG sanitization, raster normalization, or optimized public asset generation.
- Stripe Checkout Session creation.
- Stripe webhook signature verification and status transitions from paid checkout to `pending_review`.
- Confirmation emails.
- Admin review UI.
- Sponsor reporting dashboard.
- Physical inventory, 3PL, POD, and winner consent fulfillment workflows.

Important boundary: this MVP never activates a sponsor from a success redirect or prototype receipt. Paid sponsorship activation still requires Stripe webhook confirmation and admin approval.

## Recommended Flow

1. Sponsor lands on the sponsorship page.
2. Sponsor enters company and contact details.
3. Sponsor uploads a logo and previews how it will appear on the website.
4. System validates and normalizes the logo for website use.
5. Sponsor answers whether they want to offer a free product.
6. If they offer a product, sponsor provides offer details and fulfillment rules.
7. If the sponsor is an AI company, sponsor provides a one-pager explaining the product.
8. Sponsor selects a package.
9. Sponsor accepts sponsorship terms.
10. Sponsor pays through Stripe Checkout.
11. Stripe webhook confirms successful payment.
12. System creates a paid sponsorship record in `pending_review` status.
13. Agent sends a confirmation email with package details, next steps, and review timeline.
14. Admin reviews the logo, offer, one-pager, and package configuration.
15. Approved sponsorships become active on the site.
16. Sponsor receives campaign reporting after or during the sponsorship period.

## Sponsor Intake Fields

Required fields:

- Company name
- Sponsor display name
- Contact name
- Contact email
- Billing email
- Website URL
- Country
- Sponsorship package
- Logo upload
- Agreement to sponsorship terms

Optional fields:

- Billing address
- Tax ID / VAT ID
- Company category
- Target countries or languages
- Preferred campaign dates
- Preferred teams, matches, or regions
- UTM destination URL
- Secondary contact
- Internal notes

## Logo Requirements

Accept:

- SVG, PNG, JPG, or WebP
- Transparent background preferred
- Horizontal and square logo variants preferred
- Minimum 512px width for raster images
- Maximum upload size should be enforced by the app

Processing requirements:

- Generate website-ready assets, such as WebP/PNG.
- Store original upload separately from optimized assets.
- Create light-background and dark-background previews.
- Generate alt text from sponsor display name.
- Reject or flag assets that include FIFA marks, World Cup logos, team crests, player likenesses, offensive content, or misleading claims.
- Sanitize SVG files before rendering them publicly.

Recommended output variants:

- Header/logo strip size
- Sponsor card size
- Email-safe PNG
- Social/share preview size if needed

## Free Product Offer

Ask: "Do you want to offer a free product to winners?"

If no:

- Continue to package selection.

If yes, classify the offer:

- Digital product
- Coupon or promo code
- Free trial
- AI credits
- Downloadable product
- Physical product
- Service consultation
- Other manually reviewed offer

Required offer fields:

- Product name
- Short description
- Redemption instructions
- Offer value
- Offer quantity or cap
- Eligible countries
- Expiration date
- Terms URL
- Privacy URL
- Support contact

For digital offers:

- Coupon code strategy
- Unique code generation requirement
- Redemption URL
- Whether codes are single-use
- Whether the sponsor or platform owns code generation

For physical offers:

- Fulfillment owner: sponsor, platform, POD provider, or 3PL
- Inventory confirmation
- Shipping countries
- Shipping SLA
- Customs restrictions
- Return/replacement policy
- Whether winner shipping data must be shared with the sponsor

Important: if sponsor products require winner personal data, winners must explicitly consent before their information is shared. Prefer using a 3PL or platform-controlled fulfillment path so sponsors do not directly receive winner addresses unless necessary.

## AI Company One-Pager

If the sponsor is an AI company, require a one-pager before review.

Required sections:

- What the product does
- Who it is for
- Why it is useful to match winners or fans
- What the free offer includes
- How to redeem the offer
- Limits, expiration, or eligibility rules
- Data usage and privacy summary
- Terms of service link
- Privacy policy link
- Support contact

Review rules:

- Flag medical, legal, financial, employment, or high-risk claims.
- Require clear disclosure if outputs may be inaccurate.
- Require clear user eligibility rules if age, country, or business email is required.
- Reject unverifiable or misleading performance claims.

## Sponsorship Packages

Before adding packages to Stripe, define an entitlement matrix.

Each package should include:

- Package name
- Stripe product ID
- Stripe price ID
- Price
- Billing model: one-time, monthly, or campaign-based
- Campaign duration
- Logo placement
- Number of match pages included
- Winner email inclusion
- Sponsor offer inclusion
- One-pager inclusion
- Reporting level
- Support level
- Approval requirements
- Refund/cancellation policy

Example packages:

| Package | Intended Use | Possible Entitlements |
| --- | --- | --- |
| Starter | Small sponsor | Sponsor card, limited match placement, basic reporting |
| Growth | Regional sponsor | More match placements, winner email mention, offer inclusion |
| Premier | Major sponsor | Featured placement, one-pager, offer inclusion, enhanced reporting |
| Custom | Enterprise sponsor | Manual pricing, custom contract, custom reporting, sponsor-product logistics |

Do not promise impressions, conversions, winners, or redemptions unless the system can measure and enforce those guarantees.

## Stripe Integration

Recommended approach:

- Use Stripe Products and Prices for sponsorship packages.
- Use Stripe Checkout for payment.
- Use Stripe webhooks as the source of truth for payment success.
- Do not activate sponsorships based only on the success redirect URL.
- Consider Stripe Tax and tax ID collection for business sponsors.
- Store Stripe customer ID, checkout session ID, payment intent ID, invoice ID, product ID, and price ID.

Important webhook events:

- `checkout.session.completed`
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `invoice.paid` if subscriptions are used
- `invoice.payment_failed` if subscriptions are used
- `customer.subscription.deleted` if subscriptions are used

Post-payment behavior:

- Create or update sponsor record.
- Mark payment as confirmed.
- Set sponsorship status to `pending_review`.
- Send confirmation email.
- Notify admin for review.

## Email Confirmation

The agent should send confirmation only after payment is confirmed by webhook.

Confirmation email should include:

- Sponsor name
- Package purchased
- Amount paid
- Receipt or invoice link
- Current status: pending review
- Review timeline
- Uploaded logo preview
- Submitted product offer summary
- Next steps
- Support contact

Additional emails:

- Payment failed
- Review approved
- Review rejected / changes requested
- Sponsorship live
- Sponsorship ending soon
- Campaign report available

## Admin Review

Admin should be able to:

- View sponsor intake details
- Preview uploaded logo
- Approve/reject logo
- Approve/reject free product offer
- Approve/reject AI one-pager
- Edit display name and placement
- Assign package entitlements
- Set campaign dates
- Pause or disable sponsorship
- Resend confirmation emails
- Issue refunds manually through Stripe if needed
- Export sponsor and reporting data

Recommended statuses:

- `draft`
- `awaiting_payment`
- `payment_failed`
- `pending_review`
- `needs_changes`
- `approved`
- `active`
- `paused`
- `completed`
- `rejected`
- `refunded`

## Legal And Policy Requirements

Add a sponsor agreement checkbox before payment.

Agreement should cover:

- Use of sponsor logo
- Review and rejection rights
- Refund policy
- Cancellation policy
- Prohibited content
- Campaign timing
- Package deliverables
- Reporting limitations
- No guarantee of results unless explicitly stated
- Winner privacy and data sharing
- Product offer terms
- Sponsor responsibility for claims and promotions

Risk areas:

- FIFA and World Cup IP cannot be used without permission.
- Official team crests, player likenesses, and protected marks should be rejected unless licensed.
- Giveaways may trigger sweepstakes, contest, tax, and regional consumer rules.
- Physical products create fulfillment, customs, return, and support obligations.
- AI product claims may need extra review for accuracy, safety, privacy, and regulated-use issues.

## Reporting

Sponsors should receive a simple report.

Recommended metrics:

- Campaign dates
- Package
- Pages where sponsor appeared
- Impressions
- Clicks
- Click-through rate
- Offer redemptions
- Winners reached
- Email placements sent
- Email opens and clicks if tracked
- Countries or teams associated with exposure
- UTM destination performance if available

Reports should be exportable as CSV and viewable in a sponsor dashboard or sent by email.

## Suggested Data Model

Core tables or models:

- `Sponsor`
- `SponsorContact`
- `SponsorAsset`
- `SponsorshipPackage`
- `Sponsorship`
- `SponsorOffer`
- `SponsorOnePager`
- `SponsorPayment`
- `SponsorReview`
- `SponsorEmailLog`
- `SponsorReport`

Key relationships:

- A sponsor can have many contacts.
- A sponsor can have many assets.
- A sponsor can purchase many sponsorships.
- A sponsorship belongs to one package.
- A sponsorship can have zero or one product offer.
- A sponsorship can have zero or one AI one-pager.
- Payments should be linked to Stripe objects.

## Implementation Checklist

Phase 1: MVP

- Sponsor landing page
- Intake form
- Logo upload and preview
- Free product yes/no
- AI one-pager fields
- Package selection
- Stripe Checkout
- Stripe webhook handler
- Confirmation email after payment
- Admin review page
- Approved sponsor display on site

Phase 2: Operations

- Sponsor dashboard
- Sponsor status tracking
- Changes-requested flow
- Automated review notifications
- Reporting dashboard
- CSV exports
- Refund/cancellation handling
- Digital offer code management

Phase 3: Advanced Fulfillment

- 3PL integration for physical sponsor products
- Winner consent flow for sponsor-product shipment
- Inventory tracking
- Regional sponsor routing
- Automated sponsor report emails
- Multi-language sponsor one-pagers

## Open Decisions

- Which sponsorship packages and prices should exist?
- Are packages one-time, monthly, or campaign-based?
- Will sponsor products be digital-only for MVP?
- Will physical products be handled by sponsors, the platform, or a 3PL?
- Will sponsors get a dashboard or only email updates?
- Who reviews and approves sponsor submissions?
- What sponsor categories are prohibited?
- What exact website placements are available for each package?
- What reporting metrics can be measured reliably on day one?

## Recommended MVP Scope

For the first version, keep sponsor offers digital-only unless there is already a fulfillment partner.

Build:

- Intake
- Logo upload
- AI one-pager
- Package checkout
- Webhook confirmation
- Admin approval
- Sponsor display
- Basic reporting

Defer:

- Physical product fulfillment
- Inventory management
- Sponsor self-serve dashboard
- Complex placement targeting
- Guaranteed impression packages
