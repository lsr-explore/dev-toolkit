# CodeRabbit

> **Purpose:** `.coderabbit.yaml` — configure CodeRabbit's AI reviewer per repo.
> **Deps:** a CodeRabbit account + its GitHub app installed on the repo (nothing to `npm install`).
> **Copy to:** your project **root** (as `.coderabbit.yaml`). · **Use when:** you want automated PR review with house rules baked in. · **Related:** [claude-code](../claude-code), [github](../../templates/github)

An example [`.coderabbit.yaml`](./.coderabbit.yaml) for [CodeRabbit](https://coderabbit.ai),
which reviews pull requests and answers follow-ups inline. This file **overrides the
dashboard defaults** for the repo it lives in — check it in so the whole team gets the
same behavior. It is a tool config, **not** a CI workflow: CodeRabbit runs as a GitHub
app on PRs, so there's nothing to add to `.github/workflows`.

## Setup

1. Install the CodeRabbit GitHub app and grant it the repo (one-time, via coderabbit.ai).
2. Copy `.coderabbit.yaml` to your project root and adjust (see below).
3. Open a PR — CodeRabbit reviews it automatically. `@coderabbitai` in a comment to chat.

The `# yaml-language-server:` line at the top wires up schema validation/autocomplete
in editors with the YAML extension.

## What this example sets

- **`tone_instructions`** — a short steer for the reviewer's voice (a11y + security
  first, no filler). Max 250 chars.
- **`reviews.profile: chill`** — balanced verbosity. Switch to `assertive` for nittier
  reviews or `quiet` for substantive findings only.
- **`request_changes_workflow: false`** — the bot's verdict is advisory; it won't block
  a merge via GitHub's "changes requested".
- **`auto_review`** — reviews non-draft PRs into `main`, skips `chore(release)`/`bump` titles.
- **`path_filters`** — excludes generated / vendored / lockfile paths so review stays on
  authored code. Leading `!` excludes; everything else is included.
- **`path_instructions`** — directory-scoped rules (strict TS typing, WCAG 2.2 AA on
  components, behavior-not-implementation on tests).
- **`tools`** — CodeRabbit auto-runs a linter when it finds that tool's config; this pins
  ESLint / markdownlint / shellcheck on. The full ~60-tool list is in the schema.

## Copy-in tweaks

- Point `path_instructions` and `path_filters` at **your** stack — swap `.next` for your
  build dir, add `ruff` under `tools` for Python, drop the a11y rule on a non-UI repo.
- Change `auto_review.base_branches` if you don't gate on `main`.
- If you use [biome](../biome) instead of ESLint, CodeRabbit supports a `biome` tool key —
  see the schema for the exact name and options.
