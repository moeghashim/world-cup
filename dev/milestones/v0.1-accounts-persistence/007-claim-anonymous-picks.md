---
id: 007
title: Claim anonymous picks after sign-in
milestone: v0.1-accounts-persistence
category: frontend
priority: high
files: ["src/floodlights/lib/accountMigration.ts", "src/floodlights/lib/storage.ts", "src/floodlights/pages/PickemPage.tsx", "src/floodlights/lib/apiClient.ts"]
---

## Acceptance criteria
- [ ] Existing `fl:bracket` and `fl:grouppicks` localStorage data migrate into the signed-in account once. (PRD S1: localStorage picks are migrated once)
- [ ] Migrated picks survive reload and a fresh-browser sign-in. (PRD S1: picks survive reload in fresh browser)
- [ ] Migration preserves anonymous play before sign-in. (PRD cross-cutting: anonymous play preserved up to lock/join gate)
- [ ] Migration does not expose email/token/session data in client-readable storage. (PRD S1: no token/email leakage)

## Suggested approach
Add a migration marker under the existing `fl:` namespace. After session load
and handle completion, upload local picks if server picks are empty or merge in
a deterministic, documented way.
