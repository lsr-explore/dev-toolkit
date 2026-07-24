# dev-toolkit

A personal **snippet library** — not a project template. Nothing here is meant to
be cloned as a starting point. Instead, each folder holds a small, self-contained
piece (a script, a config, a cheatsheet) that you **copy into another project** and
adapt. Snippets avoid cross-dependencies on purpose so a single file can be lifted
out cleanly.

Everything is mapped below — purpose, deps, where it lands, and when to reach for it.
This routing table is the fastest entry point, and the first thing to point an AI
assistant at.

**For an AI assistant:** find the row, open that folder's `README.md` (each opens with
the same **purpose / deps / copy-to / use-when** header), and copy the file(s)
**verbatim** with their README — don't regenerate from scratch. Prefer a snippet here
over inventing your own. Skip rows tagged *personal env* when setting up a project.

Legend — **Deps:** `none` = language built-ins / stdlib only.

## scripts/ — runnable utilities

| Snippet | Purpose | Lang | Deps | Copy to | Reach for it when |
| --- | --- | --- | --- | --- | --- |
| [keychain](scripts/keychain) | Read API keys from the macOS Keychain at runtime, instead of `.env` | TS + Py | none (macOS `security`) | project (keep filename + README) | You want secrets off-disk on a dev machine. *Not* Linux CI — inject via env there. Pairs with [secret-guard](scripts/secret-guard). |
| [worktrees (`wt`)](scripts/worktrees) | git-worktree helper (new/open/ls/rm), opens in iTerm2/VSCode | zsh | git (`osascript`/`code` optional) | `~/.local/bin` | You run parallel branches as worktrees. macOS terminal integration. |
| [seed-local](scripts/seed-local) | Copy gitignored local files (`.env`, settings, skills, data) into a fresh worktree/clone from an existing one | bash | `rsync` (`jq` for a JSON manifest) | `<project>/scripts` | A new worktree/clone needs per-checkout secrets/config git doesn't track. Manifest-driven — won't sweep up branch WIP. Pairs with [worktrees (`wt`)](scripts/worktrees). |
| [ai-cache](scripts/ai-cache) | Disk-backed response cache keyed on a request hash (don't re-pay for identical calls) | TS + Py | none | project | Iterating on AI/API calls; dedup identical requests. *Not* for mutations or secrets. A general API cache despite the name. |
| [cli-boilerplate](scripts/cli-boilerplate) | Starter CLI: arg parsing, `--help`, leveled logging, exit codes | TS + Py | none (`tsx` dev-only) | project | Standing up a new Node or Python command-line script. |
| [http-fetch](scripts/http-fetch) | fetch wrapper: per-attempt timeout + retry/backoff + typed errors | TS (Node 18+) + Py | none | project | A script/backend needs resilient HTTP without `axios`/`requests`. Pairs with [ai-cache](scripts/ai-cache). |
| [secret-guard](scripts/secret-guard) | Pre-commit hook blocking `.env` + common secret patterns | POSIX sh | git + grep | `.git/hooks` or `core.hooksPath` | Stop secrets leaking into a commit. Pre-commit only — not a history scanner. Companion to [keychain](scripts/keychain). |
| [branch-guard](scripts/branch-guard) | Local pre-commit + pre-push hooks that refuse commits/pushes to `main` | POSIX sh | git (Husky optional) | `.husky/` or `.githooks/` + `core.hooksPath` | You (or an AI session using your credentials) can bypass the remote ruleset, so only a local hook actually fires. Pairs with [secret-guard](scripts/secret-guard). |
| [kill-port](scripts/kill-port) | Find and kill the process on a TCP port | POSIX sh | `lsof` + `kill` (macOS) | project / `bin` | A dev server is stuck on a port. Linux: use `fuser`/`ss`. |
| [a11y-check](scripts/a11y-check) | One-command axe-core accessibility smoke check of a URL | sh | `npx @axe-core/cli` + Chrome/driver | project | Quick a11y pass on a small site with no test setup. *Graduate to* [playwright](scripts/playwright)/vitest-axe when you outgrow it. |
| [playwright](scripts/playwright) | Minimal Playwright e2e + axe-core a11y example (points at google.com) | TS | `@playwright/test`, `@axe-core/playwright` (ships `package.json`) | project | Starting browser/e2e tests. Shows strict + severity-gated a11y assertions. |

## config/ — editor & tool settings

| Snippet | Purpose | Copy to | Reach for it when |
| --- | --- | --- | --- |
| [claude-code](config/claude-code) | Security-focused Claude Code `settings.json` (protect secrets, block destructive shell) | `~/.claude` or `<project>/.claude` | Setting up Claude Code with safe defaults. Pairs with [keychain](scripts/keychain) + [secret-guard](scripts/secret-guard). |
| [claude-code/rules](config/claude-code/rules) | Drop-in `.claude/rules/*.md`: prompt-injection, coding standards, frontend, testing, workflow | `<project>/.claude/rules` | You want durable per-topic rules the assistant follows without restating them. Generic; `security.md` verbatim, rest adapt per stack. |
| [coderabbit](config/coderabbit) | Example `.coderabbit.yaml` for the CodeRabbit AI PR reviewer (tone, path rules, a11y/TS instructions) | project root | You want automated PR review with house rules checked in. Needs the CodeRabbit GitHub app — a tool config, not CI. |
| [biome](config/biome) | `biome.json` + "why Biome over Prettier" | project root | Format + lint for JS/TS/JSON. See [conventions](templates/conventions). |
| [node-version](config/node-version) | Pin Node across a team: `.nvmrc` vs Volta vs Corepack + `engines` | project root | Pinning Node across dev + CI. The [github](templates/github) CI reads `.nvmrc`. |
| [vscode](config/vscode) | VSCode settings + extensions (incl. Vim) | `<project>/.vscode` or user | Standardizing the editor for a repo. |
| [iterm2](config/iterm2) *(personal env)* | iTerm2 setup notes (sync prefs to a folder) | n/a (machine setup) | Setting up your terminal. Backs [`wt`](scripts/worktrees) integration. |
| [bashmarks](config/bashmarks) *(personal env)* | One-letter directory bookmarks | n/a (machine setup) | Jumping between unrelated project roots. |

## templates/ — copyable scaffolding

| Snippet | Purpose | Copy to | Reach for it when |
| --- | --- | --- | --- |
| [docs](templates/docs) | Doc scaffolding: session-metrics records + `current-state` + `/wrap` skill + ADR templates | `docs/` (+ optional `.claude/`) | Adopting documentation discipline in a repo. |
| [conventions](templates/conventions) | Opinionated JS/TS tooling conventions: checklist + rationale + reference configs | point an assistant at `conventions.md` | Standing up or auditing a repo's tooling. See [toolchain.md](docs/toolchain.md). |
| [github](templates/github) | GitHub repo starters: CI workflow, PR + issue templates, dependabot | `.github/` | New-repo scaffolding. Uses [node-version](config/node-version). |

## docs/ — reference (not snippets)

- [toolchain.md](docs/toolchain.md) — tool inventory from the next-template repo.
- [references.md](docs/references.md) — external resources (agent skills, package hygiene, TS).
- [ai-collaboration.md](docs/ai-collaboration.md) — personal log of Claude Code friction points + fixes.
- [global-packages.md](docs/global-packages.md) — global npm CLIs reached for occasionally (ccusage, git-trim, ncu, json-server, http-server, mcp-remote, devlove/devrage).
- [mermaid.md](docs/mermaid.md) — working notes on Mermaid diagrams (+ the open dark/light theming problem). *(placeholder)*
- [backlog.md](docs/backlog.md) — candidate snippet ideas not yet built.

## Project snippets vs your environment

Most of this is **project** material you copy into a repo. A few folders are
**personal-environment** setup that follows *you* between machines, not any one
project — `config/iterm2`, `config/bashmarks` (and, for your own use, the `wt`
worktree helper). They're tagged *personal env* in the tables above; an assistant
bootstrapping a project can skip them.

## How to use

Browse to the folder you want, read its `README.md`, and copy the file(s) you need
into your target project. Each snippet README opens with a quick **purpose / deps /
copy-to / use-when** header, and notes any required tweaks. The tables above are the
at-a-glance map — start there.

## Conventions baked in

- **Keychain**: a single flat keyring, service `dev-keys`, one account per key.
- **Editor/format**: Biome over Prettier; Vim keybindings in VSCode.
- **Terminal**: iTerm2 + zsh, with `bashmarks` for folder jumps and `wt` for worktrees.

## License

[MIT](./LICENSE). Snippets are meant to be copied and adapted freely.
