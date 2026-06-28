# Maintaining `docs/project_log.md`

<!--
Optional drop-in for Claude Code projects: copy to `.claude/rules/project-log.md`.
It encodes the end-of-session discipline so the assistant keeps the log current
instead of letting §1 go stale. Tune the command names (lint, usage, cost) to the repo.
-->

The session log mixes **living state** (edit in place) with **immutable history**
(append once). Treating the whole file as "append-only" is the usual mistake — it
buries the current-state pointer and lets it go stale. The file has zones, in fixed
order:

| Zone | Mutability | Rule |
| --- | --- | --- |
| §1 ▶ Current state | **living** | **overwrite** every session; never dated as history |
| §2 Delivery tracker | **living** | **append one row** per session |
| §3 Session history | **append-only** | **prepend** one entry, newest on top; never edit past entries |

## End-of-session checklist

When a working session wraps (and the user hasn't said to skip it), do all three:

1. **Overwrite §1 (Current state)** so it reflects *now*: what's merged, what's in
   flight (branch + PR + CI), what to pick up next, plus the standing *Read-first /
   Settled / Open / Housekeeping* blocks. Update the `**Updated:**` date. This is a
   replace, not an append — §1 is always a single snapshot of the present.
2. **Append a row to §2 (tracker)**: date · milestone · effort split · (optional
   time/cost) · breakdown. Effort split = Build · Setup · Churn (rework — drive down)
   · Design/Docs. If you track time/cost figures the assistant can't read, **ask the
   user** for them at session end rather than guessing.
3. **Prepend an entry to §3 (history)** using the template below. Write it once;
   later sessions never edit it.

## Entry depth — tiered

Default **lean**. Use the **rich** tier only for milestone sessions (a PR ships, a
decision lands). Keep it "light, not exhaustive — reflection, not transcription."

**Lean (default):** `What we accomplished` · `Demo script` (if user-facing) · `How to
verify` · `Open items left` · `Collaboration notes`.

**Rich (milestone) adds** two sections after *What we accomplished*: `Decisions` (the
call + one-line why, cross-linking any ADR) and `Delivered` (PR # · key commits · new
deps).

Do **not** put a per-session status table inside a §3 entry — in-flight status lives
in §1, cumulative status in §2. Each fact has one home.

## Formatting

- Bullets use `-` (dash). Never start a wrapped line with `+` or `*` — markdownlint
  reads it as a list marker and the file's list-style cascades (MD004).
- Surround lists and tables with blank lines; headings increment by one level only.
- Run the repo's markdown linter before committing log edits.
