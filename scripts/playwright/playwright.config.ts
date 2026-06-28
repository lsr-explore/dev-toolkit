import { defineConfig, devices } from "@playwright/test";

// Minimal Playwright config for the example spec. Copy it alongside the spec and
// run `npx playwright test`. For a real app, add a `webServer` block (see README)
// so Playwright starts your dev server before the run and stops it after.
export default defineConfig({
  testDir: ".",
  timeout: 30_000,
  expect: { timeout: 10_000 },
  // `list` gives live terminal output; `html` writes ./playwright-report so
  // `npx playwright show-report` has something to open. open: "never" keeps it from
  // auto-launching a browser (this example is intentionally red — see README).
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    // Artifacts that make a failure debuggable without re-running by hand.
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
