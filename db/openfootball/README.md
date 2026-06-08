# openfootball World Cup 2026 Snapshot

Vendored source:
`https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json`

Repository:
`https://github.com/openfootball/worldcup.json`

License:
CC0 1.0 Universal, per `LICENSE.md` in the upstream repository.

Verified on 2026-06-08:

- 104 total fixtures
- 72 group-stage fixtures
- 12 groups
- 48 group-stage teams

Runtime boundary:
the browser must not fetch this upstream file or import this vendored JSON
directly. Production and local clients read tournament fixtures through
`GET /api/data/fixtures`, backed by Neon or an explicit server-side static
fallback.

Freshness boundary:
openfootball states this data is manually maintained and not live. v0.2 uses it
as the static tournament seed, not as a live results provider.
