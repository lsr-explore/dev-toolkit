# Tooling conventions

My opinionated defaults for a JS/TS project — the tool choices, the scripts, and the
conventions that **break silently and need re-checking per repo**. Captured so they
survive moving between projects (or companies), with or without an AI assistant.

## Three layers, three ways in

| File | Use it when… |
| --- | --- |
| [`CHECKLIST.md`](./CHECKLIST.md) | you want to **set up or audit a repo fast** — joining a project, no AI, time-pressured. Scan it, tick it off. |
| [`conventions.md`](./conventions.md) | you (or an AI assistant) need the **intent + rationale** to apply a convention to a **different stack** (Vite, Remix, plain TS) or justify it in review. |
| [`artifacts/`](./artifacts) | you want to **copy a working config**. Reference implementations on a Next.js + Biome stack — adapt per stack. |

The split is deliberate: the **principle** is portable, the **artifact** is not. A
raw `eslint.config.mjs` only drops cleanly into a Next.js repo; the *rule behind it*
("enforce a11y with exactly one tool") applies anywhere.

## How to use it

**Greenfield repo (with an AI assistant):** point the assistant at `conventions.md`
and say "apply these to this stack." It reads intent, not a Next-locked file, so it
can generate the right config for whatever's here.

**Supplementing an existing / non-Next repo:** work down `CHECKLIST.md`; for anything
that needs adapting, read that item's entry in `conventions.md` for the principle and
the verify step. Don't paste the Next.js artifact blindly.

**No AI, in a hurry:** `CHECKLIST.md` top to bottom. Copy from `artifacts/` where the
stack matches; apply the principle by hand where it doesn't.

## What's covered

a11y enforced by exactly one tool · Biome over Prettier (Stylelint owns CSS) · always
wire coverage · Playwright UI + report scripts · a single `check:all` gate · labeled
`package.json` script sections. See [`conventions.md`](./conventions.md) for each.

> For the *full tool inventory* (what next-template pulls in, versions), see
> [`../../docs/toolchain.md`](../../docs/toolchain.md) — that's the reference list;
> this is the prescriptive "how I set it up and verify it."
