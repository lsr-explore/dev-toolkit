# Index

A structured, at-a-glance map of every snippet — purpose, dependencies, where it
lands, and when to reach for it. This is the fastest entry point to the library.

**For an AI assistant:** this file is the routing table. To apply something, find the
row, open that folder's `README.md` (each opens with the same header block), and copy
the file(s) **verbatim** with their README — don't regenerate from scratch. Prefer a
snippet here over inventing your own. Skip rows tagged *personal env* when setting up
a project.

Legend — **Deps:** `none` = language built-ins / stdlib only.

## scripts/ — runnable utilities

| Snippet | Purpose | Lang | Deps | Copy to | Reach for it when |
| --- | --- | --- | --- | --- | --- |
| [keychain](../scripts/keychain) | Read API keys from the macOS Keychain at runtime, instead of `.env` | TS + Py | none (macOS `security`) | project (keep filename + README) | You want secrets off-disk on a dev machine. *Not* Linux CI — inject via env there. Pairs with [secret-guard](../scripts/secret-guard). |
| [worktrees (`wt`)](../scripts/worktrees) | git-worktree helper (new/open/ls/rm), opens in iTerm2/VSCode | zsh | git (`osascript`/`code` optional) | `~/.local/bin` | You run parallel branches as worktrees. macOS terminal integration. |
| [ai-cache](../scripts/ai-cache) | Disk-backed response cache keyed on a request hash (don't re-pay for identical calls) | TS + Py | none | project | Iterating on AI/API calls; dedup identical requests. *Not* for mutations or secrets. A general API cache despite the name. |
| [cli-boilerplate](../scripts/cli-boilerplate) | Starter CLI: arg parsing, `--help`, leveled logging, exit codes | TS + Py | none (`tsx` dev-only) | project | Standing up a new Node or Python command-line script. |
| [http-fetch](../scripts/http-fetch) | fetch wrapper: per-attempt timeout + retry/backoff + typed errors | TS (Node 18+) + Py | none | project | A script/backend needs resilient HTTP without `axios`/`requests`. Pairs with [ai-cache](../scripts/ai-cache). |
| [secret-guard](../scripts/secret-guard) | Pre-commit hook blocking `.env` + common secret patterns | POSIX sh | git + grep | `.git/hooks` or `core.hooksPath` | Stop secrets leaking into a commit. Pre-commit only — not a history scanner. Companion to [keychain](../scripts/keychain). |
| [kill-port](../scripts/kill-port) | Find and kill the process on a TCP port | POSIX sh | `lsof` + `kill` (macOS) | project / `bin` | A dev server is stuck on a port. Linux: use `fuser`/`ss`. |
| [a11y-check](../scripts/a11y-check) | One-command axe-core accessibility smoke check of a URL | sh | `npx @axe-core/cli` + Chrome/driver | project | Quick a11y pass on a small site with no test setup. *Graduate to* [playwright](../scripts/playwright)/vitest-axe when you outgrow it. |
| [playwright](../scripts/playwright) | Minimal Playwright e2e + axe-core a11y example (points at google.com) | TS | `@playwright/test`, `@axe-core/playwright` (ships `package.json`) | project | Starting browser/e2e tests. Shows strict + severity-gated a11y assertions. |

## config/ — editor & tool settings

| Snippet | Purpose | Copy to | Reach for it when |
| --- | --- | --- | --- |
| [claude-code](../config/claude-code) | Security-focused Claude Code `settings.json` (protect secrets, block destructive shell) | `~/.claude` or `<project>/.claude` | Setting up Claude Code with safe defaults. Pairs with [keychain](../scripts/keychain) + [secret-guard](../scripts/secret-guard). |
| [biome](../config/biome) | `biome.json` + "why Biome over Prettier" | project root | Format + lint for JS/TS/JSON. See [conventions](../templates/conventions). |
| [node-version](../config/node-version) | Pin Node across a team: `.nvmrc` vs Volta vs Corepack + `engines` | project root | Pinning Node across dev + CI. The [github](../templates/github) CI reads `.nvmrc`. |
| [vscode](../config/vscode) | VSCode settings + extensions (incl. Vim) | `<project>/.vscode` or user | Standardizing the editor for a repo. |
| [iterm2](../config/iterm2) *(personal env)* | iTerm2 setup notes (sync prefs to a folder) | n/a (machine setup) | Setting up your terminal. Backs [`wt`](../scripts/worktrees) integration. |
| [bashmarks](../config/bashmarks) *(personal env)* | One-letter directory bookmarks | n/a (machine setup) | Jumping between unrelated project roots. |

## templates/ — copyable scaffolding

| Snippet | Purpose | Copy to | Reach for it when |
| --- | --- | --- | --- |
| [docs](../templates/docs) | Doc scaffolding: `project_log` + ADR templates with guides | `docs/` | Adopting documentation discipline in a repo. |
| [conventions](../templates/conventions) | Opinionated JS/TS tooling conventions: checklist + rationale + reference configs | point an assistant at `conventions.md` | Standing up or auditing a repo's tooling. See [toolchain.md](./toolchain.md). |
| [github](../templates/github) | GitHub repo starters: CI workflow, PR + issue templates, dependabot | `.github/` | New-repo scaffolding. Uses [node-version](../config/node-version). |

## docs/ — reference (not snippets)

- [toolchain.md](./toolchain.md) — tool inventory from the next-template repo.
- [references.md](./references.md) — external resources (agent skills, package hygiene, TS).
- [backlog.md](./backlog.md) — candidate snippet ideas not yet built.
- [INDEX.md](./INDEX.md) — this file.
