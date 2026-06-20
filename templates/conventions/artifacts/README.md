# Reference artifacts

Working configs from a **Next.js + Biome** stack. They encode the conventions in
[`../conventions.md`](../conventions.md) — but they are **reference implementations,
not drop-ins for every repo**. Copy when the stack matches; otherwise read the
matching convention for the principle and adapt.

| File | Encodes | Stack coupling |
| --- | --- | --- |
| `eslint.config.mjs` | §1 a11y-by-one-tool · house rules | **High** — needs `eslint-config-next`. Keep the ordering principle on other stacks. |
| `package-scripts.jsonc` | §3 coverage · §4 e2e scripts · §5 sections + `check:all` | **Low** — the structure ports; swap the tool commands. |
| `vitest.coverage.ts` | §3 coverage wired day one | **Medium** — Vitest-specific; the include/exclude shape ports to other runners. |

The matching `biome.json` lives in [`../../../config/biome`](../../../config/biome)
(with the "why Biome over Prettier" note and the a11y group turned off).

> `package-scripts.jsonc` is JSONC for the inline comments. A real `package.json` is
> plain JSON — keep the `"--- section ---": "noop"` divider keys, drop the `//` lines.
