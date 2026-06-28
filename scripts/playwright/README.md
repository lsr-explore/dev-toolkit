# Playwright example

A minimal end-to-end Playwright test that points at the live **google.com** — a
smoke test plus two axe-core accessibility scans (one strict, one severity-gated).
A copy-paste starting point for a browser test: one spec, one tiny config.

> **Dependencies:** [`@playwright/test`][pw] and [`@axe-core/playwright`][axe] —
> real dev dependencies, unlike most snippets here. Install them and the browser
> binaries before running:
>
> ```bash
> npm i -D @playwright/test @axe-core/playwright   # or: pnpm add -D …
> npx playwright install chromium
> ```

## Run it

```bash
npx playwright test               # headless
npx playwright test --headed      # watch it drive a real browser
npx playwright test --ui          # interactive runner
npx playwright show-report        # open the HTML report after a run
```

The config enables the HTML reporter, so `show-report` works after a run. A run
writes `playwright-report/` and `test-results/` (both git-ignored in this repo; add
them to your own `.gitignore` when you copy this out).

It hits the real google.com, so it needs network access. In some regions Google
serves a cookie-consent page first; the assertions key off the page `<title>` to
survive that, but if you adapt the search-box test you may need to dismiss consent
first (e.g. click the **Accept all** button before locating the field).

## What to change for your app

- Point `page.goto(...)` at your own URL (usually `http://localhost:3000`).
- Add a `webServer` block to `playwright.config.ts` so Playwright boots your dev
  server before the run and tears it down after:

  ```ts
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
  ```

- Prefer role-based locators (`getByRole`, `getByLabel`) over CSS selectors — they
  track what users and assistive tech actually perceive, and they break less.

## The accessibility scans

Two axe-core tests show two assertion styles — and the spec **fails on purpose**,
because that red is the point:

- **Strict** (`no accessibility violations …`) asserts zero violations. That's how a
  real gate behaves: fail the build on *any* a11y violation. google.com isn't clean,
  so it fails — logging what axe found (`aria-allowed-role`, `landmark-one-main`,
  `page-has-heading-one`, `region`). Point it at your own app and keep it green by
  fixing the issues. Wrap the body in `test.fail()` if you want the demonstration
  without a red suite.
- **Severity-gated** (`no serious or critical …`) fails only on serious/critical
  issues — a pragmatic gate when you're adopting a11y testing on an existing app and
  need to triage, ratcheting the threshold down as you clear violations. It passes
  against google.com (whose issues are minor/moderate).

So a run reports **3 passed / 1 failed** (exit non-zero), by design. This is the
per-route, in-suite setup the [`a11y-check`](../a11y-check) snippet points you toward
once you outgrow a single-URL smoke check.

[pw]: https://playwright.dev
[axe]: https://github.com/dequelabs/axe-core-npm/tree/develop/packages/playwright
