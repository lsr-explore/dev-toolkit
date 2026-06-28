import { expect, test } from "@playwright/test";

// A minimal end-to-end smoke test against the live google.com. It needs network
// access; in some regions Google serves a cookie-consent page first, so the
// assertions key off the stable page <title> rather than page chrome. For your own
// app, point `goto` at a local URL and prefer role-based locators (getByRole/…).

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
