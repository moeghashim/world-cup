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

## Tournament Teams And Schedule Snapshot

The app now has a real tournament snapshot section instead of hiding team and fixture context behind the prediction cards.

The schedule data lives in `src/data/worldCupSchedule.ts` and is intentionally typed:

- 48 teams grouped from A through L
- 72 group-stage fixtures
- match number, date, ET kickoff time, venue, home team, and away team
- source metadata dated 2026-06-02
- a helper that returns the selected supporter team's group fixtures

The UI renders this inside the JSON-render product surface as `TournamentSchedule`. It shows three things:

- a source snapshot panel with a FIFA schedule verification link
- a highlighted schedule for the selected supporter team
- all groups and the full group-stage fixture list

This is still a prototype data boundary. The product should replace the snapshot with an official data feed or maintained admin import before any real prize campaign, because schedule changes and source corrections would directly affect prediction eligibility.

## Why JSON-render Is Used Carefully

The project uses `@json-render/core` and `@json-render/react`, but only as a constrained presentation layer.

The important boundary is this:

- JSON-render controls section composition and registered UI actions.
- React and typed domain code own prediction, draw, fulfillment, and review state.

That split came from the design study. JSON-render is useful for catalog-first UI, generated modules, and controlled layout variation. It is not the right source of truth for anything involving prizes, eligibility, audit trails, fulfillment, or compliance.

The JSON-render catalog lives in `src/jsonRender/predictionCatalog.tsx`. It defines product-specific components:

- `MatchBoard`
- `TournamentSchedule`
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

The selected direction later changed from Variation B to a user-provided attached SVG. That file is preserved as `designs/logos/worldcup-logo-attached.svg`, copied to `src/assets/winworldcup2026-logo.svg`, and now appears in the top navigation as the active website logo.

The active logo still needs final legal/IP review before launch, especially because contest and tournament-adjacent branding can create avoidable trademark risk.

## Experiment Page And Public Build Notes

The site now includes a footer-linked `Experiment` view. It imports the project documentation files as raw markdown and renders them as readable panels inside the website:

- `BUILD_BLOG.md`
- `AGENTS.md`
- `PRODUCT.md`
- `WEBSITE_FLOW.md`
- `DESIGN.md`

