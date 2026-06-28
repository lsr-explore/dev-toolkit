# Playwright example

A minimal end-to-end Playwright test that points at the live **google.com** — a
copy-paste starting point for a browser test. One spec, one tiny config.

> **Dependency:** [`@playwright/test`][pw] — a real dev dependency, unlike most
> snippets here. Install it and the browser binaries before running:
>
> ```bash
> npm i -D @playwright/test        # or: pnpm add -D @playwright/test
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

## Accessibility variant

To turn this into an a11y check, add [`@axe-core/playwright`][axe] and scan a page
inside a test. Against **your own app** you assert zero violations:

```ts
import AxeBuilder from "@axe-core/playwright";

test("no detectable a11y violations", async ({ page }) => {
  await page.goto("http://localhost:3000/");
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
```

Point that at a third-party page you don't control and the assertion will (rightly)
fail — e.g. google.com reports a handful of real violations (`landmark-one-main`,
`page-has-heading-one`, `region`, `aria-allowed-role`). That's a quick way to watch
axe actually flag issues; `console.log(results.violations)` to inspect them. This is
the per-route, in-suite setup the [`a11y-check`](../a11y-check) snippet points you
toward once you outgrow a single-URL smoke check.

[pw]: https://playwright.dev
[axe]: https://github.com/dequelabs/axe-core-npm/tree/develop/packages/playwright
