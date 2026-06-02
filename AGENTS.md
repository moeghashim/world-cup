# World Cup Predictor Build Log

This document is the project artifact for how the product is being built. Update it after each meaningful task, then commit the code and documentation together when the work is coherent.

## Working Agreement

- Keep product logic deterministic for predictions, draws, eligibility, shipping, reviews, and compliance.
- Use JSON-render as a constrained presentation/spec layer, not as the source of truth for prize or fulfillment logic.
- Keep team personalization token-driven through CSS variables and typed team data.
- Maintain `PRODUCT.md` and `DESIGN.md` when product or design direction changes.
- Maintain `BUILD_BLOG.md` on every commit so it can become the public build article.
- Avoid official FIFA, tournament, federation, player, and sponsor marks unless the project has rights.
- After finishing a task: update this file and `BUILD_BLOG.md`, run verification, and commit.

## Current Stack

- Vite + React + TypeScript.
- `@json-render/core` and `@json-render/react` for the spec-driven product surface.
- `zod` for catalog props/action schemas.
- `lucide-react` for interface icons.
- Generated raster stadium hero copied to `src/assets/world-cup-hero.png`.

## Architecture Notes

The app uses React for the authoritative domain state:

- selected supporter team
- match predictions
- locked picks
- participant draw receipts
- match draw results
- draw audit metadata
- fulfillment queue
- review prompt status

The JSON-render layer lives in `src/jsonRender/predictionCatalog.tsx`. It defines a domain catalog with components like `MatchBoard`, `DrawControl`, `ShirtStudio`, `FulfillmentPipeline`, and `ProviderPlan`. The JSON spec controls section composition while registered actions call deterministic state updates.

The data layer lives in `src/data/worldCup.ts` and includes:

- supporter team themes
- demo matches
- deterministic demo results
- community entries for seeded draw simulation
- localized T-shirt concepts
- provider recommendations

Draw application happens when a visitor locks a winner prediction. The prototype creates a receipt hash, evaluates the ticket against the demo result, ranks eligible tickets with a public seed plus reveal seed, selects winners, preserves alternates, and shows audit metadata beside the reveal.

## Research Decisions

### JSON-render

Reference: https://json-render.dev/

JSON-render is useful for catalog-first UI, constrained generated layouts, JSON Pointer state binding, and generated secondary surfaces. For this product, it should not own the critical prediction, scoring, prize, claim, or fulfillment rules.

MVP position: use JSON-render for a controlled, spec-driven experience layer and future generated modules. Keep business rules in typed React/application code.

### Print-On-Demand And Fulfillment

Research summary from the POD sub-agent:

- Gelato is the best first choice for global localized winner T-shirts because it can produce near recipients in many regions.
- Printful is stronger for branded control, mature API support, mockups, webhooks, and light warehousing/pack-ins.
- Printify is a cost lever but has higher supplier QA and routing complexity.
- Real sponsor-product packages should use a separate 3PL/kitting workflow, not POD inserts.

Recommended MVP: Gelato for shirts, Printful as backup/controlled fulfillment option, separate 3PL for sponsor kits.

### Stripe Projects

References: https://projects.dev/ and https://docs.stripe.com/projects

Stripe Projects is for provisioning and managing app infrastructure from the CLI. It can help add hosting, database, auth, analytics, communications, observability, AI providers, credentials, and spend limits.

It does not replace payments, contest compliance, prize fulfillment, POD APIs, 3PL operations, sponsor billing, or vendor payments.

Recommended use: use Stripe Projects for the build stack and SaaS spend limits. Keep Stripe payment products separate for sponsor billing, taxes, identity checks, fraud controls, and approved payout flows.

## T-Shirt Design System

Localized supporter shirt concepts are independent fan designs, not official jerseys. Each concept includes:

- concept name
- motif
- base/graphic/accent colors
- safe print copy
- disclaimer that no official team, tournament, sponsor, or player branding is used

Current concepts cover Brazil, Argentina, United States, France, England, Spain, Morocco, and Japan.

