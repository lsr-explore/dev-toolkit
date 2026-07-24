# Session metrics

> **Purpose:** A machine-readable, per-session record of how a project got built —
> effort distribution, churn, and collaboration retrospective — so you can track whether
> **AI-collaboration effectiveness is improving over time**.
> **Copy to:** `docs/metrics/` (+ optional `.claude/` pieces below) · **Deps:** none required
> (a report generator is yours to add) · **Use when:** you want trend data on *how* the work
> goes across sessions. · **Related:** [`../decision-records`](../decision-records)

The session-record approach: instead of a prose log, each CLI session leaves a small **JSON
record**, and a living `current-state.md` holds the present snapshot. It **supersedes the
retired narrative `project_log.md`** — structured capture beats a prose file that goes stale.
If you're migrating an older repo, the zones map across cleanly:

| Retired `project_log.md` zone | Successor here |
| --- | --- |
| §1 Current state + §4 Agent pickup notes | `docs/current-state.md` (living, overwritten each session) |
| §2 Delivery tracker | `sessions/*.json` — one structured record per session |
| §3 Session history (retro / decisions) | the `retro` / `decisions` fields inside each record |

The payoff is the *ratios over time* — churn %, what caused the churn, docs overhead, cost per
merged PR — for a ~2-minute-per-session structured record (and the record is **drafted for
you**; see the `/wrap` ritual below, so it isn't 2 minutes of forms).

## Layout

| Path | Notes |
| --- | --- |
| `sessions/YYYY-MM-DD-slug.json` | one record per CLI session — hand-editable; see the schema below |
| `docs/current-state.md` | living snapshot (overwrite each session); see [`claude-rules/current-state.md`](./claude-rules/current-state.md) |
| `report.md` / `sessions.md` / `charts/` | **optional, generated** — build your own generator (see below) |
| `example-session.json` | a filled-in record to copy the shape from |

**Filenames sort chronologically.** When more than one session lands on a date, add an
`-a-` / `-b-` infix (`2026-01-09-a-....json`, `2026-01-09-b-....json`) so alphabetical order
matches the order they happened — any generator should sort by filename.

**One row per CLI session.** Under parallel worktrees, each session wraps *its own* work;
don't sum across project dirs, that double-counts. Effort and churn attribution are scoped
to what that session actually saw.

## Schema

Adapt the field set to your project — but keep the ones that carry the signal (marked ★).

| Field | Notes |
| --- | --- |
| `date` | ISO date of the session |
| `label` | short human description |
| `cli_sessions` | session UUID(s) contributing to this row |
| `parallel_agents` | max concurrent agents/worktrees; `1` = single-threaded |
| `confidence` | `measured` (captured live) or `reconstructed` (backfilled — approximate) |
| `themes` | one or more of your project's areas — **define your own vocabulary** (see below) |
| `cost_usd` | from a usage CLI (e.g. `ccusage`); `null` if not captured. On a subscription plan this is API-equivalent/informational, not out-of-pocket |
| `api_minutes` / `wall_minutes` | duration |
| `context_over_150k_pct` | share of usage above 150k context — a cache-read cost driver |
| ★ `effort_split` | % across `build` / `setup` / `design` / `docs` / `verify_ops` / `churn`, summing to 100. Keep `design` (deliberation, ADRs) **separate** from `docs` (maintaining log/README) so doc overhead stays visible as an automation target |
| ★ `churn_attribution` | % of the *within-session* churn by cause: `under_specified` (prompt), `claude_error`, `genuine_discovery` |
| ★ `rework_of` | record ids (filename without `.json`) of *earlier* sessions this one redid — **cross-session** rework, the expensive kind |
| `delivered` | `prs` / `issues` / `adrs` counts |
| `review` | PR-bot findings by disposition (`fixed` / `deferred` / `declined`); `ci_reruns` counts infra retries |
| ★ `ratings` | 1–5: `scoping_clarity`, `decision_stability`, `tooling_leverage`. **Make them vary** — a column of 5s looks like data and carries none |
| `decisions` | short pointers to what got decided; ADRs remain canonical |
| `retro` | prose: `went_well`, `improve`, `tooling_suggestion` |
| `note` | optional caveat (shared session, remapped bucket, backfilled row) |

See [`example-session.json`](./example-session.json) for a filled-in record.

### Define your own `themes`

The theme vocabulary is project-specific — it's how you slice *where* effort landed. Pick a
handful of stable buckets for your codebase, e.g. `frontend` · `backend` · `data` · `infra`
· `devex`. Keep the list short and fixed so the buckets stay comparable across sessions.

## Reading the numbers

- **`churn_attribution` is the point.** "We lost time" is noise; *why* is the skill. A
  falling `under_specified` share over time is the improvement curve. Be honest about
  `claude_error` — a metric that flatters the assistant is worthless.
- **Raw cost and duration are *not* the signal** — they're dominated by task difficulty. The
  signal is in the ratios: churn %, churn attribution, docs overhead, cost per merged PR.
- **`docs` is split from `design` on purpose.** Design deliberation is the work; doc upkeep
  is overhead. Bundled, a steady ~15% upkeep cost stays invisible — split, it's an
  automation target.
- **Two kinds of rework.** `churn` is within-session; `rework_of` is a later session redoing
  earlier work — more expensive, because a decision didn't hold, and the one `churn` alone
  can't see. Check recent records' `decisions` before writing `rework_of`.
- **Mark backfilled rows `reconstructed`.** If you seed history from an old log, its
  qualitative fields were *inferred*, not captured live — don't read the early trend as
  measurement.

## The report generator (build your own — not shipped)

A generator that reads `sessions/*.json` and emits `report.md`, a `sessions.md` table, and
charts is genuinely useful but **project-specific**, so it isn't included here. Keep the
records as the source of truth and, if you want a rollup:

- **Start with a table.** A `sessions.md` that lists every record's key fields is most of the
  value and trivial to generate (or maintain by hand early on).
- **For charts, reach for a real dataviz path**, not ASCII. Effort split is a per-session
  stacked bar; cost/time is best as two panels sharing one x-axis (avoid a dual y-axis — two
  independent scales let you manufacture any apparent correlation). If the assistant builds
  these, point it at the **`dataviz` skill** for a palette and accessibility rules.
- **Treat anything generated as output**: never hand-edit `report.md` / `sessions.md` /
  charts — fix the session record and re-run. Say so in the generator's header.

## The `/wrap` ritual (optional but recommended)

The whole thing is sustainable only if the record is **drafted for you and you just
correct it** — never a blank form. [`wrap/SKILL.md`](./wrap/SKILL.md) is a Claude Code skill
that gathers the measurable fields, drafts the judgment fields, shows the record for
correction, then writes it and overwrites `current-state.md`. Copy it to
`.claude/skills/wrap/` and tune the commands to your repo.
