# Backlog — snippet ideas

Candidate additions to the toolkit, to prioritize when the mood strikes. Bias for
all of these: **self-contained, zero/minimal runtime deps, macOS-first**, and a
per-folder `README.md` (see [`../CLAUDE.md`](../CLAUDE.md)).

## Queued

- **Recommended Chrome extensions** — an opinionated, copy-paste list of browser
  extensions worth installing (a11y: axe DevTools, WAVE; perf: Lighthouse, React
  DevTools; etc.) with one line on why each. Pairs with the `a11y-check` and
  `playwright` snippets.
- **Performance tools** — a reference for front-end performance tooling (Lighthouse /
  Lighthouse CI, Web Vitals, bundle analysis, flame-graph profiling) with quick
  copy-paste commands. Complements the size-limit / bundle notes in
  [`toolchain.md`](./toolchain.md).
- **Rate limiter (token-bucket)** — pace outgoing API calls under a provider's
  per-second/minute limit. Slots between [`ai-cache`](../scripts/ai-cache) (dedup
  identical calls) and [`http-fetch`](../scripts/http-fetch) (429 backoff) to round
  out cost / rate-limit handling.
- **Generalize `ai-cache` (parked — leave as-is for now)** — it's already
  provider-agnostic (an API/response cache, not AI-specific). Future consideration:
  a "beyond AI calls" README note, or a rename to a general response cache, so its
  use for paid / rate-limited APIs is discoverable. No change for now.
- **`.editorconfig`** — baseline cross-editor whitespace/charset rules; a near-
  universal new-repo file.
- **`.gitignore` starter** — sensible Node/TS frontend defaults, plus the env/secret
  and tool-artifact patterns this repo already uses.
- **Conventional commits / commitlint** — config + a hook. Referenced in
  [`toolchain.md`](./toolchain.md) but no copyable snippet yet.
- **Env-var validation** — a fail-fast startup check for missing/invalid env vars
  (zero-dep, or zod/envalid), for Node/Python backends. Complements
  [`keychain`](../scripts/keychain).
- **devcontainer / Dockerfile starter** — a reproducible dev environment for the
  occasional containerized project.
- **TS-tips agent skill** — promote the TODO in [`references.md`](./references.md):
  package the TypeScript tips as a reviewable Claude Code skill.

*Shipped so far: CLI boilerplate, secret-guard, kill-port, node-version, http-fetch,
a11y-check, playwright, the `wt` post-create hook, and CI starters — see the layout
map in the top-level [`README.md`](../README.md).*

---

*To promote an item: give it a folder + README, keep it self-contained, update the
layout map in the top-level `README.md`, and remove it from this list.*
