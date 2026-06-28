# CI starter (GitHub Actions)

A minimal `lint → typecheck → test` gate for a frontend project. One job, four
checks, heavily commented. Copy-paste starting point — **not** a full pipeline.

## Use it

1. Copy [`ci.yml`](./ci.yml) to `.github/workflows/ci.yml` in your repo.
2. Make sure you have a `.nvmrc` (e.g. `echo "22" > .nvmrc`) and a
   `packageManager` field in `package.json` (e.g. `"packageManager": "pnpm@9.x"`).
3. Push. The workflow runs on every push and PR.

## What to tweak

| Tweak | Where |
| --- | --- |
| **Script names** — `lint`, `typecheck`, `test` must match your `package.json`. | the three named steps |
| **Package manager** — defaults to pnpm + Corepack. To swap: drop the Corepack step, set `cache: npm`/`yarn`, and use `npm ci` / `yarn install --immutable` for install. | install + Set up Node steps |
| **Node source** — pinned from `.nvmrc` via `node-version-file`. Replace with `node-version: 22` to pin inline, or a matrix to test several. | Set up Node step |
| **Triggers** — runs on all pushes/PRs. Add `branches:` to scope it. | `on:` block |

The `concurrency` block cancels superseded runs on the same branch/PR so stale
jobs don't pile up — no change needed.

## How this differs from a heavier pipeline

This is intentionally light. It does **not** include:

- e2e (Playwright)
- Storybook build / test
- bundle-size budgets
- visual regression
- format / CSS / markdown / i18n lint as separate gates

For the fuller setup — the tools, the scripts, and the conventions behind
them — see [`../conventions`](../conventions) and
[`../../docs/toolchain.md`](../../docs/toolchain.md). When you outgrow this
starter, fold those checks in as additional steps or jobs.
