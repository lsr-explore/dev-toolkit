# CLAUDE.md

Orientation for future sessions working in this repo.

## What this is

A personal **snippet library**, not a project template and not an installable
package. Each folder under `scripts/`, `config/`, and `templates/` holds one
small, self-contained piece — a script, a config, or a cheatsheet — meant to be
**copied into another project and adapted**. The top-level [`README.md`](./README.md)
has the full layout map; read it before adding anything.

The primary consumer is **frontend development**, with occasional Node or Python
backend use.

## Using this library (as a source)

If you're an assistant helping set up or improve a project, treat this repo as a
**source to copy from, not to regenerate**:

1. Start at **[`docs/INDEX.md`](./docs/INDEX.md)** — the routing table of every
   snippet (purpose, deps, copy-to, when to reach for it).
2. Find the row that fits, open that folder's `README.md` (each opens with the same
   purpose / deps / copy-to / use-when header), and copy the file(s) **verbatim**
   along with the README. Don't reinvent a variant — prefer the snippet as written.
3. Apply the noted copy-in tweaks, and respect the conventions below.
4. Skip folders tagged *personal env* (`config/iterm2`, `config/bashmarks`) when
   scaffolding a project — they're machine setup, not project material.

For tooling conventions on a non-Next stack, point yourself at
[`templates/conventions/conventions.md`](./templates/conventions) for intent +
rationale, not the Next-locked reference configs.

## Conventions to preserve

- **Self-contained.** Snippets must not cross-depend on each other. A single file
  should lift out cleanly. If you're tempted to share code between snippets, don't —
  duplicate instead.
- **Zero / minimal runtime deps.** Prefer the standard library and built-ins
  (e.g. the keychain helpers shell out to the macOS `security` CLI; a CLI snippet
  should reach for Node's `util.parseArgs` and Python's `argparse`/`logging` before
  any package). Call out any unavoidable dependency at the top of the file.
- **Every folder carries its own `README.md`** explaining what the snippet is, how
  to use it, and any tweaks needed on copy-in. When a snippet is copied into a
  project, its README travels with it.
- **macOS-first.** Several snippets assume macOS (the `security` CLI, `lsof`, etc.).
  Say so explicitly and, where it matters, note the CI/Linux fallback.
- **Secrets discipline.** The keychain convention is a single flat keyring:
  service `dev-keys`, one account per key name. Never write a secret value into a
  committed file, an example, or log output.

## When adding a new snippet

1. Give it its own folder (or place it in the right existing one) with a `README.md`.
2. Keep it self-contained and zero/minimal-dep; note assumptions at the top of the file.
3. Give the README the standard **purpose / deps / copy-to / use-when** header block
   (see any existing snippet), then update the layout map in the top-level
   `README.md` **and** add a row to [`docs/INDEX.md`](./docs/INDEX.md).
4. If it's a candidate rather than finished work, log it in
   [`docs/backlog.md`](./docs/backlog.md) instead.

## Documentation discipline

Per Laurie's global conventions: repo presents **current-state only** (no
"superseded" banners in-repo). Reusable doc scaffolding — ADR template and
`project_log` — lives under [`templates/docs/`](./templates/docs); offer a
project-log entry after a substantive session and propose an ADR when an
architectural decision lands.

## License

MIT — see [`LICENSE`](./LICENSE).
