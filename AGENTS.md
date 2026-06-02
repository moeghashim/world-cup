# World Cup Predictor Build Log

This document is the project artifact for how the product is being built. Update it after each meaningful task, then commit the code and documentation together when the work is coherent.

## Working Agreement

- Keep product logic deterministic for predictions, draws, eligibility, shipping, reviews, and compliance.
- Use JSON-render as a constrained presentation/spec layer, not as the source of truth for prize or fulfillment logic.
- Keep team personalization token-driven through CSS variables and typed team data.
- Maintain `PRODUCT.md` and `DESIGN.md` when product or design direction changes.
- Maintain `BUILD_BLOG.md` on every commit so it can become the public build article.
- Update the AI build disclosure total token estimate and API-equivalent estimated cost in `src/App.tsx` and `BUILD_BLOG.md` on every commit.
- Avoid official FIFA, tournament, federation, player, and sponsor marks unless the project has rights.
- After finishing a task: update this file and `BUILD_BLOG.md`, run verification, and commit.

## Current Stack

- Vite + React + TypeScript.
- `@json-render/core` and `@json-render/react` for the spec-driven product surface.
- `zod` for catalog props/action schemas.
- `lucide-react` for interface icons.
- Google Analytics gtag for page-view tracking, with the static homepage snippet using `G-RFPJRPKYQR` and `VITE_GA_MEASUREMENT_ID` reserved for the runtime fallback path.
- Optimized raster stadium hero loaded from `src/assets/world-cup-hero.jpg`.

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

The app also exposes an `/experiment` page from the footer. That page imports `BUILD_BLOG.md`, `AGENTS.md`, `PRODUCT.md`, `WEBSITE_FLOW.md`, and `DESIGN.md` as raw markdown so the build process is visible inside the website experience.

Public navigation now uses page-style paths instead of hash fragments:

- `/fixtures`
- `/teams`
- `/draws`
- `/prizes`
- `/prizes/:team`
- `/shirts`
- `/sponsors`
- `/rewards`
- `/operations`
- `/posthog`
- `/experiment`

Legacy hash URLs such as `/#experiment`, `/#operations`, and `/#prizes/japan` are normalized to their page paths in the browser. `vercel.json` rewrites direct route requests back to the Vite app entry so deployed page refreshes resolve correctly.

Google Analytics is present as the canonical GA4 snippet in `index.html` so it is visible in the homepage HTML source. `src/analytics.ts` remains as a runtime fallback, but it now exits when the static snippet has already defined `window.gtag` so the app does not duplicate the initial GA config call. SPA route changes should be tracked by GA4 Enhanced Measurement when "Page changes based on browser history events" is enabled on the web data stream.

The JSON-render layer lives in `src/jsonRender/predictionCatalog.tsx`. It defines a domain catalog with components like `MatchBoard`, `DrawControl`, `ShirtStudio`, `FulfillmentPipeline`, and `ProviderPlan`. The JSON spec controls section composition while registered actions call deterministic state updates.

The data layer lives in `src/data/worldCup.ts` and includes:

- supporter team themes
- demo matches
- deterministic demo results
- community entries for seeded draw simulation
- localized T-shirt concepts
- provider recommendations

The tournament schedule snapshot lives in `src/data/worldCupSchedule.ts` and includes:

- all 48 teams grouped from A through L
- 72 group-stage fixtures with match number, date, ET kickoff time, venue, home team, and away team
- a helper for the selected supporter team's group-stage schedule
- dated source metadata and a verification warning for real prize campaigns

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

