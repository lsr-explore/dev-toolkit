# dev-toolkit

A personal **snippet library** — not a project template. Nothing here is meant to
be cloned as a starting point. Instead, each folder holds a small, self-contained
piece (a script, a config, a cheatsheet) that you **copy into another project** and
adapt. Snippets avoid cross-dependencies on purpose so a single file can be lifted
out cleanly.

## Layout

```
scripts/
  keychain/        Retrieve API keys from the macOS Keychain (TS + Python) + security-CLI cheatsheet
  worktrees/       The `wt` git-worktree helper + install instructions
  ai-cache/        Disk-backed response cache to stop re-spending tokens during UI dev (Node + Python)
  cli-boilerplate/ Starter CLI in TS + Python: arg parsing, --help, leveled logging, exit codes
  http-fetch/      Zero-dep fetch wrapper: per-attempt timeout + retry/backoff + typed errors (TS + Python)
  secret-guard/    Pre-commit hook that blocks committing .env files + common secret patterns
  kill-port/       Find and kill the process listening on a TCP port (macOS, lsof)
  a11y-check/      Standalone axe-core accessibility smoke check against a local URL
  playwright/      Minimal Playwright test (google.com) + axe-core a11y scan + config
config/
  claude-code/     Security-focused Claude Code settings.json + notes
  biome/           biome.json + "why Biome over Prettier"
  node-version/    Pin Node across a team: .nvmrc vs Volta vs Corepack + engines cheatsheet
  vscode/          VSCode settings + extensions (incl. Vim)
  iterm2/          iTerm2 setup notes                        — personal env
  bashmarks/       bashmarks install + usage                — personal env
templates/
  docs/            Copyable doc scaffolding: project_log + ADR templates (with instructions)
  conventions/     Tooling conventions + per-repo verify checklist + reference configs
  github/          GitHub starters: minimal frontend CI + PR / issue templates + dependabot
docs/
  INDEX.md         Structured map of every snippet — start here (the AI entry point)
  toolchain.md     Inventory of the tools used in the next-template repo
  references.md    External resources: agent skills, package hygiene, TS reference
  backlog.md       Candidate snippet ideas (the first batch has shipped)
```

## Project snippets vs your environment

Most of this is **project** material you copy into a repo. A few folders are
**personal-environment** setup that follows *you* between machines, not any one
project — `config/iterm2`, `config/bashmarks` (and, for your own use, the `wt`
worktree helper). They're tagged *personal env* in the map above; an assistant
bootstrapping a project can skip them.

## How to use

Browse to the folder you want, read its `README.md`, and copy the file(s) you need
into your target project. Each snippet README opens with a quick **purpose / deps /
copy-to / use-when** header, and notes any required tweaks.

For a structured, at-a-glance map of every snippet — what it's for, its deps, and
when to reach for it — see **[`docs/INDEX.md`](./docs/INDEX.md)**. It's the fastest
entry point, and the first thing to point an AI assistant at.

## Conventions baked in

- **Keychain**: a single flat keyring, service `dev-keys`, one account per key.
- **Editor/format**: Biome over Prettier; Vim keybindings in VSCode.
- **Terminal**: iTerm2 + zsh, with `bashmarks` for folder jumps and `wt` for worktrees.

## License

[MIT](./LICENSE). Snippets are meant to be copied and adapted freely.
