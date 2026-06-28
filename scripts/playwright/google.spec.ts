import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// A minimal end-to-end smoke test against the live google.com, plus two axe-core
// accessibility scans showing two assertion styles. It needs network access; in some
// regions Google serves a cookie-consent page first, so the smoke assertions key off
// the stable page <title> rather than page chrome. For your own app, point `goto` at
// a local URL and prefer role-based locators (getByRole/…).

test("home page loads", async ({ page }) => {
  await page.goto("https://www.google.com/");
  await expect(page).toHaveTitle(/google/i);
});

test("has a search box", async ({ page }) => {
  await page.goto("https://www.google.com/");
  // Google's search field is a <textarea name="q"> (older builds used <input>).
  // If a consent page intercepts, this may need a dismiss step first — see README.
  const searchBox = page.locator('textarea[name="q"], input[name="q"]').first();
  await expect(searchBox).toBeVisible();
});

// Strict scan — the real-world gate: a11y tests SHOULD fail the build on any
// violation. google.com isn't a clean target, so this test fails on purpose; that
// red is axe doing its job. Point it at your own app and keep it green by fixing the
// issues. (Wrap the body in `test.fail()` if you want the demo without a red suite.)
test("no accessibility violations (strict — fails on google.com by design)", async ({ page }) => {
  await page.goto("https://www.google.com/");
  const { violations } = await new AxeBuilder({ page }).analyze();
  if (violations.length) {
    console.log(
      `axe: ${violations.length} violation type(s) — ${violations
        .map((v) => `${v.id} (${v.impact})`)
        .join(", ")}`,
    );
  }
  expect(violations).toEqual([]);
});

// Severity-gated scan — a pragmatic gate for adopting a11y testing on an existing
// app: fail only on the worst issues now, then ratchet the threshold down as you
// clear the rest. This passes against google.com (its issues are minor/moderate).
test("no serious or critical accessibility violations (severity-gated)", async ({ page }) => {
  await page.goto("https://www.google.com/");
  const { violations } = await new AxeBuilder({ page }).analyze();
  const serious = violations.filter(
    (v) => v.impact === "serious" || v.impact === "critical",
  );
  expect(serious).toEqual([]);
});
