# Homepage Prediction Banner PRD

## Summary

Replace the current static homepage hero with an interactive match prediction banner. The first viewport should let a visitor predict the next match immediately, browse other upcoming matches, see the prize bundle and sponsor context for the selected match, and submit a draw entry with full contact and shipping information.

Assigned implementation agent: Wegnener.

## Problem

The current homepage opens with a cinematic but static banner. It explains the product, then sends the visitor elsewhere to make picks. That creates friction: the core product is prediction, but the first interaction is reading marketing copy and clicking a CTA.

The homepage should behave like the product immediately. A visitor should land, see the next match, adjust the score, understand the prize, and enter the draw from the first screen.

## Goals

- Make match prediction the first visible homepage action.
- Capture a complete draw entry when a user locks a prediction.
- Collect name, email, phone, and full US shipping address at entry time so sponsors can optionally send gifts to all entrants, not only winners.
- Show the selected match prize bundle in the same first viewport as the prediction.
- Let visitors browse nearby upcoming matches without leaving the hero.
- Preserve supporter-team theming without making team selection the primary task.
- Track prediction funnel events through the existing analytics helper.
- Prepare persistence through the existing Neon Postgres resource `primary-db`.

## Non-Goals

- Do not implement official tournament, federation, sponsor, crest, player, mascot, or FIFA branding.
- Do not implement payment, sponsor billing, real shipping labels, identity checks, fraud checks, or legal rules in this pass.
- Do not claim users are guaranteed prizes unless a sponsor campaign explicitly enables that rule.
- Do not expose database credentials to the browser.

## User Flow

1. Visitor lands on `/`.
2. Hero shows the next upcoming fixture by default.
3. Visitor can use score steppers or inputs for both teams.
4. Hero computes the predicted winner or draw live.
5. Visitor can switch to another upcoming match from the hero match rail.
6. Visitor clicks `Lock Prediction`.
7. Entry form opens in the hero or modal.
8. Visitor enters:
   - first name
   - last name
   - email
   - phone number
   - address line 1
   - address line 2
   - city
   - US state
   - ZIP code
   - confirmation that they are eligible and accept rules/privacy terms
   - optional marketing/sponsor updates consent
9. System validates the form.
10. System saves the prediction entry server-side.
11. Visitor sees a receipt with match, prediction, entry timestamp, and receipt id/hash.

## First View Requirements

The first viewport should include:

- Page-level product name/logo in the existing top navigation.
- Primary prediction arena:
  - selected match number
  - group/stage
  - home team and away team
  - kickoff date/time
  - venue/city
  - score controls
  - live predicted winner label
  - `Lock Prediction` CTA
  - locked/receipt state after entry
- Prize/sponsor panel:
  - prize bundle title
  - sponsor placeholder/name
  - winner count
  - joined count
  - top prize items
  - note that sponsor may choose to send gifts to more entrants
- Upcoming match rail:
  - next 5-8 fixtures
  - active match state
  - compact sponsor/prize tag where available
  - link to full fixtures page

## Prize Bundle Requirements

Each match should support a collection-style prize bundle:

- one localized supporter T-shirt concept for each team in the selected match when available
- country-inspired items from both teams' homelands
- sponsor products or vouchers
- optional bonus prize such as `$500 Amazon credit`
- winner count, typically 5-10
- joined count
- shipping/review lifecycle copy

Example: Saudi Arabia vs Brazil

- Brazil-inspired independent supporter shirt
- Saudi-inspired independent supporter shirt or scarf-style fan item
- Brazilian coffee or snack item
- Saudi dates or Arabic coffee kit
- sponsor product samples
- optional `$500 Amazon credit` eligibility

All items must be described as independent, culture-inspired, sponsor-funded gifts. Avoid official marks unless rights are secured.

## Persistence Requirements

Database resource exists through Projects.dev:

- Provider: Neon
- Resource: `primary-db`
- Relevant env var: `PRIMARY_DB_CONNECTION_STRING`

Current app state is React in-memory only. This PRD requires adding server-side persistence before treating homepage entries as real captured predictions.

Recommended tables:

### `participants`

