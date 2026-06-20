# Decision records (ADRs)

Architecture Decision Records capture the **architectural commitments** worth
remembering — the ones where someone will later ask "wait, why did we do it this
way?" Not every decision needs one; reach for an ADR when the choice is hard to
reverse, shapes the system's shape, or closed off real alternatives.

## Conventions

- **Location:** `docs/decision-records/NNNN-kebab-title.md`.
- **Numbering:** zero-padded, **sequential**, starting at `0001`. Never reuse or
  renumber. `0000-template.md` is the template (not a real record).
- **One decision per file.** If you're deciding two things, that's two ADRs.
- **Immutable once Accepted.** Don't rewrite history to reflect a later change of
  mind — write a **new** ADR that supersedes the old one, and update both the old
  ADR's `Superseded by` and the new one's `Supersedes`. The old file stays as the
  historical record of what was true then.

## Structure

Copy [`0000-template.md`](./0000-template.md) and fill it in. The sections:

| Section | Required? | Holds |
| --- | --- | --- |
| Status / Date / Deciders / Supersedes / Superseded by | yes | the metadata header |
| Context | yes | the forces and constraints that made a decision necessary |
| Decision | yes | the choice, stated plainly in the active voice |
| Rationale | yes | why this option won |
| Alternatives considered | yes | what lost, and the specific tradeoff that sank it |
| Consequences (positive / negative / neutral) | yes | the honest aftermath, including costs you're accepting |
| Operational guardrails | optional | concrete limits/alerts/budgets that ship with the decision |
| Open follow-ups | optional | sub-questions to revisit |
| Related | yes | links to other ADRs, the spec, the session-log entry |

## Status lifecycle

```
Proposed ──▶ Accepted ──▶ Superseded
                 │
                 └── (stays Accepted indefinitely if never replaced)
```

- **Proposed** — drafted, not yet committed (useful for review before building).
- **Accepted** — the decision is in force.
- **Superseded** — replaced by a later ADR; keep the file, set `Superseded by`.

## Tips

- Write the **Alternatives** honestly — an ADR whose alternatives all look obviously
  bad isn't recording a real decision. The value is the tradeoff you can't see later.
- Cross-link the **project_log** session where the decision landed, so the narrative
  ("how we got here") and the record ("what we chose") point at each other.
- Keep it current-state: an ADR documents one decision at one time; don't bolt
  "update: we later changed X" onto it — that's a new ADR.
