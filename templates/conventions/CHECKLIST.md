# New / existing repo checklist

Fast setup + audit. Stack-agnostic checks; the **Verify** line is what catches the
silent breakage. Reference configs in [`artifacts/`](./artifacts); rationale in
[`conventions.md`](./conventions.md).

## Accessibility — enforced by exactly one tool

The trap: two linters with overlapping a11y rule sets, where one silently cancels the
other, and a11y ends up enforced by **neither**.

- [ ] a11y linting is owned by **one** tool (here: `eslint-plugin-jsx-a11y`).
- [ ] If using Biome **and** ESLint: `eslint-config-biome` is spread **last** in the
      flat config (it disables ESLint rules Biome owns — if it runs before jsx-a11y,
      fine; the danger is the reverse / a second a11y source).
- [ ] Biome's own a11y group is **off** (`linter.rules.a11y.recommended: false`) so it
      isn't a competing source.
- [ ] **Verify (do this, don't assume):** add `<img src="x.png" />` (no `alt`) to a
      component, run the linter → expect an a11y error. Remove it. If no error fired,
      a11y is **not** being enforced.

## Formatting & linting

- [ ] **Biome** formats JS/TS/JSON; **no Prettier** in `devDependencies`.
- [ ] Editor formats with Biome on save (see [`../../config/vscode`](../../config/vscode)).
- [ ] **Stylelint** owns CSS; Biome's CSS linter is **off** (`css.linter.enabled: false`)
      so they don't fight. Verify: `grep -i prettier package.json` is empty.

## Testing — coverage is wired from day one

- [ ] Coverage provider installed (here: `@vitest/coverage-v8`).
- [ ] `test:coverage` script exists and emits a `coverage/` report.
- [ ] `coverage/` is gitignored; excluded from dependency-cruiser/lint noise.
- [ ] **Verify:** `pnpm test:coverage` runs green and writes `coverage/`.

## E2E — Playwright with the interactive affordances

- [ ] Scripts for **all three**: `e2e` (run), `e2e:ui` (interactive), `e2e:report`.
- [ ] Browser projects set intentionally (chromium / firefox / webkit as needed).
- [ ] **Verify:** `pnpm e2e:ui` opens the Playwright UI.

## package.json hygiene

- [ ] Scripts grouped under labeled divider keys
      (`"------------------- testing -------------------": "noop"`).
- [ ] A single **`check:all`** runs everything CI runs (format · lint · typecheck ·
      test · i18n…), so **local == CI**. A `lint:all` aggregates the linters.
- [ ] **Verify:** `pnpm check:all` mirrors the CI job's steps.

## Per-repo sanity (the silent ones, restated)

- [ ] a11y rule actually fires (the `<img>`-no-`alt` test above).
- [ ] No two tools enforcing the same rule family (a11y, formatting, CSS).
- [ ] `check:all` and CI run the **same** steps.
