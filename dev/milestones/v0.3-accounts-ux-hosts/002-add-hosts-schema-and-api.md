---
id: 002-add-hosts-schema-and-api
title: Add hosts schema and API
status: done
files:
  - "db/migrations/004_hosts.sql"
  - "db/schema.sql"
  - "db/types.ts"
  - "api/_lib/hosts.ts"
  - "api/hosts/index.ts"
  - "api/hosts/join.ts"
  - "api/hosts/[slug].ts"
  - "scripts/dev-api.ts"
  - "tests/v0.3-accounts-ux-hosts.test.ts"
---

## Acceptance Criteria

- [x] `hosts` and `host_members` tables support unique slug, unique join code,
  owner user, and many-to-many membership.
- [x] `POST /api/hosts` creates a host for an authenticated user with a handle
  and returns slug, public URL path, join link path, and code.
- [x] `POST /api/hosts/join` accepts slug or code, is auth-gated, upserts
  membership, and supports joining multiple hosts.
- [x] `GET /api/hosts/:slug` returns handle-only public host data with no email
  or address fields.
- [x] Host points are placeholder `0` until v0.4 scoring, recorded in
  `dev/open-questions.md`.
