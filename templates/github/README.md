# GitHub starters — CI + repo templates

A minimal `lint → typecheck → test` gate for a frontend project, plus basic PR and
issue templates. Heavily commented copy-paste starting points — **not** a full
pipeline.

| File | Copy to | What it is |
| --- | --- | --- |
| [`ci.yml`](./ci.yml) | `.github/workflows/ci.yml` | The lint/typecheck/test workflow |
| [`pull_request_template.md`](./pull_request_template.md) | `.github/pull_request_template.md` | Auto-fills new PR descriptions |
| [`issue_template.md`](./issue_template.md) | `.github/ISSUE_TEMPLATE.md` | Default new-issue body |
| [`dependabot.yml`](./dependabot.yml) | `.github/dependabot.yml` | Automated dependency-update PRs |

## Use the workflow

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

## PR & issue templates

Both are plain Markdown — copy them to the paths in the table above and GitHub
picks them up automatically (no config). They're deliberately minimal; trim or
extend the sections to fit.

- **PR template** opens with a related-issue line (`Resolves #123` links and
  auto-closes the issue), then what/why, a screenshots/video prompt, and a checklist
  of conditional reminders — clean diff (no stray debug/files), performance,
  security, docs, and accessibility. It also carries two authoring tips: leave
  inline diff comments prefaced with "Note to reviewer:", and consider an AI review
  pass before requesting human review.
- **Issue template** is one combined bug/feature form with no front matter — it
  drops in at `.github/ISSUE_TEMPLATE.md` as the default issue body (set labels,
  type, and assignees from the GitHub sidebar). The bug side prompts for
  expected-vs-actual, repro steps, variations / error cases, sample data,
  screenshots, and environment; the feature side prompts for motivation, demo
  steps, sample data, and mockups. For a chooser instead, move it under
  `.github/ISSUE_TEMPLATE/` and add `name:`/`about:` front matter (or split into
  `bug_report.md` + `feature_request.md`).

## Dependabot

`dependabot.yml` opens weekly dependency-update PRs — no Action required, GitHub
runs it once the file is on the default branch. It covers **npm** (pnpm/yarn/npm
all read from their lockfile) and the **GitHub Actions** pinned in your workflows,
with related bumps grouped into a few PRs instead of one per package. A **pip**
block for a Python backend is included commented out. Tweak the `directory`,
schedule, and any majors you'd rather upgrade by hand (see the `ignore` example).

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
