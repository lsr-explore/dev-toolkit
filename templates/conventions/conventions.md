# Conventions — intent, rationale, verification

Each convention is stated **stack-agnostically** (the principle ports anywhere),
followed by a **reference** implementation on a Next.js + Biome + ESLint + Vitest +
Playwright stack, and a **verify** step. To apply on a different stack, keep the
principle and the verify; swap the reference.

---

## 1. Accessibility is enforced by exactly one tool

**Principle.** a11y linting must be owned by **one** tool. When two linters ship
overlapping a11y rule sets and one disables the other's rules, a11y can end up
enforced by *neither* — and nothing tells you. This is the single most important
check on this page.

**Why.** It fails silently and invisibly: the build is green, the editor is quiet,
and accessible-name / alt-text / role bugs sail through. For a11y work specifically,
a false sense of coverage is worse than no linter.

**Reference (Biome + ESLint + Next).** ESLint owns a11y via `eslint-plugin-jsx-a11y`;
Biome's a11y group is turned **off** so it isn't a competing source; and
`eslint-config-biome` is spread **last** to disable the ESLint rules Biome already
handles (formatting, etc.) without touching a11y.

```js
// eslint.config.mjs (see artifacts/eslint.config.mjs)
export default defineConfig([
  ...nextVitals,
  ...nextTs,
  { rules: { ...jsxA11y.flatConfigs.recommended.rules } }, // a11y owner
  ...storybook.configs['flat/recommended'],
  biome, // MUST be last: disables ESLint rules Biome handles
]);
```

```jsonc
// biome.json — Biome is NOT an a11y source
"linter": { "rules": { "a11y": { "recommended": false } } }
```

**Verify.** Add `<img src="x.png" />` (no `alt`) to a component, run the linter, and
**expect an error**. Remove it. If nothing fired, a11y is not being enforced —
regardless of what the config looks like.

> On a non-Next stack: pick one owner (jsx-a11y under ESLint, or Biome's a11y group —
> not both). If you keep both tools, make sure only one has a11y rules *on*, and run
> the `<img>` test to prove it.

---

## 2. Biome over Prettier; Stylelint owns CSS

**Principle.** One formatter for JS/TS/JSON (Biome), no Prettier. CSS is linted by
Stylelint, and Biome's CSS linter is **off** so the two don't fight over the same
files.

**Why.** Biome is one fast binary doing format + lint, with no
`eslint-config-prettier`/`eslint-plugin-prettier` glue to keep formatting and linting
from disagreeing. Two formatters touching the same file is a churn generator.

**Reference.** `biome.json` (see [`../../config/biome`](../../config/biome)) with
`css.linter.enabled: false`; Stylelint configured for `**/*.css`; **no** Prettier
dependency or editor default.

**Verify.** `grep -i prettier package.json` is empty; Biome's CSS linter is off;
Stylelint runs on CSS. Editor formats with Biome on save
([`../../config/vscode`](../../config/vscode)).

---

## 3. Coverage is wired from day one

**Principle.** Every repo ships a coverage script and provider at setup, not
retrofitted later. Cheap now; annoying once there are 200 files and no baseline.

**Why.** Retrofitting coverage means choosing a provider, wiring reporters, and
fighting include/exclude globs against an existing tree — friction that gets deferred
forever. Day one it's three lines.

**Reference (Vitest).** `@vitest/coverage-v8`, a `test:coverage` script, and a
coverage block (provider `v8`; reporters `text` + `html` + `lcov`; include `src` +
`libs`; exclude tests, setup files, and barrel `index.ts`s). See
[`artifacts/vitest.coverage.ts`](./artifacts/vitest.coverage.ts).

**Verify.** `pnpm test:coverage` runs green and writes `coverage/` (which is
gitignored and excluded from lint/depcruise noise).

---

## 4. Playwright ships with its interactive affordances

**Principle.** E2E always exposes **run**, **interactive UI**, and **report** scripts
— not just a headless run. The UI mode is how you actually debug a failing e2e.

**Why.** `e2e:ui` (time-travel, selector playground) and `e2e:report` turn a red CI
run into something you can diagnose locally in seconds. Leaving them out means every
e2e failure starts with "now how do I see what happened."

**Reference.**

```jsonc
"e2e":        "playwright test",
"e2e:ui":     "playwright test --ui",
"e2e:report": "playwright show-report",
```

Set browser projects intentionally (chromium / firefox / webkit) — cross-browser
catches real bugs a single engine hides.

**Verify.** `pnpm e2e:ui` opens the Playwright UI; the report script serves the last
run.

---

## 5. `package.json` scripts are sectioned and aggregated

**Principle.** Group scripts under labeled **divider keys** for scannability, and
provide a single aggregate gate so **local == CI**.

**Why.** A flat 40-script `package.json` is unreadable; the dividers turn it into a
table of contents. A `check:all` that runs exactly what CI runs means you never push
something that passes locally and fails in CI (or vice-versa).

**Reference (divider style + aggregate).**

```jsonc
"------------------- testing -------------------": "noop",
"test":          "vitest run",
"test:coverage": "vitest run --coverage",
// ...
"check:all": "pnpm format:check && pnpm lint && pnpm lint:css && pnpm typecheck && pnpm test",
"lint:all":  "biome check . && eslint . && stylelint '**/*.css' && markdownlint-cli2 '**/*.md'",
```

The divider keys are `"noop"`-valued so they never run; they exist purely as visual
section headers. Full block in
[`artifacts/package-scripts.jsonc`](./artifacts/package-scripts.jsonc).

**Verify.** The steps inside `check:all` match the CI job's steps, one for one.

---

## Also in next-template (pointers, not re-documented)

These are part of the stack but don't have a silent-breakage trap, so they live in the
inventory rather than here: Husky + commitlint (conventional commits, lowercase
subject), dependency-cruiser + madge (circular/dependency rules), size-limit (bundle
budgets), markdownlint, Storybook + a11y addon. See
[`../../docs/toolchain.md`](../../docs/toolchain.md).