Public build attribution: this project is being built with [Codex](https://chatgpt.com/codex) Desktop App by OpenAI and [projects.dev](https://projects.dev/) by Stripe without writing a single line of code. Keep that attribution in the footer-linked Experiment view and documentation, not in the default homepage experience.

### Google Analytics

References: https://developers.google.com/analytics/devguides/MCP and https://developers.google.com/analytics/devguides/collection/ga4

The Google Analytics MCP path is useful for read/reporting workflows, but account and property setup still happened through the Google Analytics UI for this project. The user-created GA4 web stream measurement ID is `G-RFPJRPKYQR`.

Implementation position: use GA4 only for page-view tracking in the prototype. Keep GA4 Enhanced Measurement history tracking enabled for page-style SPA routes. Add explicit product funnel events later for prediction starts, locked receipts, draw entries, winner reveals, fulfillment claims, and review prompts.

### PostHog

References: https://posthog.com/docs/product-analytics/dashboards and https://posthog.com/docs/libraries/js

The Projects.dev state includes a completed PostHog account link, the earlier `analytics` resource, and the new `worldcup2026-analytics` analytics project resource created specifically for `winworldcup2026.com`. The earlier `analytics` resource is removed from the default Projects.dev environment so future site wiring should use only `worldcup2026-analytics`. The in-app `/posthog` page is now the dashboard contract for the real PostHog implementation: acquisition, prediction conversion, draw reveal, prize claim, sponsor review, and fulfillment metrics.

Implementation position: keep personal API keys server-side only. When SDK capture is enabled, map the frontend-safe values from `WORLDCUP2026_ANALYTICS_API_KEY` and `WORLDCUP2026_ANALYTICS_HOST` into browser-exposed Vite env variables. Keep `WORLDCUP2026_ANALYTICS_PERSONAL_API_KEY` server-side only. The current page does not send PostHog events yet.

## T-Shirt Design System

Localized supporter shirt concepts are independent fan designs, not official jerseys. Each concept includes:

- concept name
- motif
- base/graphic/accent colors
- safe print copy
- disclaimer that no official team, tournament, sponsor, or player branding is used

Current concepts cover Brazil, Argentina, United States, France, England, Spain, Morocco, and Japan.

Design assets are now stored under `designs/`. The folder includes concept images for the supported teams, generated shirt design mockups for Argentina, Brazil, France, Japan, Morocco, Spain, and the United States, plus a refined concept board. These are visual direction assets, not final POD print files.

Logo explorations for `winworldcup2026.com` live in `designs/logos/`. The current set includes three SVG variations: orbit/cup, motion ball, and shield/globe. The user-provided `worldcup-logo-attached.svg` is now selected and copied into `src/assets/winworldcup2026-logo.svg` as the active website header logo. The generated PNG board is a concept reference; the SVG files are the editable usable assets. The active logo still needs final legal/IP review before launch.

Runtime website images in `src/assets/` are optimized JPEG exports for page performance. The original full-size PNG design sources remain in `designs/` for future design iteration and POD artwork prep.

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
- Added a dated tournament snapshot section with all 48 teams, 12 groups, 72 group-stage fixtures, selected supporter-team schedule highlights, source metadata, and a FIFA verification link.
- Replaced the active website logo with the user-provided attached SVG and preserved it under `designs/logos/worldcup-logo-attached.svg`.
- Added a footer-linked Experiment section that renders the project documentation files and labels the site as an experiment from `10claws.com`.
- Increased the active header logo by 20%, from 68px to 82px, and adjusted the sticky topbar height to 100px.
- Added visible build attribution for Codex Desktop App and `https://projects.dev/` in the Experiment section, footer, and project documentation.
- Moved technical build attribution and documentation off the default homepage into the footer-linked Experiment view so the homepage stays focused on matches, prizes, and winners.
- Added a homepage prize section and hash-addressable team prize detail pages using the generated localized shirt mockups.
- Added sponsor package pricing and activation details for reward-funded campaigns.
- Added `WEBSITE_FLOW.md` with Mermaid diagrams for the visitor journey, app architecture, draw mechanism, tool stack, and planned production integrations.
- Updated the homepage supporter picker heading from "Choose Your Theme" to "Choose Your Team" so the public copy focuses on team choice rather than implementation theming.
- Updated the Experiment view build attribution to link Codex and projects.dev and describe the no-code build process.
- Updated the header logo link to navigate to `/` so it clears hash routes like `#experiment` and returns to the homepage without a fragment.
- Replaced hash-fragment navigation with page-style URLs for fixtures, teams, prizes, sponsors, rewards, operations, and Experiment. Added focused route rendering for `/operations`, `/experiment`, `/prizes`, `/prizes/:team`, `/sponsors`, and the JSON-render section pages, plus a Vercel rewrite for direct route refreshes.
- Increased the active header logo by another 20%, from 82px to 98px, and adjusted the sticky topbar height from 100px to 120px.
- Redesigned `/experiment` to remove the old multi-document grid, render `BUILD_BLOG.md` as a polished HTML article, keep `AGENTS.md` as the raw agent-log markdown file, and add a technology flowchart for Codex, GitHub, Vercel, React/TypeScript, JSON-render, Stripe Projects, and planned providers.
- Added a site-wide AI build disclosure banner that says the project was built entirely by AI and shows the current estimated total tokens plus API-equivalent estimated cost.
- Activated Google Analytics page-view tracking for the user-created GA4 web stream `G-RFPJRPKYQR`, with a `VITE_GA_MEASUREMENT_ID` override for future environment-specific streams.
- Moved the AI build disclosure into a compact top status bar above the logo and primary navigation, with sticky header offsets updated for the combined status bar and logo header.
- Reduced the active header logo by 20%, from 98px to 78px, and lowered the logo/navigation header row from 120px to 100px.
- Added a `/posthog` dashboard page with metric cards, prediction funnel steps, event taxonomy, setup checklist, PostHog link, header/footer navigation, and legacy `#posthog` redirect support.
- Added a working rule to refresh the AI build disclosure token total and estimated cost on every commit, and updated the current estimate to `~2.9M` total tokens and `~$22`.
- Made the `/posthog` route easier to find by labeling the header and footer links as "PostHog Dashboard" and refreshed the AI build estimate to `~3.0M` total tokens and `~$23`.
- Provisioned a new Projects.dev PostHog analytics project resource named `worldcup2026-analytics`, updated `/posthog` to show that resource instead of the earlier generic dashboard target, and refreshed the AI build estimate to `~3.1M` total tokens and `~$24`.
- Removed the earlier `analytics` PostHog resource from the default Projects.dev environment so the website has a single active PostHog analytics resource, updated `/posthog` copy to say that explicitly, and refreshed the AI build estimate to `~3.2M` total tokens and `~$25`.
- Moved the GA4 `G-RFPJRPKYQR` tag into the static `index.html` head, kept the runtime analytics initializer as a no-duplicate fallback, and refreshed the AI build estimate to `~3.3M` total tokens and `~$26`.
- Converted the runtime hero and prize shirt assets from large PNGs to display-sized JPEGs, removed the old runtime PNG copies, and refreshed the AI build estimate to `~3.4M` total tokens and `~$27`.

## Verification

Latest successful commands:

```bash
npm run lint
npm run build
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
- verifying the teams/schedule section renders 12 group cards and 72 group-stage fixture rows
- verifying the supporter schedule updates from Brazil to Japan after switching supporter team
- checking the schedule screenshot after fixing sticky-header anchor offset and compact fixture wrapping
- verifying the attached logo renders in the header at 82px inside the 100px topbar
- verifying the footer Experiment link jumps to the documentation section and the imported markdown files render
- verifying the Codex Desktop App and `projects.dev` build attribution renders in the Experiment view
- verifying the default homepage no longer renders Codex Desktop App, `projects.dev`, or build-documentation copy
- verifying the homepage prize section renders eight team prize cards with the selected supporter shirt feature
- verifying `#prizes/japan` renders the team prize detail page and mobile layout without horizontal overflow
- verifying sponsor package additions with lint and production build
- verifying `WEBSITE_FLOW.md` is imported into the Experiment documentation list
- verifying the homepage supporter picker renders "Choose Your Team"
- verifying the Experiment view renders the updated Codex and projects.dev attribution links
- verifying the header logo link points to `/`
- verifying `/operations`, `/experiment`, `/prizes`, `/prizes/japan`, `/sponsors`, and legacy `/#operations` or `/#experiment` load without `#` fragments
- verifying header navigation changes URLs client-side while preserving app state
- verifying the attached logo renders at 98px inside the 120px topbar
- verifying `/experiment` renders the build blog article, removes the old docs grid, keeps the agent log markdown file, and shows the technology flowchart nodes
- verifying the AI build disclosure banner renders on the homepage with the estimated token total and cost
- verifying the Google Analytics gtag script is injected with `G-RFPJRPKYQR`, `/operations` navigation works, and the browser reports no console errors
- verifying the AI build disclosure renders above the logo as the sticky top status bar on desktop, with compact mobile CSS rules updated for narrow screens
- verifying the smaller 78px logo renders below the AI status bar with the updated 100px navigation row
- verifying `/posthog` renders four metric cards, six funnel steps, five event groups, five setup items, no horizontal overflow, a working PostHog external link, and legacy `/#posthog` redirect behavior
- verifying the AI build disclosure renders the refreshed `~2.9M` token total and `~$22` estimated cost with no browser console errors
- verifying the header and footer both expose "PostHog Dashboard" links to `/posthog`, and the AI build disclosure renders the refreshed `~3.0M` token total and `~$23` estimated cost
- verifying Projects.dev status shows `worldcup2026-analytics` as a completed PostHog analytics resource in the default environment
- verifying `/posthog` shows the `worldcup2026-analytics` resource card, the three Projects.dev env var names, the refreshed `~3.1M` token total and `~$24` estimated cost, no old `https://us.posthog.com/dashboard` link, no horizontal overflow, and no browser console errors
- verifying Projects.dev status shows the earlier `analytics` PostHog resource has no environments while `worldcup2026-analytics` remains active in the default environment
- verifying `/posthog` shows the single-active-resource copy, the refreshed `~3.2M` token total and `~$25` estimated cost, no horizontal overflow, and no browser console errors
- verifying `npm ls posthog-js` is empty and tracked source has no PostHog init/capture calls or hardcoded project tokens
- verifying `index.html` contains the static GA4 `G-RFPJRPKYQR` snippet and the runtime initializer exits when `window.gtag` already exists
- verifying the served homepage HTML contains the pasted GA4 snippet and the browser DOM has exactly one `googletagmanager.com/gtag/js?id=G-RFPJRPKYQR` script with no console errors
- verifying the optimized homepage hero and prize shirt runtime images resolve to `.jpg`, the refreshed `~3.4M` token total and `~$27` estimated cost render in the AI build disclosure, `/prizes/japan` loads the optimized shirt image, there is no horizontal overflow, and there are no browser console errors

Latest screenshot:

`artifacts/asset-cleanup-homepage.png`
`artifacts/asset-cleanup-prize-japan.png`

## Next Tasks

- Add real persistence for users, predictions, draws, shipments, and reviews.
- Add authentication and user profiles.
- Add official rules/no-purchase/eligibility disclosures before any real prize campaign.
- Add admin tooling for sponsor campaigns, product SKUs, and fulfillment batches.
- Integrate a real POD provider API behind server-side actions.
- Design production shirt artwork files or outsource design refinements.
- Replace the prototype schedule snapshot with an official data feed or maintained admin import before launch.
- Add responsive visual verification for mobile and tablet breakpoints.

<!-- stripe-projects-cli managed:agents-md:start -->
## Stripe Projects CLI

This repository is initialized for the Stripe project "World Cup".

## Tools used

- [Stripe CLI](https://docs.stripe.com/stripe-cli) with the `projects` plugin to manage third-party services, credentials, and deployments for this project. Use the stripe-projects-cli to manage deploying and access to third party services.
<!-- stripe-projects-cli managed:agents-md:end -->
