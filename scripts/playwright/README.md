# Playwright example

A minimal end-to-end Playwright test that points at the live **google.com** — a
smoke test plus an axe-core accessibility scan. A copy-paste starting point for a
browser test: one spec, one tiny config.

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

## The accessibility scan

The third test scans the page with axe-core via `AxeBuilder` and logs whatever it
finds. Because google.com isn't a clean a11y target — it reports a few
minor/moderate issues (`landmark-one-main`, `page-has-heading-one`, `region`,
`aria-allowed-role`) — the example gates only on **serious/critical** violations so
it stays green while still exercising the scan.

Against **your own app**, drop the severity filter and assert zero outright:

```ts
const { violations } = await new AxeBuilder({ page }).analyze();
expect(violations).toEqual([]);
```

This is the per-route, in-suite setup the [`a11y-check`](../a11y-check) snippet
points you toward once you outgrow a single-URL smoke check.

[pw]: https://playwright.dev
[axe]: https://github.com/dequelabs/axe-core-npm/tree/develop/packages/playwright
