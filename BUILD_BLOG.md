# Building A World Cup Prediction And Sponsor Rewards Website

Last updated: 2026-06-02

This is the working blog post for the project. Update this file on every commit so the article stays aligned with the real build history.

## The Idea

The product started as a World Cup prediction website where fans choose the team they support, predict match outcomes, and become eligible for sponsor-funded rewards when they are right. The rewards concept has three parts:

- match-level draws with around 5-10 winners per match
- sponsor product packages shipped to winners
- free localized supporter T-shirts themed around the user's chosen team

Winners should also be prompted to review sponsor products after delivery. That means the product is not just a prediction game. It is a full loop: predict, draw, fulfill, review.

## Early Product Shape

The project began in an empty folder, so the first step was to scaffold a Vite, React, and TypeScript app. The first usable screen was intentionally not a marketing landing page. It became the prediction experience itself:

- supporter team selection
- team-themed UI
- match prediction cards
- score inputs
- winner picks
- locked predictions
- sponsor reward panels

The project also generated a cinematic stadium hero image and saved it at `src/assets/world-cup-hero.png`. The asset gives the site tournament energy without using official FIFA, tournament, sponsor, player, or federation marks.

## Why Team Theming Is Data-Driven

The supporter team choice controls the visual theme. Each team has a typed theme object in `src/data/worldCup.ts`:

- team name and code
- supporter chant
- mood description
- primary, secondary, accent, ink, and soft colors
- supporter stats

React maps the selected team into CSS variables:

```css
--team-primary
--team-secondary
--team-accent
--team-ink
--team-soft
```

This keeps personalization flexible without letting team color take over the app. It also makes future team additions straightforward: add a data record, and the UI inherits the theme.

## Why JSON-render Is Used Carefully

The project uses `@json-render/core` and `@json-render/react`, but only as a constrained presentation layer.

The important boundary is this:

- JSON-render controls section composition and registered UI actions.
- React and typed domain code own prediction, draw, fulfillment, and review state.

That split came from the design study. JSON-render is useful for catalog-first UI, generated modules, and controlled layout variation. It is not the right source of truth for anything involving prizes, eligibility, audit trails, fulfillment, or compliance.

The JSON-render catalog lives in `src/jsonRender/predictionCatalog.tsx`. It defines product-specific components:

- `MatchBoard`
- `DrawControl`
- `ShirtStudio`
- `FulfillmentPipeline`
- `RewardSummary`
- `ProviderPlan`

The JSON spec decides which sections appear, but action handlers still call deterministic state updates.

## The Prediction System

The prediction flow is intentionally simple in the prototype:

1. Pick a match winner or draw.
2. Set the scoreline.
3. Lock the prediction, which creates a draw application receipt.
4. Evaluate eligibility against the demo match result.
5. Run a seeded demo draw after the result closes.
6. Present the participant outcome.

Demo match data includes a `winnerSlots` number and a deterministic `demoResult`. Community entries are seeded in local data so draw behavior is repeatable during testing.

The draw result includes:

- final result label
- total entry count
- eligible entry count
- winners
- alternates
- exact-score flag
- prize description
- participant outcome
- public seed, commitment, reveal seed, and audit hash
- fulfillment status

This is enough to demonstrate the flow without pretending to have production scoring, fraud checks, official results, or legal eligibility rules.

## Draw Mechanism And Reveal

The latest build makes the draw participant-aware. The important product decision is that applying for a draw is not a separate form in the MVP. A visitor applies by locking a prediction before the result closes.

That lock produces a receipt hash tied to:

- match id
- supporter team
- predicted winner
- predicted score
- rules version

When the draw runs, the system combines seeded community tickets with the current visitor's locked ticket, checks eligibility against the result, ranks eligible receipts with a public seed plus reveal seed, and then selects the configured winner slots. The next ranked receipts become alternates.

The UI now shows this as a participant journey:

1. Apply
2. Check
3. Seed
4. Reveal
5. Claim

The reveal animation uses ticket movement, a stadium light sweep, and sequential winner rows. It deliberately avoids casino-style reels or betting visuals. The participant sees one of the key outcomes: lock a pick, ticket not eligible, winner, alternate, qualified but not selected.

The implementation lives in `src/jsonRender/predictionCatalog.tsx`, with styling in `src/App.css`. The JSON-render layer still controls the section and component surface, while typed React state owns the actual draw state and audit data.

## Sponsor Rewards And Fulfillment

The rewards model separates the fan-facing prize from the operational flow.

Fan-facing rewards include:

- sponsor gift collections
- exact-score bonus credit draws
- supporter streak boosts
- free localized T-shirts

Operationally, the prototype shows:

- shipment queue count
- review prompt count
- match-level queue actions
- match-level review actions

This is deliberately visible because sponsor rewards need auditability. A future production system should store immutable records for prediction, result, eligibility, draw, claim, shipment, delivery, and review prompt events.

## Localized T-Shirts

The T-shirt system uses independent fan designs rather than official jerseys. That matters because official tournament marks, federation crests, player names, mascot imagery, trophy imagery, and sponsor marks generally require licensing.

Current T-shirt concepts cover:

- Brazil: Canary Street Rhythm
- Argentina: Skyline Albiceleste
- United States: Stateside Rally
- France: Bleu Moderne
- England: Terrace Rose Abstract
- Spain: La Roja Rhythm
- Morocco: Atlas Pulse
- Japan: Rising Motion

