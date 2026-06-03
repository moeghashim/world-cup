# Homepage Live Banner PRD

## Summary

Make the homepage prediction banner feel alive. The banner should still be a usable prediction surface first, but it should feel like matchday is happening now: active fixture motion, team color energy, score reactions, countdown/status strips, sponsor/prize urgency, and an upcoming-match rail that changes the scene without leaving the first viewport.

Assigned implementation agent: Live Banner Worker.

This PRD complements `HOMEPAGE_PREDICTION_BANNER_PRD.md`. That broader PRD defines capture, persistence, full-address entry, and prize/sponsor data requirements. This PRD focuses on the visual and interaction layer that makes the banner exciting.

## Problem

The current homepage hero is static. It has a stadium image, broad copy, and buttons, but it does not create urgency or invite immediate play. The score prediction UI exists lower on the page, so the first impression feels like a landing page instead of a match prediction product.

The new first viewport should make a visitor feel:

- the next match is imminent
- their score prediction changes the scene
- other matches are available right now
- prizes and sponsors are tied to the selected fixture
- locking a prediction is the natural next move

## Goals

- Turn the first viewport into an animated matchday prediction arena.
- Make score changes visually satisfying without feeling like gambling.
- Let fixture selection visibly change teams, color accents, prize panel, and match metadata.
- Keep the UI clear, fast, and usable on mobile.
- Respect reduced-motion preferences.
- Avoid official marks while still feeling country- and match-inspired.

## Non-Goals

- Do not build the database or address-entry persistence in this PRD.
- Do not add slot-machine, roulette, odds-board, or betting-style mechanics.
- Do not create official crests, tournament marks, federation marks, player marks, mascots, or sponsor logos without rights.
- Do not block prediction entry behind decorative animation.

## Experience Concept

Working title: **Matchday Pulse**

The hero is a full-width first-viewport arena with three visible layers:

1. **Atmosphere Layer**
   - stadium image remains as a photographic base
   - subtle moving light sweep
   - team-color edge glow based on selected fixture/supporter team
   - nonessential animation disabled under `prefers-reduced-motion`

2. **Prediction Layer**
   - large fixture matchup
   - score controls
   - predicted outcome label
   - lock/enter CTA
   - score-change pulse or flip animation

3. **Match Context Layer**
   - countdown/status strip
   - prize bundle preview
   - sponsor placement
   - joined count
   - upcoming match rail

## First View Layout

Desktop layout:

- Left/center: large prediction board
  - match number and group
  - home team
  - away team
  - two score tiles
  - predicted outcome
  - lock prediction CTA
- Right: prize and sponsor module
  - prize bundle title
  - 5-10 winner slots
  - joined count
  - three prize item chips
  - sponsor placeholder
- Bottom of hero: upcoming match rail
  - next 5-8 fixtures
  - active fixture state
  - keyboard-scrollable controls

Mobile layout:

1. match metadata
2. team matchup and score controls
3. lock prediction CTA
4. compact prize module
5. horizontal upcoming match rail

The score controls and CTA must appear before sponsor details on mobile.

## Motion Requirements

Use restrained UI motion, not spectacle.

Required:

- Score tile pulses or briefly flips when a score changes.
- Active match rail item slides/fades into active state.
- Team color accent changes smoothly when match/supporter context changes.
- Prize panel uses a soft reveal when fixture changes.
- Countdown/status strip updates without layout shift.

Optional:

- Stadium light sweep across background.
- Small receipt stub or ticket edge animation after lock.
- Sponsor product chips stagger in when fixture changes.

Reduced motion:

- Disable all loops and transforms.
- Keep color/state changes immediate.
- Preserve all information.

## Visual Language

- Use the existing stadium hero image as the base.
- Use CSS gradients, overlays, color fields, and layout motion rather than generated SVG illustrations.
- Team representation should use team names, country names, codes, colors, and abstract fan energy.
- Sponsor placement should be visually separate from team theming.
- Avoid excessive dark overlays that make the UI hard to scan.
- Avoid one-note color floods; keep neutral surfaces for controls.

