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

## Agent skills

- [Intopia web accessibility skill](https://github.com/Intopia/intopia-web-accessibility-skill/)
  — agent skill giving AI coding tools WCAG-aligned accessibility guidance, code
  examples, and review tooling for building and auditing web interfaces.
- [Vercel agent skills](https://github.com/vercel-labs/agent-skills) — a collection
  of skills for AI coding agents (packaged instructions + scripts in the Agent Skills
  format) that extend agent capabilities.

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