- `id`
- `first_name`
- `last_name`
- `email`
- `phone`
- `address_line1`
- `address_line2`
- `city`
- `state`
- `postal_code`
- `country` default `US`
- `rules_accepted_at`
- `marketing_consent`
- `created_at`
- `updated_at`

### `prediction_entries`

- `id`
- `participant_id`
- `match_number`
- `match_id`
- `home_team`
- `away_team`
- `home_score`
- `away_score`
- `predicted_outcome`
- `supporter_team_key`
- `prize_bundle_id`
- `sponsor_campaign_id`
- `receipt_hash`
- `status`
- `created_at`
- `updated_at`

### `sponsor_campaigns`

- `id`
- `name`
- `display_name`
- `tier`
- `match_number`
- `status`
- `created_at`
- `updated_at`

### `prize_bundles`

- `id`
- `match_number`
- `title`
- `winner_slots`
- `joined_count_seed`
- `bonus_prize_label`
- `sponsor_campaign_id`
- `created_at`
- `updated_at`

### `prize_items`

- `id`
- `prize_bundle_id`
- `label`
- `description`
- `country`
- `type`
- `display_order`

## API Requirements

Add server endpoints suitable for Vercel deployment:

- `POST /api/prediction-entries`
  - validates participant and prediction fields
  - stores or upserts participant by email
  - creates a prediction entry
  - returns receipt id/hash and joined count

- `GET /api/match-prize-bundles`
  - returns bundle data for the homepage match rail and active match panel
  - can be static-backed in the first pass, but shape should match future DB data

Validation should use a shared schema where practical. Reject non-US address submissions in the MVP because the current shipping scope is US-only.

## Analytics Requirements

Use `captureAnalyticsEvent` from `src/analytics.ts`.

Events:

- `homepage_match_selected`
- `prediction_started`
- `score_changed`
- `prediction_entry_opened`
- `prediction_entry_submitted`
- `prediction_entry_failed`
- `prediction_locked`
- `prize_bundle_viewed`

Properties:

- `match_number`
- `home_team`
- `away_team`
- `kickoff_date`
- `supporter_team`
- `predicted_home_score`
- `predicted_away_score`
- `predicted_outcome`
- `sponsor_campaign_id`
- `prize_bundle_id`

PostHog remains inert unless `VITE_POSTHOG_KEY` is configured.

## UX Requirements

- The prediction card must be usable without scrolling on desktop first viewport.
- On mobile, the score controls and lock CTA must appear before sponsor details.
- Entry form should feel like a draw entry, not checkout.
- The lock CTA should not permanently lock client state until the server returns success.
- After successful submission, show a receipt panel with:
  - prediction summary
  - participant email
  - receipt hash/id
  - prize bundle
  - "watch for draw updates" copy
- If API submission fails, preserve form values and show a clear retry state.
- Respect `prefers-reduced-motion`.

## Privacy And Compliance Notes

The product decision is to collect full address at entry time because sponsors may choose to send gifts to all entrants. This raises the privacy bar:

- Make the address collection reason explicit in the form.
- Mark the campaign as US-only until legal/shipping scope expands.
- Keep address data server-side only.
- Do not send full address to analytics tools.
- Do not display full address in the browser after submission.
- Add official rules, privacy policy, no-purchase language, and eligibility disclosures before any public campaign.

## Acceptance Criteria

- Homepage first viewport is centered on predicting a selected match.
- Static marketing hero is removed or converted into supporting background treatment.
- Visitor can change score, browse upcoming matches, and lock a prediction from the first screen.
- Locking a prediction opens/captures full entry data, including full US address.
- Successful entry returns a receipt state.
- Prize/sponsor panel changes with selected match.
- Joined count appears for selected match.
- Build passes with `npm run lint` and `npm run build`.
- Vercel preview deploy passes.
- `AGENTS.md` and `BUILD_BLOG.md` are updated with implementation notes.

## Open Decisions

- Whether the first implementation should write to Neon immediately or use a server action stub with a clearly marked persistence TODO.
- Whether participants can enter multiple predictions for the same match using the same email.
- Whether address must be verified before accepting the entry.
- Whether phone number is required or optional.
- Whether sponsor "send gifts to all entrants" should be campaign-level opt-in visible in the prize panel.
