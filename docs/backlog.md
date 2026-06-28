# Backlog — snippet ideas

Candidate additions to the toolkit. Nothing here is committed work — it's a
shortlist to prioritize. Bias for all of these: **self-contained, zero/minimal
runtime deps, macOS-first**, and a per-folder `README.md` (see
[`../CLAUDE.md`](../CLAUDE.md)).

Several ideas overlap with what the `next-template` repo already wires up (pino,
zod env validation, commitlint, axe). Those are noted so the snippet version stays
*lighter weight* — for small scripts and backends that don't pull in the full
template — rather than duplicating it.

## CLI scaffolding

- **Boilerplate CLI: Node + Python** *(Laurie's idea)* — a starter command-line
  script in each language with arg parsing, `--help`, leveled logging
  (`--verbose`/`--quiet`), and sane exit codes. Zero-dep: Node's built-in
  `util.parseArgs` + a tiny console logger; Python's stdlib `argparse` + `logging`.
  Ship both alongside one README so the pattern is the same across languages.

## Secrets & safety (companions to `scripts/keychain`)

- **Pre-commit secret guard** — block committing `.env` files and common key
  patterns. Either a tiny zero-dep grep-based hook or a `gitleaks` recipe. Natural
  bookend to the keychain helper: keychain keeps secrets *out*, this stops them
  *leaking in*.

## Dev ergonomics

- **`kill-port` helper** — free a stuck dev-server port (`lsof`-based, macOS). Common
  frontend pain point.
- **Node version pinning note** — short cheatsheet on `.nvmrc` vs Volta vs corepack,
  and `engines` in `package.json`.
- **Zero-dep `fetch` wrapper** — timeout + retry/backoff + typed error, for Node 18+
  global `fetch` and a Python equivalent. Useful in throwaway scripts that shouldn't
  pull in `axios`/`requests`.

## Accessibility (Laurie's domain — likely high value)

- **Standalone a11y smoke-check** — copy-paste `@axe-core/cli` or `pa11y` run against
  a local URL, for projects that don't have the full Playwright + `vitest-axe` setup
  that `next-template` carries. The quick check you reach for on a small site.

## Worktrees (extends `scripts/worktrees/wt`)

- **Worktree post-create hook** — on `wt new`, optionally symlink `.env` / run the
  install step so a fresh worktree is immediately runnable.

## CI

- **Minimal GitHub Actions starters** — a frontend-focused workflow (lint, typecheck,
  test, coverage) as a copy-paste starting point, kept lighter than the template's
  full pipeline.

---

*To promote an item: give it a folder + README, keep it self-contained, update the
layout map in the top-level `README.md`, and remove it from this list.*
