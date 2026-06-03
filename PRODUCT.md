# Product Context

## Product

World Cup Predictor is a match prediction and sponsor reward experience for `winworldcup2026.com`, built as an experiment from `10claws.com` with Codex Desktop App and `https://projects.dev/`. A user chooses a supporter team, predicts fixtures, locks picks, and can enter sponsor-funded match draws when their prediction is correct.

## Primary Audience

- Football fans who want a fast, playful prediction experience.
- Sponsors who want match-specific product sampling, reviews, and fan engagement.
- Operations/admin users who need to move winners into shirt, sponsor package, and review workflows.

## Core User Flow

1. Choose a supporter team.
2. Review that team's group-stage schedule and the full tournament field.
3. Predict match winner and scoreline.
4. Lock prediction to create a draw entry receipt.
5. Match result closes.
6. Correct predictions enter a match-level draw with public audit metadata.
7. Participants see whether their ticket won, became an alternate, or was not selected.
8. Winners receive a localized supporter T-shirt and sponsor product package.
9. Winners are prompted to review sponsor products after delivery.

## Product Principles

- The first screen should feel like the actual product, not a marketing landing page.
- Personalization should follow the supporter team but never hide core state.
- Draws, rewards, and fulfillment must remain transparent and auditable.
- Sponsor campaigns need clear separation from team theming.
- Prize, eligibility, and fulfillment language must be explicit before a real launch.

## Sponsorship Packages

- Global Cup Partner: 2 spots at $50,000 each. Sponsors the whole World Cup experience with prominent website placement, winner product gifting, 10 high-quality winner product review videos, sponsor story content, campaign recap reporting, and category lockout review.
- Matchday Featured Sponsor: 10 spots at $10,000 each. Sponsors selected matches, regions, or supporter communities with featured match-card placement, product gift or voucher fulfillment, guided review prompts, targeting options, and campaign reporting.
- Fan Drop Sponsor: 30 spots at $5,000 each. Sponsors lighter product sampling through draw-pool mentions, winner claim moments, product gifts or digital perks, one guided review prompt, and basic fulfillment/review reporting.
- Creative add-ons can include custom sponsor landing pages, extra review videos, localized email/SMS sequences, host-city targeting, creator-style recap reels, and sponsor dashboard exports.

## MVP Boundaries

- Demo draws are seeded in local data.
- Draw receipts, commitments, seeds, winners, and alternates are prototype records.
- T-shirt previews and committed design assets are conceptual, not production print files.
- Logo explorations are committed under `designs/logos/`. The user-provided attached SVG is now the active website logo and still needs final legal/IP review before launch.
- Tournament teams and group-stage fixtures are a dated source snapshot. They should be verified against official sources or replaced with a maintained data feed before real eligibility decisions.
- The footer-linked Experiment view exposes build documentation and names Codex Desktop App plus `https://projects.dev/` as part of the build stack; the default homepage stays focused on matches, prizes, and winners.
- Public navigation uses page-style routes such as `/fixtures`, `/prizes/japan`, `/sponsors`, `/operations`, and `/experiment`, with legacy hash URLs normalized for backward compatibility.
- Google Analytics is live for page-view tracking through the GA4 stream `G-RFPJRPKYQR`, with selected custom funnel events also emitted through the shared analytics helper.
- `/posthog` is now the dashboard contract for product analytics. `posthog-js` is installed and event call sites are wired, but PostHog capture stays inert until `VITE_POSTHOG_KEY` is set and the app is restarted or rebuilt.
- Provider recommendations are architectural notes, not live integrations except for the current Google Analytics page-view setup and the Projects.dev-linked `worldcup2026-analytics` PostHog resource, which is the only active PostHog analytics resource in the default environment.
- No real prize fulfillment, payment, user identity, fraud checks, or legal rules are implemented yet.
