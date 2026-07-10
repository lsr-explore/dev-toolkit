# Global packages

Global npm CLIs worth having on a dev machine — installed once, run occasionally
as a **sanity check** rather than wired into any project. Not snippets to copy;
machine setup, like the *personal env* configs.

```bash
npm i -g ccusage devlove devrage
```

(`ccusage` also runs fine one-off without a global install: `npx ccusage@latest`.)

## ccusage

> `npm i -g ccusage` · <https://github.com/ccusage/ccusage>

Analyzes coding-agent CLI **token usage and cost from local data** — it reads
Claude Code's own session transcripts under `~/.claude/projects/**/*.jsonl` and
sums tokens/cost, with daily/monthly/session breakdowns. Because it walks *every*
project directory on disk, it naturally spans **all git worktrees** in one total.

### Why it matters with worktrees (and how it differs from `/usage`)

Running work across git worktrees fragments Claude Code sessions:

- The `wt` helper's `-c` flag ([`scripts/worktrees`](../scripts/worktrees)) opens a
  new iTerm2 tab and launches a **fresh `claude` process** in the worktree
  (`cd <worktree> && claude`). It does not continue the session you ran `wt` from —
  each worktree gets its own independent session.
- Claude Code keys session storage by working directory
  (`~/.claude/projects/<sanitized-cwd>/`). Different worktree = different path =
  a separate project directory and separate session logs.

Crucially, **`/usage` won't roll these up.** Its figures are computed from local
session history *on this machine* for the session/directory you run it in (the
docs note they exclude other devices and claude.ai), so `/usage` in one worktree
can't see the sessions logged under another worktree's directory. What you saw is
the documented behavior, not a `wt` quirk.

`ccusage` sidesteps the fragmentation entirely: it aggregates across all those
per-worktree project directories, so it's the tool that gives a single complete
picture of usage when you've been working in parallel worktrees.

## devlove

> `npm i -g devlove` · <https://github.com/SirTenzin/devlove>

Novelty CLI: counts how many times you've **been kind** to your coding agents
(scans your agent transcripts for polite/appreciative messages). Pure fun / vibe
check, not a metric to act on.

## devrage

> `npm i -g devrage`

The counterpart to `devlove`: counts how many times you've **sworn at** your
coding agents. Also novelty — a lighthearted read on how a rough session went.
