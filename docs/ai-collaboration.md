# Collaborating with Claude Code — friction & fixes

A running, personal log of the small things that add friction when pairing with
Claude Code, and what (if anything) fixed them. Most are trivial in isolation; the
point is to stop rediscovering them. Entries are honest about what's **solved**,
what's **partly** solved, and what's still **open**.

This is the personal, current-state version. A generalized *team* framework is
queued in [`backlog.md`](./backlog.md) ("AI collaboration"); this doc is its raw
material, not that deliverable.

Settings snippets below go in `~/.claude/settings.json` (all projects) or a
project's `.claude/settings.json` — see [`config/claude-code`](../config/claude-code)
for the base config and precedence rules (**deny → ask → allow**).

## Solved

### Keep the Mac awake while you step away and rely on remote notifications

Stepping away and trusting a "done" ping only works if the machine doesn't sleep
mid-task. Two halves:

- **Stay awake for exactly one session.** `caffeinate -w <pid>` holds the machine
  awake until that process exits, so tie it to the running Claude process:

  ```bash
  # run in a spare terminal; releases automatically when Claude exits
  caffeinate -is -w $(pgrep -fn claude)
  ```

  `-i` blocks idle sleep, `-s` blocks sleep on AC power; the display can still sleep.
  Sanity-check that `pgrep -fn claude` returns the PID you mean before trusting it.

- **Get pinged remotely.** `/config` → enable **push when actions required** /
  **push when Claude decides** (needs Claude Code v2.1.110+ and the Claude mobile
  app). For a custom notifier instead, a `Notification` hook fires on the same events:

  ```json
  {
    "hooks": {
      "Notification": [
        { "matcher": "permission_prompt|agent_completed",
          "hooks": [{ "type": "command",
            "command": "osascript -e 'display notification \"Claude needs you\" with title \"Claude Code\"'" }] }
      ]
    }
  }
  ```

### Read across worktrees without approving every file

Worktrees live at `<base>/<branch>/<repo>`, so a session in one worktree prompts on
every read into a sibling. Grant the shared base once:

```json
{
  "permissions": {
    "additionalDirectories": ["/Users/laurie/dev/dev-toolkit"]
  }
}
```

Covers all branch worktrees under that base. This is **file access only** — to also
load a `CLAUDE.md`/hooks from those dirs, launch with `--add-dir <path>` (or `/add-dir`
mid-session) instead of the setting.

### "Merged" branches that don't look merged (squash gotcha)

After a **squash merge**, `git branch --merged` and `git cherry` both under-report:
squashing gives the merged work a brand-new commit hash, so the branch's own commits
are no longer ancestors of `main` even though their content landed. A branch can read
"43 commits ahead" while being fully merged.

**Check content, not commit identity:**

```bash
git diff --stat main..<branch>   # empty, or only files main has and the branch lacks → fully merged
```

If that shows no additions/modifications the branch introduces, it's safe to delete
(`git branch -D`, since `-d` won't recognize it). Confirm the PR merged with
`gh pr list --state merged`.

## Partly solved

### Piped/compound commands still ask even when allow-listed

Approving `Bash(git log*)` doesn't cover `git log | head` — Claude splits on shell
operators (`&&`, `||`, `;`, `|`, `|&`, `&`, newline) and **each subcommand must match
an allow rule on its own**. The `git log` half is allowed; `head` isn't, so it prompts.
There is no single "compound" rule that blesses both halves.

- **Allow-list the pieces you actually pipe to**, in the same glob style as the base
  config: `Bash(head*)`, `Bash(grep*)`, `Bash(wc*)`, `Bash(jq*)`, `Bash(sort*)`.
- **Or run `/fewer-permission-prompts`** — it scans your recent transcripts for the
  read-only commands you keep approving and proposes an allowlist to add. Turns the
  friction into an occasional cleanup instead of a per-command tax.

**Still open:** piping to a command you've never used will always re-ask (correctly),
and there's no way to say "this whole pipeline is read-only."

## Open

### No signal for how long a request will take

Hard to plan parallel work when you can't tell if a request is 10 seconds or 10
minutes. No native "expected duration" from the model today. Partial handles:

- **Ask for an estimate up front** ("roughly how long / how many steps?") before
  kicking off — cheap, and usually accurate enough to decide whether to wait.
- **Run long work in the background** (`/bg "<task>"`, or `claude --bg`) and get the
  completion ping, so a long task doesn't block you at all. Watch progress in the
  agent view.

The gap: no duration hint *before* work starts unless you ask.

### Reviewing a script before approving it — without rubber-stamping

When an approval is a full script, eyeballing it for anything malicious is slow, and
the real hazard is **automation bias** — approving on the Nth prompt without actually
reading. Two guards, neither complete:

- **Make the review mechanical, not vibes.** `/security-review` on pending changes,
  and `/code-review` / `/verify` before committing non-trivial work, so "did I check
  this" has an actual answer instead of a gut call.
- **Force a pause on the risky class.** Keep destructive/outward commands in the
  `ask`/`deny` lists (see [`config/claude-code`](../config/claude-code)) so the
  prompts you *do* get are the ones worth reading — and the routine ones are
  allow-listed away, lowering prompt fatigue.

The bias itself is a human-factors problem, not a settings one; the aim is to shrink
the volume of prompts so the remaining ones get real attention.

### VSCode "open file" diff can drop changes

When a file is open in VSCode, Claude sometimes surfaces the change as an editor diff;
closing the file before it's applied can lose the edit, and Claude has to redo it.
No clean fix yet. Workaround: let the change land / save before closing the tab, and
if an edit seems to vanish, ask Claude to re-apply rather than assuming it's there.

## Practices worth keeping

- **Let Claude draft commit messages and PR descriptions even when it didn't write the
  code.** It's consistently better at a tight, scannable summary than a hand-typed one.
  Paste the diff and ask — the authorship of the code doesn't have to match the prose.
- **Know which calls are yours.** Cost ceilings, naming, scope priority, and taste are
  decisions to keep, not delegate — a good assistant lays out clean options and throws
  the choice back rather than pre-deciding. When it quietly picks one of those for you,
  that's the signal to pull the decision back.

## Further reading

Official and community best-practices guides — the principles/happy-path layer this
friction log sits beneath — are collected under **Claude Code best practices** in
[`references.md`](./references.md).
