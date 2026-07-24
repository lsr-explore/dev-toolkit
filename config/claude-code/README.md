# Claude Code security settings

> **Purpose:** Security-focused Claude Code `settings.json` (protect secrets, block destructive shell).
> **Copy to:** `~/.claude` or `<project>/.claude`. · **Use when:** setting up Claude Code with safe defaults. · **Related:** [keychain](../../scripts/keychain), [secret-guard](../../scripts/secret-guard), [branch-guard](../../scripts/branch-guard)

A **balanced** starting point for `settings.json` — safe defaults you copy in and
then tune, rather than a lock-everything-down posture. Today this targets Claude
Code; the same secret-protection mindset carries over if you add an IDE assistant
later (see the note at the bottom).

## What it does

- **Protects secrets** — denies reads of `.env*`, key/cert files, `secrets/`,
  `credentials*`, and sensitive home dirs (`~/.ssh`, `~/.aws`, `~/.config/gcloud`).
  Denies win over allows, so the broad `Read(./**)` allow never exposes these.
- **Blocks destructive shell** — `rm -rf`, `sudo`, piping a download straight into
  a shell (`curl … | sh`), `git clean`, force-pushes, and `eval` — plus the
  bypass/`main` guards that pair with [`branch-guard`](../../scripts/branch-guard):
  `--no-verify` commits/pushes and direct `git push origin main`.
- **Asks before outward/irreversible actions** — `git push`, `git reset --hard`,
  opening a PR (`gh pr create`), publishing a package, cutting a release.
- **Allows everyday dev** — git inspection/commit/pull, web search, `pnpm`/`npm run`,
  Biome, `tsc`, Vitest, Playwright.

## Rule files (`rules/`)

Alongside `settings.json`, this folder ships [`rules/`](./rules) — drop-in
`.claude/rules/*.md` files (prompt-injection/security, coding standards, frontend,
testing, workflow) that Claude Code loads as standing guidance on top of `CLAUDE.md`.
Copy the ones a project needs into `<project>/.claude/rules/`; `security.md` is the
copy-verbatim baseline, the rest adapt to your stack. See
[`rules/README.md`](./rules) for the per-file breakdown. The `current-state` rule lives
separately with the session-metrics scaffolding under
[`templates/docs/session-metrics/claude-rules`](../../templates/docs/session-metrics/claude-rules).

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
- **Piped/compound commands still prompt** even when the first command is allowed:
  Claude splits on `&&`, `||`, `;`, `|`, `&`, and newlines, and **each subcommand
  must match a rule on its own**. Allow the pieces you actually pipe to
  (`Bash(head*)`, `Bash(grep*)`, `Bash(jq*)`), or run `/fewer-permission-prompts`
  to have Claude scan your transcripts and propose the allowlist for you.
- Want a tighter posture? Flip `defaultMode` to `"acceptEdits"`→`"plan"`/deny-by-
  default and grow the allowlist explicitly.

## Working across git worktrees

A session started in one worktree will prompt on every read into a sibling worktree.
Grant the shared base path once via `additionalDirectories` so reads across all
branch worktrees stop asking. The template ships a **placeholder** — replace it with
your real base:

```json
"additionalDirectories": ["/absolute/path/to/your/worktrees"]
```

If your worktrees live at `<base>/<branch>/<repo>` (the [`wt`](../../scripts/worktrees)
convention), point it at `<base>` — the dir that holds every `<branch>/<repo>` tree.
This is **file access only** — to also load a `CLAUDE.md` or hooks from those dirs,
launch with `--add-dir <path>` (or `/add-dir` mid-session) instead of the setting.
See [`docs/ai-collaboration.md`](../../docs/ai-collaboration.md) → "Read across
worktrees" for the friction this removes.

## Away from keyboard: keep the Mac awake + get notified

When you step away and rely on a "done" ping, keep the machine from sleeping mid-task:

```bash
# run in a spare terminal; releases automatically when Claude exits
caffeinate -is -w $(pgrep -fn claude)
```

`-i` blocks idle sleep, `-s` blocks sleep on AC; the display can still sleep. For the
ping itself, `/config` → enable the mobile push options (Claude Code v2.1.110+ and
the mobile app). For a custom notifier, add a `Notification` hook to this file:

```json
"hooks": {
  "Notification": [
    { "matcher": "permission_prompt|agent_completed",
      "hooks": [{ "type": "command",
        "command": "osascript -e 'display notification \"Claude needs you\" with title \"Claude Code\"'" }] }
  ]
}
```

Left out of the template itself since it's personal convenience, not a security
default. See [`docs/ai-collaboration.md`](../../docs/ai-collaboration.md) for the
friction these solve.

## If you add an IDE assistant later

The principle that ports is **keep secrets out of the model's reach**: ignore
`.env*`/keys/`secrets/` in whatever the assistant indexes, and keep an explicit
denylist for credential paths. The rule *syntax* will differ per tool, but the list
of paths to protect above is a good seed.
