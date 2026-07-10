# Global packages

Global npm CLIs worth having on a dev machine — installed once and reached for
occasionally, rather than wired into any one project. Not snippets to copy;
machine setup, like the *personal env* configs. Most run fine one-off via `npx`
too, if you'd rather not install globally.

```bash
# usage insight, git + dependency maintenance, local servers, MCP bridge
npm i -g ccusage git-trim npm-check-updates json-server http-server mcp-remote

# novelty / vibe check
npm i -g devlove devrage
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

## git-trim

> `npm i -g git-trim` · installs a `git trim` subcommand

Quickly removes local branches that are **merged, pruned, untracked, or stale** —
the cleanup after a PR merges and the remote branch is deleted. Complements the
squash-merge gotcha noted in [`ai-collaboration.md`](./ai-collaboration.md):
`git branch --merged` under-reports after a squash, and `git trim` is one way to
sweep the leftovers (verify what it targets before letting it delete).

## npm-check-updates

> `npm i -g npm-check-updates` · runs as `ncu`

Finds dependency versions **newer than your `package.json` allows** and (with
`ncu -u`) rewrites the ranges so a reinstall pulls them. The upgrade counterpart to
[replacements.fyi](./references.md) (which finds *replacements* for dead packages).
Run it, review the diff, then `pnpm install` — it doesn't install for you, and it
will happily suggest majors, so read before applying.

## json-server

> `npm i -g json-server` · <https://github.com/typicode/json-server>

Stands up a **full fake REST API from a single JSON file** in seconds — GET/POST/
PUT/PATCH/DELETE with filtering, sorting, and pagination, no backend code. Handy
for wiring up frontend data-fetching before the real API exists, or for a stable
fixture in local dev.

## http-server

> `npm i -g http-server` · <https://github.com/http-party/http-server>

A zero-config static file server for the current directory.

**You probably don't need this globally.** For plain static serving the built-in
equivalent already ships on macOS:

```bash
python3 -m http.server 8000      # serves ./ on :8000 — no install
```

(Node has no bundled one-liner; the on-demand equivalent is `npx serve` /
`npx http-server`.) Reach for the `http-server` package only when you want what the
Python one-liner doesn't give you: a Node-native server that matches a JS project's
runtime, `--cors`, cache-control headers, a `-P` proxy for SPA history fallback, or
`-S` HTTPS. Otherwise `python3 -m http.server` covers it.

## mcp-remote

> `npm i -g mcp-remote` · <https://github.com/geelen/mcp-remote>

A proxy that lets **local-only MCP clients reach a remote MCP server** (over
HTTP/SSE, with OAuth). MCP clients like Claude Desktop speak stdio to a local
process; `mcp-remote` is the local process that bridges to a hosted server. You
rarely invoke it by hand — it goes in an MCP client config as the command, e.g.:

```jsonc
// claude_desktop_config.json (or another MCP client's config)
{ "mcpServers": {
    "my-remote": { "command": "npx", "args": ["mcp-remote", "https://example.com/mcp"] }
} }
```

Installing it globally just avoids the `npx` cold-start each launch.

## devlove

> `npm i -g devlove` · <https://github.com/SirTenzin/devlove>

Novelty CLI: counts how many times you've **been kind** to your coding agents
(scans your agent transcripts for polite/appreciative messages). Pure fun / vibe
check, not a metric to act on.

## devrage

> `npm i -g devrage`

The counterpart to `devlove`: counts how many times you've **sworn at** your
coding agents. Also novelty — a lighthearted read on how a rough session went.
