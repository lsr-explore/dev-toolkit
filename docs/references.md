# References

External resources worth keeping within reach — agent skills, package hygiene, and
language reference. Not snippets to copy; pointers to follow.

## Claude Code best practices

Background reading for [`ai-collaboration.md`](./ai-collaboration.md). These are
principles/philosophy and happy-path guidance — none is a friction catalog, which is
the niche that doc fills.

- [Claude Code best practices](https://code.claude.com/docs/en/best-practices)
  (Anthropic, official) — principle-based, organized around context-window
  management; covers `CLAUDE.md`, `/init`, permission allowlisting, and worktree
  parallelism. States the happy path rather than the edge cases.
- [How Anthropic teams use Claude Code](https://www-cdn.anthropic.com/58284b19e702b49db9302d5b6f135ad8871e7658.pdf)
  (Anthropic, PDF) — the most tips-flavored official artifact: team-by-team practices
  like detailed `CLAUDE.md` files and preferring MCP servers over CLIs for sensitive
  data. Coarser-grained than a per-gotcha log.
- [awattar/claude-code-best-practices](https://github.com/awattar/claude-code-best-practices)
  — community aggregator of patterns with links out to practitioner write-ups
  (worktree parallelism, memory management, hooks, subagents).
- [rosmur claudecode-best-practices](https://rosmur.github.io/claudecode-best-practices/)
  — a synthesized guide distilling ~12 sources; leans on planning-before-implementation
  and the observation that simple control loops tend to beat multi-agent setups.

## Agentic delivery (Bryan Finster)

Bryan Finster is a well-known continuous-delivery engineer (Minimum Viable CD /
[minimumcd.org](https://minimumcd.org/)); these are his current, actively-maintained
AI-agent delivery materials — strong on holding agent-generated code to the same
quality bar as human-written code.

- [bdfinst/agentic-dev-team](https://github.com/bdfinst/agentic-dev-team)
  ([docs](https://devteam.bryanfinster.com/)) — three Claude Code plugins: a
  persona-driven `dev-team` (Orchestrator + specialist agents + a TDD-gated
  `/specs → /plan → /build → /pr` workflow with a reviewer swarm), plus
  `security-assessment` and `marketplace-dev`. A mature, real-world example of a
  rules / skills / agents system.
- [bdfinst/ai-patterns](https://bdfinst.github.io/ai-patterns/) — a living playbook of
  patterns for delivering software with AI agents: agentic code review, Agentic
  Continuous Delivery (ACD), a defect-detection cheat sheet, contract-testing
  strategies, and a curated index of other skill libraries.

## Rules & skills collections

Curated indexes of `.claude/rules`, `CLAUDE.md`, skills, and subagents worth mining for
patterns — the community layer above the [`config/claude-code/rules`](../config/claude-code/rules)
snippets here.

- [hesreallyhim/awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code)
  — the de-facto meta-index: hand-picked skills, subagents, hooks, `CLAUDE.md` guides,
  status lines, and tooling. Actively maintained; the best single entry point.
- [josix/awesome-claude-md](https://github.com/josix/awesome-claude-md) — curated
  *exemplary* `CLAUDE.md` files mined from real repos, with analyses and templates.
  Narrowly on-target when you're refining a `CLAUDE.md`.

## Agent skills

- [anthropics/skills](https://github.com/anthropics/skills) — the **official** Agent
  Skills repo: production document skills, a `skill-creator`, and the canonical
  `SKILL.md` specification (`spec/agent-skills-spec.md`). The authoritative source for
  the format.
- [Intopia web accessibility skill](https://github.com/Intopia/intopia-web-accessibility-skill/)
  — agent skill giving AI coding tools WCAG-aligned accessibility guidance, code
  examples, and review tooling for building and auditing web interfaces.
- [Vercel agent skills](https://github.com/vercel-labs/agent-skills) — a collection
  of skills for AI coding agents (packaged instructions + scripts in the Agent Skills
  format) that extend agent capabilities.
- [Community-Access/accessibility-agents](https://github.com/Community-Access/accessibility-agents)
  — specialist agents that enforce WCAG 2.2 AA in Claude Code (ARIA patterns, focus
  management, contrast, live regions, forms); honest that automated checks still need
  real assistive-tech verification.
- [fecarrico/A11Y.md](https://github.com/fecarrico/A11Y.md) — an a11y **rules file**:
  an 8-rule WCAG 2.2 AA behavioral contract to inject into `CLAUDE.md`, with tiered
  A/AA/AAA profiles and an on-demand APG reference. The rules-file complement to the
  Intopia / Community-Access *skills*.

## Package hygiene

- [replacements.fyi](https://replacements.fyi) — search an npm package name to find
  better/safer modern alternatives to deprecated or abandoned dependencies.

## TypeScript

- [TypeScript tips everyone should know](https://github.com/AllThingsSmitty/typescript-tips-everyone-should-know)
  — curated practical TypeScript patterns (e.g. prefer `unknown` over `any`,
  discriminated unions, template literal types, the `satisfies` operator) for safer,
  more readable code.
  - **TODO:** create a Claude Code agent skill around these tips — package them as a
    reviewable skill that surfaces the relevant pattern during TS work.
