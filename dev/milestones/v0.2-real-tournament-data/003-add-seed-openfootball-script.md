---
id: 003-add-seed-openfootball-script
title: Add openfootball seed and refresh script
status: planned
files: ["scripts/seed-openfootball.ts", "package.json", "BUILD_BLOG.md", "AGENTS.md"]
---

## Acceptance Criteria

- [ ] Parse the vendored openfootball JSON into normalized teams, groups, and
  matches.
- [ ] Convert openfootball local `UTC±offset` kickoff strings into ISO UTC.
- [ ] Upsert teams and matches into Neon using `PRIMARY_DB_CONNECTION_STRING`.
- [ ] Support a verification/dry-run mode for tests and CI without requiring
  database writes.
- [ ] Produce clear counts for teams, groups, group fixtures, and total fixtures.

## Notes

The script is the refresh path for static tournament data. It should not depend
on any new secrets.
