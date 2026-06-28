import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// A minimal end-to-end smoke test against the live google.com, plus an accessibility
// scan via axe-core. It needs network access; in some regions Google serves a
// cookie-consent page first, so the assertions key off the stable page <title>
// rather than page chrome. For your own app, point `goto` at a local URL and prefer
// role-based locators (getByRole/…).

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

test("no serious accessibility violations", async ({ page }) => {
  await page.goto("https://www.google.com/");
  const { violations } = await new AxeBuilder({ page }).analyze();

  // Surface everything axe found in the test output / HTML report.
  if (violations.length) {
    console.log(
      `axe: ${violations.length} violation type(s) — ${violations
        .map((v) => `${v.id} (${v.impact})`)
        .join(", ")}`,
    );
  }

  // google.com isn't a clean a11y target, so this example gates only on
  // serious/critical issues. Against YOUR OWN app, assert zero outright instead:
  //   expect(violations).toEqual([]);
  const serious = violations.filter(
    (v) => v.impact === "serious" || v.impact === "critical",
  );
  expect(serious).toEqual([]);
});
