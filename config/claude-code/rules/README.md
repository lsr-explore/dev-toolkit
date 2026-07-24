# Claude Code rule files

> **Purpose:** Drop-in `.claude/rules/*.md` — focused, per-topic guidance Claude Code loads alongside `CLAUDE.md`. · **Deps:** Claude Code
> **Copy to:** `<project>/.claude/rules/`. · **Use when:** you want durable, single-topic rules (style, testing, security, workflow) the assistant follows without you restating them each session. · **Related:** [claude-code settings](../), [current-state rule](../../../templates/docs/session-metrics/claude-rules)

`.claude/rules/` holds small, single-topic Markdown files Claude Code treats as standing
guidance on top of `CLAUDE.md`. Splitting by topic keeps each rule short and lets you copy
only the ones a project needs.

These are **generic starting points distilled from a real project** — copy the ones you
want and adapt the specifics (framework, package names, scripts) to your repo.

## What's here

| File | Covers |
| --- | --- |
| `security.md` | Prompt-injection defense: trust order, treat repo/tool output as untrusted. **Copy verbatim** — it's project-agnostic. |
| `coding-standards.md` | Code style: arrow functions, naming (no single-char), `const`, strict TS, no `any`, smallest-safe-change. |
| `frontend.md` | React/UI: functional components, WCAG 2.2 AA + ARIA, semantic HTML, shared design-system primitives, i18n. |
| `testing.md` | Co-located tests, separate mock files, Vitest + Playwright, `vitest-axe` / `@axe-core/playwright`. |
| `workflow.md` | Git/commit discipline, the post-push CI + automated-review loop, command safety, doc discipline. |

The **current-state** rule isn't duplicated here — the living-snapshot discipline lives with
the session-metrics scaffolding at
[`templates/docs/session-metrics/claude-rules/current-state.md`](../../../templates/docs/session-metrics/claude-rules/current-state.md).
Copy it to `.claude/rules/current-state.md` if you adopt that approach. (The old narrative
`project-log` rule has been retired.)

## Copy-in tweaks

- **`security.md` needs no edits** — keep it as the baseline on every project.
- **Point the rest at your stack.** `frontend.md` / `testing.md` name React / Vitest /
  Playwright / tokens; swap for your framework and runner. `workflow.md` assumes a
  `package.json`-scripts + PR-review flow — adjust the reviewer and CI hints.
- Rules cross-reference each other and `CLAUDE.md` by path (`.claude/rules/current-state.md`);
  fix those links if you rename files.
- **Trim to what the project uses** — a backend-only repo can drop `frontend.md`.
- The trust order in `security.md` puts `.claude/rules` **above** general project docs but
  **below** direct user instructions and `CLAUDE.md`; keep that ordering if you extend it.
