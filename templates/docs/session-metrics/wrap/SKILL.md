---
name: wrap
description: End-of-session wrap-up — draft and write a metrics record to docs/metrics/sessions/, (re)generate any report, and overwrite docs/current-state.md. Use when the user says to wrap up, close out the session, or log the session.
---

# Session wrap-up

<!--
Copy to `.claude/skills/wrap/SKILL.md`. This is the ritual that makes the session-metrics
approach sustainable. Tune the commands (usage/cost CLI, formatter, markdown linter, and
whether you have a report generator) to the repo before relying on it.
-->

Outputs: a **metrics record** (`docs/metrics/sessions/`), any **regenerated report** (only if
the repo has a generator), and the **current-state doc** (`docs/current-state.md`, per
`.claude/rules/current-state.md`).

**Core rule: draft every field yourself, then show it for correction.** Never present a blank
form and never ask the user to self-report numbers you can compute. They correct; they do not
fill in. This is the whole reason the ritual is sustainable.

## 1. Gather what's measurable

Run these before drafting anything. **One row per CLI session** — read only *this* session's
own usage; don't sum across parallel worktrees, which double-counts.

```sh
# Cost — THIS session only (transcript filename is the session UUID). Adjust to your usage CLI.
ccusage session --json -i <this-session-uuid>

# Delivered — PRs and issues opened for this work
gh pr list --state all --search "created:>=<DATE>" --json number,title
gh issue list --state all --search "created:>=<DATE>" --json number,title
```

For `review.*`, read your PR bot's threads on any PR touched this session and count findings
by disposition: `fixed` (defect corrected in-PR), `deferred` (valid but out of scope → became
an issue), `declined` (not applicable / wrong direction / gold-plating). The *reasoning* lives
in the PR thread reply — don't duplicate it here, just count.

If a number genuinely isn't available (e.g. the current session hasn't flushed to disk yet, so
the usage CLI can't see it), write `null`. **Never estimate a measured field.**

## 2. Draft the judgment fields yourself

These only you can write, because you were in the conversation:

- **`effort_split`** — % across `build` / `setup` / `design` / `docs` / `verify_ops` /
  `churn`, summing to 100. Churn = rework and detours, the number to drive down. Keep
  `design` (deliberation, ADRs) separate from `docs` (maintaining log/README) so doc
  *overhead* stays visible.
- **`rework_of`** — **record ids** (session filename without `.json`) of *earlier* sessions
  this one redid. Use ids, not dates — several sessions can share a date. Cross-session rework
  is the expensive kind: a decision didn't hold. Check recent records' `decisions` before
  writing this.
- **`churn_attribution`** — split the *within-session* churn by cause: `under_specified` (the
  prompt didn't carry what it needed), `claude_error` (I misread, assumed, or ignored
  context), `genuine_discovery` (nobody could have known upfront). **Be honest about
  `claude_error`** — a metric that flatters me is worthless.
- **`ratings`** — 1–5 on `scoping_clarity` (how clear was the ask at start?),
  `decision_stability` (did settled decisions stay settled — including *my own* design
  calls?), `tooling_leverage` (skills, subagents, right command first time). **Make these
  vary.** A column of 5s is worse than no column. If a session was mediocre on a dimension,
  say 3.
- **`decisions`** — short pointers to what got decided, one line each. Reference the ADR where
  one exists; don't restate it. This is what makes `decision_stability` auditable.
- **`themes`** — one or more of the project's defined theme vocabulary.
- **`retro`** — `went_well`, `improve`, `tooling_suggestion`; a sentence or two each. Fold in
  any feedback the user gave, without who-said-it labels — corrections usually land in
  `improve`, useful patterns in `went_well`.

Also set: `confidence` (`measured` live, `reconstructed` for backfill), `parallel_agents`, and
`context_over_150k_pct` if your usage view reports it.

## 3. Confirm, then write

Show the drafted record and ask for corrections **before** writing. Then:

1. Write `docs/metrics/sessions/YYYY-MM-DD-slug.json`, pretty-printed, 2-space indent. If
   another session already exists for that date, add an `-a-` / `-b-` infix to **both** so the
   filenames sort in the order the sessions happened.
2. If the repo has a report generator, run it to regenerate the report/table/charts. **Never
   hand-edit generated files** — fix the record and re-run.
3. **Overwrite** `docs/current-state.md` — both sections — per `.claude/rules/current-state.md`.
   Replace, don't append: it holds no history. Keep it short.
4. Run the repo's formatter then its markdown linter. A JSON formatter will reformat a
   hand-written record, so normalize it before committing (a pre-commit hook may otherwise
   block on it).

Do not commit unless asked.
