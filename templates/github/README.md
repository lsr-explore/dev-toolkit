# GitHub starters — CI + repo templates

> **Purpose:** GitHub repo starters: CI workflow, PR + issue templates, dependabot.
> **Copy to:** `.github/` · **Use when:** new-repo scaffolding. · **Related:** [node-version](../../config/node-version)

A minimal `lint → typecheck → test` gate for a frontend project, plus basic PR and
issue templates. Heavily commented copy-paste starting points — **not** a full
pipeline.

| File | Copy to | What it is |
| --- | --- | --- |
| [`ci.yml`](./ci.yml) | `.github/workflows/ci.yml` | The lint/typecheck/test workflow |
| [`pull_request_template.md`](./pull_request_template.md) | `.github/pull_request_template.md` | Auto-fills new PR descriptions |
| [`dependabot.yml`](./dependabot.yml) | `.github/dependabot.yml` | Automated dependency-update PRs |
| **Issues — pick one paradigm (see below)** | | |
| [`bug.yml`](./bug.yml) · [`feature.yml`](./feature.yml) · [`epic.yml`](./epic.yml) | `.github/ISSUE_TEMPLATE/` | Structured **issue forms** — typed fields, required validation, auto-labels |
| [`config.yml`](./config.yml) | `.github/ISSUE_TEMPLATE/config.yml` | Forms chooser config — keeps the "blank issue" escape hatch |
| [`issue_template.md`](./issue_template.md) | `.github/ISSUE_TEMPLATE.md` | *Alternative:* one combined bug/feature markdown default |

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

## PR template

Plain Markdown — copy it to `.github/pull_request_template.md` and GitHub picks it
up automatically (no config). It opens with a related-issue line (`Resolves #123`
links and auto-closes the issue), then what/why, a screenshots/video prompt, and a
checklist of conditional reminders — clean diff (no stray debug/files), performance,
security, docs, and accessibility. It also carries two authoring tips: leave inline
diff comments prefaced with "Note to reviewer:", and consider an AI review pass
before requesting human review. Deliberately minimal — trim or extend to fit.

## Issue templates — two paradigms, pick one

There are two ways to seed new issues here. **Don't ship both** — GitHub will offer
the markdown default *and* the forms chooser, which is confusing. Pick the row that
fits and delete the other file(s).

### A. Structured issue forms (`bug.yml` / `feature.yml` / `epic.yml` + `config.yml`)

The richer option, and the one to reach for on a real project. Copy the `.yml`
files into `.github/ISSUE_TEMPLATE/`; GitHub renders each as a form with **typed
fields, `required` validation, and auto-applied `labels`** (the issue *type* comes
from the label — `bug` / `enhancement` / `epic` — not the title). `config.yml` sets
`blank_issues_enabled: true` so a quick throwaway ticket is still one click away.

- **`bug.yml`** — repro steps, data-to-reproduce (no secrets), screenshots, impact,
  plus optional safety / tech / a11y notes.
- **`feature.yml`** — overview, acceptance criteria, demo steps, sample data,
  screenshots, plus optional safety / tech / a11y / open-questions notes.
- **`epic.yml`** — goal, in/out of scope, done-when, ADR links; children link up via
  the native **Parent** sub-issue field rather than a hand-kept checklist.

All three share a title convention: prefix with the app/package scope (e.g.
`companion:`, `console:`). Trim the optional fields your project doesn't use — the
safety / a11y buckets are there for triage-calibration and accessibility work and
won't fit every repo.

### B. Single combined markdown default (`issue_template.md`)

The minimal, zero-config fallback. Drops in at `.github/ISSUE_TEMPLATE.md` as the
default issue body (set labels, type, and assignees from the GitHub sidebar). It's
**one combined bug/feature form** — fill the half that matches, delete the other.
The bug side prompts for expected-vs-actual, repro steps, variations / error cases,
sample data, screenshots, and environment; the feature side prompts for motivation,
demo steps, sample data, and mockups.

**When to pick which:** forms (A) when you want consistent, machine-parseable issues
with enforced fields and auto-labels — worth it once more than one person files
issues. The single markdown default (B) when you want the lightest possible setup
with no chooser and no per-type maintenance. To turn (B) into a chooser instead,
move it under `.github/ISSUE_TEMPLATE/` and add `name:`/`about:` front matter (or
split into `bug_report.md` + `feature_request.md`).

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
