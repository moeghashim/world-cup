# E2E Tests

The Playwright suite is intentionally separate from the default unit-test gate
because it needs a browser runtime.

Before running in CI, install Chromium:

```bash
npx playwright install --with-deps chromium
```

Then run:

```bash
npm run test:e2e
```
