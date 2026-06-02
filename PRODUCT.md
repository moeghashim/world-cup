# Product Context

## Product

World Cup Predictor is a match prediction and sponsor reward experience for `winworldcup2026.com`. A user chooses a supporter team, predicts fixtures, locks picks, and can enter sponsor-funded match draws when their prediction is correct.

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

## MVP Boundaries

- Demo draws are seeded in local data.
- Draw receipts, commitments, seeds, winners, and alternates are prototype records.
- T-shirt previews and committed design assets are conceptual, not production print files.
- Logo explorations are committed under `designs/logos/`. The user-provided attached SVG is now the active website logo and still needs final legal/IP review before launch.
- Tournament teams and group-stage fixtures are a dated source snapshot. They should be verified against official sources or replaced with a maintained data feed before real eligibility decisions.
- Provider recommendations are architectural notes, not live integrations.
- No real prize fulfillment, payment, user identity, fraud checks, or legal rules are implemented yet.