Design assets are now stored under `designs/`. The folder includes concept images for the supported teams, generated shirt design mockups for Argentina, Brazil, France, Japan, Morocco, Spain, and the United States, plus a refined concept board. These are visual direction assets, not final POD print files.

Logo explorations for `winworldcup2026.com` live in `designs/logos/`. The current set includes three SVG variations: orbit/cup, motion ball, and shield/globe. Variation B, the motion-ball logo, is selected and copied into `src/assets/winworldcup2026-logo.svg` as the active website header logo. The generated PNG board is a concept reference; the SVG files are the editable usable assets.

## Completed Work

### 2026-06-01

- Scaffolded a Vite React TypeScript app.
- Generated and copied a stadium hero asset into the workspace.
- Added team-driven theming and supporter mode.
- Built match prediction cards with score inputs, winner picks, and lock state.
- Added a JSON-render catalog and spec-driven sections.
- Added seeded match-level draw simulation with 5-10 winners per match.
- Added fulfillment queue and review prompt actions.
- Added localized T-shirt studio previews.
- Added provider plan for Gelato, Printful, 3PL/kitting, and Stripe Projects.
- Researched JSON-render, POD providers, and Stripe Projects using sub-agents and web sources.
- Scoped React Fast Refresh away from the mixed JSON-render catalog module.
- Verified build, lint, and browser interactions.
- Applied Impeccable-inspired product-design structure: added `PRODUCT.md`, `DESIGN.md`, a desktop workflow rail, cleaner product-state empty copy, and corrected section anchors.
- Added `BUILD_BLOG.md` as the narrative build article artifact and commit-by-commit project history.

### 2026-06-02

- Added participant-aware draw application receipts for locked predictions.
- Added deterministic winner and alternate ranking with public seed, commitment, reveal seed, and audit hash metadata.
- Added draw status rail, animated receipt pool, participant outcome panel, winner reveal animation, alternates, and audit panel.
- Connected fulfillment and review actions to update draw lifecycle status.
- Updated `PRODUCT.md`, `DESIGN.md`, and `BUILD_BLOG.md` with the draw mechanism and presentation decisions.
- Added generated localized shirt concept/design assets under `designs/` for the supporter personalization system.
- Added three logo variations for `winworldcup2026.com` under `designs/logos/` and documented their usage boundary.
- Selected Variation B as the active website logo and wired it into the top navigation brand.

## Verification

Latest successful commands:

```bash
npm run lint
npm run build
xmllint --noout designs/logos/winworldcup2026-logo-a-orbit-cup.svg designs/logos/winworldcup2026-logo-b-motion-ball.svg designs/logos/winworldcup2026-logo-c-shield-globe.svg
```

Browser verification covered:

- switching supporter team to Argentina
- selecting France for Argentina vs France
- locking the prediction
- running the Argentina vs France draw
- verifying winners appear
- queueing fulfillment and sending review prompts
- checking browser console errors
- checking the Impeccable-inspired workflow rail and refined empty draw states
- locking a Brazil prediction as a draw application receipt
- running the Brazil vs Spain draw with the current visitor in the winner group
- verifying public seed, commitment, and audit hash rendering
- confirming fulfillment and review actions advance the draw lifecycle copy
- checking the medium-breakpoint draw card layout after the animation pass

Latest screenshot:

`artifacts/worldcup-draw-mechanism.png`

## Next Tasks

- Add real persistence for users, predictions, draws, shipments, and reviews.
- Add authentication and user profiles.
- Add official rules/no-purchase/eligibility disclosures before any real prize campaign.
- Add admin tooling for sponsor campaigns, product SKUs, and fulfillment batches.
- Integrate a real POD provider API behind server-side actions.
- Design production shirt artwork files or outsource design refinements.
- Add responsive visual verification for mobile and tablet breakpoints.

<!-- stripe-projects-cli managed:agents-md:start -->
## Stripe Projects CLI

This repository is initialized for the Stripe project "World Cup".

## Tools used

- [Stripe CLI](https://docs.stripe.com/stripe-cli) with the `projects` plugin to manage third-party services, credentials, and deployments for this project. Use the stripe-projects-cli to manage deploying and access to third party services.
<!-- stripe-projects-cli managed:agents-md:end -->