This makes the process artifact part of the product experience, not just a repository file. The Experiment view notes that the project is being built with [Codex](https://chatgpt.com/codex) Desktop App by OpenAI and [projects.dev](https://projects.dev/) by Stripe without writing a single line of code, while the default homepage stays focused on matches, prizes, and winners. The `WEBSITE_FLOW.md` artifact adds Mermaid diagrams for the visitor journey, app architecture, draw mechanism, and tools used.

`BUILD_BLOG.md` remains the file that is updated on every commit. It is the running public article for how the project is being built.

## From Hash Anchors To Page Routes

The navigation moved from hash fragments such as `/#operations` and `/#prizes/japan` to page-style URLs:

- `/fixtures`
- `/teams`
- `/draws`
- `/prizes`
- `/prizes/japan`
- `/shirts`
- `/sponsors`
- `/rewards`
- `/operations`
- `/experiment`

The React app still owns the interactive prediction state, but internal links now push real paths into browser history instead of changing `window.location.hash`. That keeps predictions and draw state alive while visitors move between pages. Direct page refreshes are supported by a Vercel rewrite in `vercel.json`, and legacy hash URLs are normalized to the new paths for backward compatibility.

This gives the site cleaner public URLs and lets pages like `/operations`, `/experiment`, `/prizes`, `/prizes/:team`, and `/sponsors` render as focused views instead of appended homepage sections.

## Experiment Page Redesign

The Experiment page was simplified after the site moved to page routes. Instead of showing every project document as a card, it now has one primary artifact: the build blog itself.

The page renders `BUILD_BLOG.md` as a structured HTML article with headings, paragraphs, lists, links, inline code, and code blocks. The agent log stays available as `AGENTS.md`, but it is kept as a raw markdown file in a collapsible panel rather than competing with the article.

The old page/document flow diagram was replaced with a technology flowchart. That flow focuses on how the app is built and operated:

- Codex Desktop App
- GitHub
- Vercel
- React + TypeScript
- JSON-render
- Stripe Projects
- planned providers such as PostHog, WorkOS, Neon, POD, and 3PL

The point is to explain the build stack and production path, not to repeat the public page navigation.

## AI Build Disclosure Banner

The site now includes a compact notification status bar at the very top of the page, above the logo and main navigation. It says the project was built entirely by AI and shows a public usage estimate:

- estimated total tokens: `~2.4M`
- estimated API-equivalent cost: `~$18`

The banner labels the cost as an estimate because the repository does not contain a complete token-by-token billing export for every Codex, sub-agent, tool, and image generation step. The number is a transparent project estimate, not a billing receipt.

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
- teams/schedule section with 12 group cards and 72 fixture rows
- supporter schedule switching from Brazil to Japan
- sticky-header anchor offset and compact fixture-card wrapping
- attached logo rendering in the header after resizing the topbar logo slot, including the later 20% logo increase
- footer Experiment link, imported markdown panels, 10claws.com attribution, and homepage checks that keep Codex Desktop App plus projects.dev attribution out of the default match experience
- Experiment documentation panel import for `WEBSITE_FLOW.md`
- page-path routes for `/operations`, `/experiment`, `/prizes`, `/prizes/japan`, and `/sponsors`
- legacy hash URL normalization from `/#experiment` and `/#operations` to page paths
- header navigation between page paths while preserving app state
- attached logo rendering at 98px inside the 120px topbar
- Experiment page redesign with the Build Blog HTML article, AGENTS.md raw log, and technology flowchart
- AI build disclosure banner with estimated total tokens and API-equivalent cost
- Google Analytics script injection with `G-RFPJRPKYQR` and GA4 Enhanced Measurement guidance for page routes
- AI build disclosure moved above the logo as a top status bar

Current visual artifact:

`artifacts/ai-statusbar-banner.png`

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

### `d9a1b1e` - Add logo variations

Added three SVG logo variations and a generated concept board for `winworldcup2026.com`, with documentation clarifying that the assets are independent brand explorations.

### `174695a` - Select motion-ball logo

Selected Variation B as the active website logo, copied it into `src/assets/`, and replaced the original temporary trophy icon in the header brand.

### `3613fde` - Add tournament schedule snapshot

Added a typed tournament schedule snapshot, a JSON-render schedule section, all teams grouped from A through L, 72 group-stage fixture rows, and selected-team schedule highlights tied to supporter mode.

### `198b22f` - Use attached logo

Replaced the active website logo with the user-provided attached SVG, preserved the source under `designs/logos/`, and verified the SVG and app build.

### `5c56fa7` - Add experiment documentation page

Added a footer-linked Experiment section that renders the project documentation files in the app and labels the site as an experiment from `10claws.com`.

### `01248ac` - Increase attached logo size

Increased the active header logo from 68px to 82px, kept the square SVG metadata aligned, and raised the sticky topbar to 100px so the larger logo keeps appropriate spacing.

### `4900917` - Add Codex Desktop and projects.dev attribution

Added visible attribution in the Experiment section and footer that this project is being built with Codex Desktop App and `https://projects.dev/`, then updated the product, design, and build documentation to keep the public build article aligned.

### `84868a9` - Add sponsor packages section

Moved the technical build attribution and documentation out of the default homepage flow. The footer still links to the Experiment view for build notes, but the homepage now stays centered on fixtures, predictions, prizes, and winner flows.

Added a dedicated prize section to the homepage and per-team prize detail pages at hashes such as `#prizes/japan`. The prize UI uses the generated localized shirt mockups from `src/assets/prizes/`, shows print direction and package details for each team, and keeps the independent-fan-design safety boundary visible.

Verification for this pass included `npm run lint`, `npm run build`, desktop browser checks for `#prizes` and `#prizes/japan`, and a mobile-width check confirming the prize grids/detail page have no horizontal overflow.

Added sponsor package pricing for Global Cup Partner, Matchday Featured Sponsor, and Fan Drop Sponsor campaigns, including winner review-video deliverables, product gift flow, add-ons, and compliance reminders.

### `f46f865` - Add website flow diagrams

Added `WEBSITE_FLOW.md` as a diagram-first explanation of how the website works, including visitor journey, app architecture, draw flow, tools used, and planned production integrations. The file is imported into the footer-linked Experiment view so the build documentation can be read inside the app without adding technical copy to the homepage.

### `eece039` - Rename supporter picker heading

Changed the homepage supporter picker heading from "Choose Your Theme" to "Choose Your Team" so visitors read the action as a team choice while the theme behavior stays behind the scenes.

### `99bc312` - Update Experiment build attribution

Changed the Experiment view attribution to say the project is being built with [Codex](https://chatgpt.com/codex) Desktop App by OpenAI and [projects.dev](https://projects.dev/) by Stripe without writing a single line of code.

### `0973091` - Point logo to homepage root

Changed the header logo link from an in-page section hash to `/` so clicking the logo always returns visitors to the homepage without leaving a `#` fragment in the URL.

### `9384db7` - Use page routes instead of hash navigation

Replaced public hash navigation with page-style paths for fixtures, teams, draws, prizes, sponsors, rewards, operations, and Experiment. Added focused route rendering for JSON-render sections, `/prizes`, `/prizes/:team`, `/sponsors`, and `/experiment`; preserved legacy hash URLs as redirects to clean paths; and added `vercel.json` so deployed direct page refreshes resolve correctly.

### `e6ebe78` - Increase attached logo again

Increased the active header logo by another 20%, from 82px to 98px, and raised the sticky topbar from 100px to 120px so the larger mark has matching spacing.

### `f1aef46` - Redesign Experiment build blog page

Removed the old multi-document Experiment grid. The page now renders `BUILD_BLOG.md` as the primary HTML article, keeps `AGENTS.md` as the agent-log markdown file, and adds a technology flowchart covering Codex, GitHub, Vercel, React/TypeScript, JSON-render, Stripe Projects, and planned production providers.

### `9e2160a` - Add AI build disclosure banner

Added a site-wide notification banner that says the project was built entirely by AI and displays estimated usage of `~2.4M` total tokens with an API-equivalent estimated cost of `~$18`.

### `9b4355a` - Activate Google Analytics page views

Added a small Google Analytics integration around the user-created GA4 web stream `G-RFPJRPKYQR`.

The app now loads `gtag.js` and runs the standard GA4 `config` command once when the React app starts. The website uses client-side page routes such as `/fixtures`, `/prizes/japan`, `/operations`, and `/experiment`, so the GA4 web stream should keep Enhanced Measurement enabled for "Page changes based on browser history events" to count virtual page views from the History API.

The measurement ID is committed as the prototype default, while `VITE_GA_MEASUREMENT_ID` can override it later for staging, production, or a replacement property. The Google Analytics MCP documentation was useful for understanding the tooling boundary, but account/property setup was handled manually in the Google Analytics UI before the measurement ID was wired into the site.

### Current commit - Move AI banner to top status bar

Moved the "Built entirely by AI" disclosure above the logo and primary navigation so it reads like a site status bar instead of a content banner. The sticky header now treats the AI status bar and logo/nav header as one chrome block, and the mobile layout keeps the disclosure compact by hiding the longer estimate note while preserving the token and cost values.

## Next Build Steps

The prototype needs several production layers before it can become a real campaign:

- database persistence for users, predictions, draws, shipments, and reviews
- authentication through WorkOS or another provider
- official rules, no-purchase route, age/location eligibility, and compliance review
- admin tooling for sponsors, matches, product SKUs, and fulfillment batches
- real POD integration for T-shirt orders
- real 3PL/kitting integration for sponsor boxes
- deeper analytics events for prediction starts, locked receipts, draw entries, winner reveals, claims, deliveries, and review prompts
- mobile and tablet visual verification

## Maintenance Rule

Every commit should update this file with:

- what changed
- why the change was made
- which files or systems were affected
- what verification was run
- what the next relevant build step is