Each concept includes motif, print copy, alternate copy, colors, and a no-official-branding disclaimer.

The repository now also includes a `designs/` asset library. It contains team concept images, generated shirt design mockups for Argentina, Brazil, France, Japan, Morocco, Spain, and the United States, and a refined concept board. These assets are useful for visual direction and future POD handoff, but they are not final print files yet.

## Logo Exploration

The first logo pass for `winworldcup2026.com` explores three independent brand directions:

- Orbit/cup: a circular football orbit with a generic winner cup.
- Motion ball: a fast matchday prediction mark with a football and winner spark.
- Shield/globe: a more structured contest identity with a globe grid and generic cup.

The generated PNG board is saved as `designs/logos/logo-concept-board.png`. The usable source assets are SVG files in `designs/logos/` so the wordmark text stays exact and editable.

This pass avoids official tournament symbols, federation marks, sponsor marks, mascot art, player likenesses, and official trophy silhouettes.

The selected direction is Variation B, the motion-ball mark. It is copied to `src/assets/winworldcup2026-logo.svg` and now appears in the top navigation as the active website logo.

## Print-On-Demand And Sponsor Package Research

The print-on-demand research led to a practical split:

- Use Gelato first for global-local winner T-shirts.
- Use Printful when branded control, mockups, webhooks, and light warehousing matter more.
- Treat Printify as a cost lever, not the main operational backbone.
- Use a separate 3PL or kitting partner for real sponsor product packages.

The key learning: POD pack-ins are not a substitute for real sponsor-product fulfillment. Sponsor boxes need inventory receiving, SKU controls, customs handling, tracking, and delivery events.

## Stripe Projects And Infrastructure

Projects.dev, also known as Stripe Projects, was researched for project operations. It is useful for provisioning and managing development infrastructure, credentials, providers, and spend limits.

Current external project status from the sub-agent:

- `World Cup` Projects.dev project exists.
- Stripe Projects auth works.
- Neon free plan is provisioned.
- Neon Postgres service exists as `primary-db`.
- WorkOS AuthKit sandbox service exists as `auth`.
- PostHog account is linked, but its service setup is incomplete.
- Vercel is blocked by Vercel-side signup verification.
- Cloudflare, Sentry, and spend limits are not configured yet.

Projects.dev should support the build stack. It should not be treated as the contest, payment, compliance, fulfillment, or vendor-payment system.

## Impeccable-Inspired Design Pass

The site was later refined using `https://impeccable.style/designing/` as a design workflow reference.

The useful lesson was not to clone the visual style. The useful lesson was to document product/design context and then use that context to tighten the layout.

That pass added:

- `PRODUCT.md`
- `DESIGN.md`
- desktop workflow rail
- cleaner product-state empty copy
- corrected section anchors
- stronger matchday operations framing

The workspace now has a clearer flow:

1. Predict
2. Draw
3. Personalize
4. Fulfill
5. Review

## Verification So Far

The project has been verified with:

```bash
npm run lint
npm run build
```

Browser checks have covered:

- team switching
- prediction selection
- score inputs
- lock state
- draw application receipt creation
- seeded match draw
- winner rendering
- participant outcome rendering
- public seed, commitment, and audit hash display
- winner reveal layout at the medium breakpoint
- fulfillment queue actions
- review prompt actions
- workflow rail copy
- console error checks

Current visual artifact:

`artifacts/worldcup-draw-mechanism.png`

## Commit Timeline

### `1d190e6` - Initial World Cup predictor prototype

Built the first working React prototype with supporter team theming, predictions, seeded draws, reward previews, T-shirt concepts, provider recommendations, and the initial build log in `AGENTS.md`.

### `d2592fe` - Enhance product layout with design workflow

Added the Impeccable-inspired design workflow, `PRODUCT.md`, `DESIGN.md`, persistent workflow rail, cleaner empty states, and updated verification artifacts.

### `fe5d615` - Add build blog artifact

Added this file so the build can be turned into a public article over time. Also updated the project workflow so future commits update both `AGENTS.md` and this blog artifact.

### `90949f6` - Build participant draw mechanism

Added receipt-based draw application, participant outcomes, deterministic seeded winner and alternate ranking, audit metadata, animated draw presentation, and lifecycle status updates for fulfillment and review prompts.

### `f8e58c1` - Add localized shirt design assets

Committed the generated shirt concept and design image library under `designs/`, and documented that these files are visual direction assets rather than production POD artwork.

### Current commit - Add logo variations

Added three SVG logo variations and a generated concept board for `winworldcup2026.com`, with documentation clarifying that the assets are independent brand explorations.

### Current commit - Select motion-ball logo

Selected Variation B as the active website logo, copied it into `src/assets/`, and replaced the original temporary trophy icon in the header brand.

## Next Build Steps

The prototype needs several production layers before it can become a real campaign:

- database persistence for users, predictions, draws, shipments, and reviews
- authentication through WorkOS or another provider
- official rules, no-purchase route, age/location eligibility, and compliance review
- admin tooling for sponsors, matches, product SKUs, and fulfillment batches
- real POD integration for T-shirt orders
- real 3PL/kitting integration for sponsor boxes
- analytics events for prediction, draw, claim, delivery, and review funnels
- mobile and tablet visual verification

## Maintenance Rule

Every commit should update this file with:

- what changed
- why the change was made
- which files or systems were affected
- what verification was run
- what the next relevant build step is
