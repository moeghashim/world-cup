# Product Context

## Product

World Cup Predictor is a match prediction and sponsor reward experience for `winworldcup2026.com`, built as an experiment from `10claws.com` with Codex Desktop App and `https://projects.dev/`. A user chooses a supporter team, predicts fixtures, locks picks, and can enter sponsor-funded match draws when their prediction is correct.

## Primary Audience

- Football fans who want a fast, playful prediction experience.
- Sponsors who want match-specific product sampling, reviews, and fan engagement.
- Operations/admin users who need to move winners into shirt, sponsor package, and review workflows.

## Core User Flow

1. Choose a supporter team.
2. Review team identity pages with known supporter lines, group-stage fixtures, and sponsor opportunities.
3. Predict match winner and scoreline.
4. Enter name, email, phone, and full US shipping address when locking the prediction, because sponsors may choose to send gifts to all entrants.
5. Lock prediction to create a draw entry receipt.
6. Match result closes.
7. Correct predictions enter a match-level draw with public audit metadata.
8. Participants see whether their ticket won, became an alternate, or was not selected.
9. Winners receive a localized supporter T-shirt and sponsor product package.
10. Winners are prompted to review sponsor products after delivery.

## Product Principles

- The first screen should feel like the actual product, not a marketing landing page.
- Personalization should follow the supporter team but never hide core state.
- Draws, rewards, and fulfillment must remain transparent and auditable.
- Sponsor campaigns need clear separation from team theming.
- Prize, eligibility, and fulfillment language must be explicit before a real launch.

## Sponsorship Packages

- Global Cup Partner: 2 spots at $50,000 each. Sponsors the whole World Cup experience with prominent website placement, winner product gifting, 10 high-quality winner product review videos, sponsor story content, campaign recap reporting, and category lockout review.
- Website Sponsor: 4 spots at $25,000 each. Sponsors always-on website visibility across the homepage, prediction banner, prize discovery paths, match cards, sponsor story panel, winner review prompts, and website performance recap.
- Matchday Featured Sponsor: 10 spots at $10,000 each. Sponsors selected matches, regions, or supporter communities with featured match-card placement, product gift or voucher fulfillment, guided review prompts, targeting options, and campaign reporting.
- Fan Drop Sponsor: 30 spots at $5,000 each. Sponsors lighter product sampling through draw-pool mentions, winner claim moments, product gifts or digital perks, one guided review prompt, and basic fulfillment/review reporting.
- Team group-stage package: planning model at $45,000 per team, calculated as 3 group matches x $10,000 match spotlight plus 3 group reward drops x $5,000. Single-game sponsorship is modeled at $15,000 per game. These amounts exclude product cost, shipping, taxes, legal review, creative production, and payment processing.
- Creative add-ons can include custom sponsor landing pages, extra review videos, localized email/SMS sequences, host-city targeting, creator-style recap reels, and sponsor dashboard exports.

## MVP Boundaries

- Demo draws are seeded in local data.
- Draw receipts, commitments, seeds, winners, and alternates are prototype records.
- T-shirt previews and committed design assets are conceptual, not production print files.
- Logo explorations are committed under `designs/logos/`. The user-provided attached SVG is now the active website logo and still needs final legal/IP review before launch.
- Tournament teams and group-stage fixtures are a dated source snapshot. They should be verified against official sources or replaced with a maintained data feed before real eligibility decisions.
- Team identity pages use public nickname research and selected official/team-adjacent sources for known-as lines, fan support copy, and sponsor-safe statements. They are product copy for independent fan rewards and do not imply official team, federation, FIFA, player, or tournament sponsorship.
- The footer-linked Experiment view exposes build documentation and names Codex Desktop App plus `https://projects.dev/` as part of the build stack; the default homepage stays focused on matches, prizes, and winners.
- Public navigation uses page-style routes such as `/fixtures`, `/prizes/japan`, `/sponsors`, `/operations`, and `/experiment`, with legacy hash URLs normalized for backward compatibility.
- Google Analytics is live for page-view tracking through the GA4 stream `G-RFPJRPKYQR`, with selected custom funnel events also emitted through the shared analytics helper.
- `/posthog` is now the dashboard contract for product analytics. `posthog-js` is installed and event call sites are wired, but PostHog capture stays inert until `VITE_POSTHOG_KEY` is set and the app is restarted or rebuilt.
- Provider recommendations are architectural notes, not live integrations except for the current Google Analytics page-view setup and the Projects.dev-linked `WorldCup` PostHog resource, which is the only active PostHog analytics resource in the default environment.
- No real prize fulfillment, payment, user identity, fraud checks, or legal rules are implemented yet.
- `HOMEPAGE_PREDICTION_BANNER_PRD.md` defines the next homepage redesign: make the first viewport an interactive prediction banner, collect full US address at entry time, and persist entries through server-side Neon-backed APIs before treating captured entries as real campaign data.
- `HOMEPAGE_LIVE_BANNER_PRD.md` scopes the creative banner pass: make the first viewport feel alive with matchday atmosphere, score reactions, active fixture browsing, and prize/sponsor context without adding gambling-style mechanics.
