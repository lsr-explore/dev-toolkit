# Project Log

Working log of design and build sessions. Light, not exhaustive — the goal is
reflection, not transcription.

<!--
This file mixes LIVING state (overwrite in place) with IMMUTABLE history (append once).
Four zones, in fixed order:

  §1 Current state            — LIVING: overwrite every session; never dated as history
  §2 Delivery tracker         — LIVING: append one row per session
  §3 Session history          — APPEND-ONLY: prepend one entry, newest on top; never edit past entries

If the repo uses Claude Code, the end-of-session checklist lives in
.claude/rules/project-log.md (copy it from templates/docs/claude-rules/).
-->

---

## ▶ §1 Current state *(living — overwrite each session)*

**Updated:** <YYYY-MM-DD>

**Done / merged:** <what's landed on the main branch right now — the present snapshot,
not a history. Replace this whole block each session.>

**In flight:** <what's being worked on — branch · PR # · CI status · what it delivers.>

**Pick up at:** <the single most useful next action, with enough context to start cold.>

**Read first:**

- <pointer to the spec / plan / key doc a newcomer (or future-you) should read first>
- <ADRs worth knowing: e.g. `0001` deployment · `0002` data model>

**Settled — do not relitigate:** <decisions that are closed, so they don't get
re-opened every session. Keep this tight; move the reasoning to an ADR when it's load-bearing.>

**Open questions:** <genuinely unresolved calls. Move to "Settled" when decided.>

**Housekeeping:** <recurring gotchas — tool invocation quirks, setup prerequisites,
commit conventions — that bite every session until written down.>

---

## §2 Delivery tracker

One row per session: value delivered vs. cost. Adjust columns to taste — the useful
core is the **effort split** (where the time actually went) and a short breakdown.

<!--
Effort split buckets (tune to your work):
  Build      — feature/slice functionality
  Setup      — one-time platform/tooling
  Churn      — rework/detours (the number to drive DOWN)
  Design/Docs

Time / cost columns are optional. If you track them, note where the figures come from
(e.g. a CLI usage/cost command) — and that they may be informational, not out-of-pocket.
-->

| Date | Milestone | Effort split | Time | Notes / breakdown |
|---|---|---|---|---|
| <YYYY-MM-DD> | <what shipped> | Build X% · Setup Y% · Churn Z% · Docs W% | <optional> | <one-line breakdown grouped by bucket> |

---

## §3 Session history

Newest on top. Entries are written once and not edited later. Default **lean**; use
the **rich** tier for milestone sessions (a PR ships, a decision lands).

<!-- ============================ LEAN ENTRY (default) ============================ -->

### <YYYY-MM-DD> — <session description>

**Time:** <~Xh wall · optional cost>

**What we accomplished:**

- <bullet>

**Demo script:** *(required when the session delivers user-facing functionality; omit
only for design/docs/infra-only sessions — and say so)*

- <numbered, copy-pasteable steps to SHOW the feature working to a human: how to launch
  it (env / command / URL), the exact inputs to enter, what to expect on screen. Distinct
  from "How to verify" — this is the live click-through, not the automated checks.>

**How to verify:**

- <short, reproducible steps a reviewer or future-you would run to confirm the work —
  the actual commands / paths / URLs, not "we verified it.">

**Open items left:** <link or summary>

**Collaboration notes:**

- <what was learned about *how* the work went — a corrected assumption, a workflow
  gotcha worth carrying forward, a decision that turned out to be load-bearing>

<!-- ===================== RICH ENTRY (milestone sessions) =====================
Same as lean, plus these two sections AFTER "What we accomplished" and BEFORE "How to verify":

**Decisions:**

- <the call + the one-line why; cross-link the ADR if one was written>

**Delivered:** <PR #N (status) · key commits · new dependencies>

Do NOT put a per-session status table inside an entry — in-flight status lives in §1,
cumulative status in §2. Each fact has exactly one home.
-->

<!--
Formatting (so markdownlint stays quiet):
- Bullets use `-` (dash). Never start a wrapped line with `+ ` or `* ` — markdownlint
  reads it as a list marker and the file's list-style cascades (MD004).
- Surround lists and tables with blank lines; headings increment by one level only.
-->
