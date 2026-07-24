# Documentation templates

> **Purpose:** Doc scaffolding: session-metrics + `current-state` + ADR templates with guides.
> **Copy to:** `docs/` (+ optional `.claude/` pieces) · **Use when:** adopting documentation
> discipline in a repo.

Copy-ready scaffolding for documentation habits that scale well on solo and small-team
projects:

- **Session metrics** ([`session-metrics/`](./session-metrics)) — a machine-readable record
  per CLI session (effort split, churn attribution, collaboration retro) plus a living
  `current-state.md`. Tracks whether AI-collaboration effectiveness improves over time.
- **Decision records** ([`decision-records/`](./decision-records)) — ADRs for architectural
  commitments (`decision-records/NNNN-*.md`).

Both follow one principle: **the repo presents current state only.** Living state
(`current-state.md`) is overwritten in place; the per-session records are the append-only
history; superseded material is archived *outside* the repo rather than left behind with
"deprecated" banners.

> **Note — the narrative `project_log.md` has been retired.** The old four-zone prose log is
> superseded by the session-metrics records + `current-state.md` split above (structured
> capture beats a prose file that goes stale). If you're picking up an older repo that still
> has one, treat `current-state.md` as the successor to its §1/§4 and the metrics records as
> the successor to its §2/§3.

## What's here

| Path | Copy to | Purpose |
| --- | --- | --- |
| `session-metrics/` | `docs/metrics/` | per-session JSON records + schema + reading guide |
| `session-metrics/example-session.json` | `docs/metrics/sessions/` | a filled-in record to copy the shape from |
| `session-metrics/claude-rules/current-state.md` | `.claude/rules/current-state.md` *(optional)* | keeps the living snapshot from drifting |
| `session-metrics/wrap/SKILL.md` | `.claude/skills/wrap/SKILL.md` *(optional)* | the `/wrap` ritual that drafts a record + overwrites `current-state.md` |
| `decision-records/0000-template.md` | `docs/decision-records/` (rename to `NNNN-name.md`) | one ADR |
| `decision-records/README.md` | `docs/decision-records/README.md` | ADR conventions |

## Adopt it

1. `mkdir -p docs/metrics/sessions docs/decision-records` in the target repo.
2. Copy `session-metrics/README.md` + `example-session.json` into `docs/metrics/`, and the
   `decision-records/` files over.
3. Read [`session-metrics/README.md`](./session-metrics) — define your project's `themes`
   vocabulary, decide whether you want a report generator (build-your-own), and start
   dropping one record per session.
4. (Optional, Claude Code) Copy `session-metrics/claude-rules/current-state.md` to
   `.claude/rules/` and `session-metrics/wrap/SKILL.md` to `.claude/skills/wrap/` so the
   end-of-session discipline is written down where the assistant will see it.

## The one mistake to avoid

Letting `current-state.md` accrete history. It holds **only the present** — overwrite it each
session. The moment you want to write "on the 9th we…", that belongs in a session record, an
ADR, or a settled-decisions block — not the snapshot. See
[`session-metrics/claude-rules/current-state.md`](./session-metrics/claude-rules/current-state.md).
