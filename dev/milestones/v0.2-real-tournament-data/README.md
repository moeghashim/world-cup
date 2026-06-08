# v0.2 Real Tournament Data

## Definition Of Done

v0.2 replaces the Floodlights sample tournament with real World Cup 2026 static
data from openfootball/worldcup.json and enforces kickoff locks. It does not add
live results, scoring, standings, provider polling, hosts, or prizes.

Done means:

- openfootball 2026 data is verified and vendored server-side only.
- Neon has seeded `teams` and `matches` data for the real 48 teams, actual
  12-group draw, and full 104-match fixture schedule.
- A repeatable seed/refresh script can validate and upsert the dataset.
- The client reads tournament data through our API/cache, not from
  openfootball at runtime.
- `src/floodlights/data.ts` no longer owns the sample teams/groups or
  illustrative `R32_TEMPLATE`; it consumes the real structure.
- Group picks and score predictions are server-rejected after their own match
  kickoff.
- The whole knockout bracket is server-rejected after the first tournament
  match kickoff.
- Tests cover seed counts and kickoff-lock behavior.
- Browser QA records English + Arabic RTL and dark + light coverage for real
  teams/draw/fixtures, plus rejected past-kickoff and accepted upcoming picks.

## Source And Lock Rules

- Static source: `openfootball/worldcup.json`, `2026/worldcup.json`, CC0.
- Runtime source: our Neon/cache through `/api/data/fixtures`.
- Per-match group picks and score predictions lock at the relevant match
  kickoff.
- Whole knockout bracket locks at the first tournament match kickoff.

## Out Of Scope

- Live result provider integration.
- Live scores or scoring engine.
- Standings computation.
- Prize/address flows.
- Host pages.
