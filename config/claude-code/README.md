# Claude Code security settings

> **Purpose:** Security-focused Claude Code `settings.json` (protect secrets, block destructive shell).
> **Copy to:** `~/.claude` or `<project>/.claude`. · **Use when:** setting up Claude Code with safe defaults. · **Related:** [keychain](../../scripts/keychain), [secret-guard](../../scripts/secret-guard)

A **balanced** starting point for `settings.json` — safe defaults you copy in and
then tune, rather than a lock-everything-down posture. Today this targets Claude
Code; the same secret-protection mindset carries over if you add an IDE assistant
later (see the note at the bottom).

## What it does

- **Protects secrets** — denies reads of `.env*`, key/cert files, `secrets/`,
  `credentials*`, and sensitive home dirs (`~/.ssh`, `~/.aws`, `~/.config/gcloud`).
  Denies win over allows, so the broad `Read(./**)` allow never exposes these.
- **Blocks destructive shell** — `rm -rf`, `sudo`, piping a download straight into
  a shell (`curl … | sh`), force-pushes, and `eval`.
- **Asks before outward/irreversible actions** — `git push`, `git reset --hard`,
  publishing a package, cutting a release.
- **Allows everyday dev** — git inspection/commit, `pnpm`/`npm run`, Biome, `tsc`,
  Vitest, Playwright.

## Where it goes

| File | Scope | Commit? |
| --- | --- | --- |
| `~/.claude/settings.json` | all your projects | n/a (personal) |
| `<project>/.claude/settings.json` | shared, per-project | yes |
| `<project>/.claude/settings.local.json` | personal, per-project | no (gitignore it) |

Project settings override user settings; `.local` overrides shared. Precedence for
a given rule is **deny → ask → allow**.

## Tuning

- Pattern syntax is `Tool(specifier)`, e.g. `Bash(pnpm*)`, `Read(./secrets/**)`.
- Hitting prompts for a command you trust? Add it to `allow`.
- Want a tighter posture? Flip `defaultMode` to `"acceptEdits"`→`"plan"`/deny-by-
  default and grow the allowlist explicitly.

## If you add an IDE assistant later

The principle that ports is **keep secrets out of the model's reach**: ignore
`.env*`/keys/`secrets/` in whatever the assistant indexes, and keep an explicit
denylist for credential paths. The rule *syntax* will differ per tool, but the list
of paths to protect above is a good seed.
