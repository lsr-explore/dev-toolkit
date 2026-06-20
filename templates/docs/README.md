# Documentation templates

Copy-ready scaffolding for two documentation habits that scale well on solo and
small-team projects:

- **A session log** (`project_log.md`) — a running record of design/build sessions.
- **Decision records** (`decision-records/NNNN-*.md`) — ADRs for architectural
  commitments.

Both follow one principle: **the repo presents current state only.** Living state is
overwritten in place; history is append-only; superseded material is archived
*outside* the repo rather than left behind with "deprecated" banners.

## What's here

| File | Copy to | Purpose |
| --- | --- | --- |
| `project_log.md` | `docs/project_log.md` | the four-zone session log template |
| `decision-records/0000-template.md` | `docs/decision-records/` (rename to `NNNN-name.md`) | one ADR |
| `decision-records/README.md` | `docs/decision-records/README.md` | ADR conventions |
| `claude-rules/project-log.md` | `.claude/rules/project-log.md` *(optional)* | keeps the log discipline from drifting |

## Adopt it

1. `mkdir -p docs/decision-records` in the target repo.
2. Copy `project_log.md` and the `decision-records/` files over.
3. Replace every `<placeholder>` and delete the `<!-- guidance -->` comments as you
   fill each section.
4. (Optional) If the repo uses Claude Code, copy `claude-rules/project-log.md` to
   `.claude/rules/` so the end-of-session update discipline is written down where the
   assistant will see it.

## The one mistake to avoid

Treating the **whole** log as append-only. That buries the "current state" pointer
and lets it go stale. The log deliberately mixes **living** zones (overwrite each
session) with an **append-only** history zone — keep them separate. See the comments
inside `project_log.md`.
