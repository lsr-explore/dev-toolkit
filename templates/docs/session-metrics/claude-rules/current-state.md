# Maintaining `docs/current-state.md`

<!--
Optional drop-in for Claude Code projects: copy to `.claude/rules/current-state.md`.
Pairs with the session-metrics approach — the metrics records hold the per-session
history; this doc holds only the present. (It is the successor to the retired narrative
project_log's §1 Current-state + §4 Agent-pickup zones.)
-->

`docs/current-state.md` is the **living snapshot of the present** — it holds *no history*.
The per-session metrics records in `docs/metrics/sessions/` are the history; this doc is
overwritten every session and always describes *now*. Two sections:

| Section | Audience | Rule |
| --- | --- | --- |
| §1 Snapshot | humans | what's merged · what's in flight (branch · PR · CI) · what to pick up next · settled decisions · open questions |
| §2 Agent pickup notes | the next AI session | dense shorthand to start cold — inventory, exact next step with paths, locked decisions, housekeeping gotchas |

## Rules

- **Overwrite, never append.** Both sections are replaced each session. If it grows every
  time, something in it belongs in a metrics record, an ADR, or a settled-decisions doc — not
  here. Keep it short.
- **No dated history.** The moment you're tempted to write "on the 9th we…", it belongs in a
  session record, not here.
- **§1 is for a human picking up cold; §2 is for an assistant picking up cold.** Don't
  duplicate — §1 is readable prose, §2 is dense pointers with file paths.
- **List locked decisions in §1's "settled" block** so they don't get relitigated, and
  cross-link the ADR where the reasoning lives rather than restating it.

## Formatting

- Bullets use `-` (dash). Never start a wrapped line with a `+` or `*` followed by a space — a
  markdown linter reads it as a list marker and the file's list-style cascades (MD004).
- Surround lists and tables with blank lines; headings increment by one level only.
- Run the repo's markdown linter before committing.