## Interaction Requirements

- Selecting a fixture from the match rail updates:
  - matchup
  - score state
  - kickoff/venue metadata
  - predicted outcome label
  - prize bundle preview
  - sponsor panel
  - analytics event `homepage_match_selected`
- Editing score updates:
  - score tile
  - predicted outcome
  - current pick summary
  - analytics event `score_changed`
- Clicking lock:
  - opens the entry capture flow defined in `HOMEPAGE_PREDICTION_BANNER_PRD.md`
  - does not permanently lock until capture succeeds
  - may show a temporary visual receipt state while form opens

## Sponsor And Prize Placement

The live banner should reserve a real sponsor/prize area now, even if the first implementation uses placeholder data.

Required fields:

- sponsor display name or `Sponsor this match`
- prize bundle title
- winner slots
- joined count
- top prize items
- note: sponsors may choose to gift more entrants

The panel should feel like a prize collection attached to the selected fixture, not a generic ad.

## Data Inputs

Use existing sources first:

- `worldCupFixtures` for match list, venue, date, time, group, teams
- existing `teamThemes` for supported team colors where teams are in the current theme list
- existing shirt concept data where available
- static placeholder sponsor/prize bundle data until the broader persistence/data PRD is implemented

If a fixture team does not exist in `teamThemes`, use tournament team code plus neutral fallback colors.

## Analytics

Use the existing `captureAnalyticsEvent` helper.

Do not send address data, full phone number, or other sensitive entry fields.

Events:

- `homepage_match_selected`
- `score_changed`
- `prediction_started`
- `prediction_entry_opened`
- `prize_bundle_viewed`

Recommended properties:

- `surface: homepage_live_banner`
- `match_number`
- `home_team`
- `away_team`
- `group`
- `kickoff_date`
- `predicted_home_score`
- `predicted_away_score`
- `predicted_outcome`
- `prize_bundle_id`
- `sponsor_campaign_id`

## Accessibility

- Score controls must be buttons/inputs with accessible labels.
- Match rail must be keyboard navigable.
- Active match must be exposed through `aria-pressed` or equivalent.
- Live motion must not trap focus.
- No flashing, fast strobing, or rapidly repeating effects.
- Respect `prefers-reduced-motion`.
- Text contrast must pass on every team theme.

## Implementation Notes

Recommended code shape:

- Extract the first-viewport hero into `HeroPredictionArena`.
- Extract reusable pieces:
  - `HeroScoreboard`
  - `HeroMatchRail`
  - `HeroPrizePanel`
  - `HeroMatchStatus`
- Move or remove the lower duplicate `next-score-band` after the hero becomes the primary prediction surface.
- Keep shared score helpers such as `getSoonestUpcomingFixtureDay`, `getFixturePrediction`, `updateFixtureScorePrediction`, and `getFixtureAnalyticsProperties`.
- Avoid broad refactors of JSON-render catalog logic unless required.

## Acceptance Criteria

- Homepage first viewport is no longer a static marketing banner.
- Visitor can predict the selected match without scrolling on desktop.
- Match rail changes the active hero fixture.
- Score changes trigger a visible, restrained response.
- Prize/sponsor panel changes with selected match.
- Mobile layout keeps score controls and CTA before sponsor context.
- Reduced-motion mode disables decorative motion.
- No official/team/federation/tournament marks are introduced.
- `npm run lint` passes.
- `npm run build` passes.
- Browser verification covers desktop and mobile first viewport.

## Open Decisions

- Whether to keep the AI build disclosure status bar above the hero for public launch.
- Whether countdown should be exact live countdown or a static status string until official schedule data is finalized.
- Whether match rail should show all same-day fixtures or a rolling next 8 fixtures.
- Whether fixture-specific prize bundles should be stored in static data first or introduced with the database work.
