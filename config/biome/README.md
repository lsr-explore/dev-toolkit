# Biome

> **Purpose:** `biome.json` + "why Biome over Prettier".
> **Copy to:** your project root. · **Use when:** you want one tool to format + lint JS/TS/JSON. · **Related:** [conventions](../../templates/conventions)

`biome.json` lifted from the next-template setup — one tool for formatting **and**
linting JS/TS/JSON, replacing Prettier (and overlapping a lot of ESLint).

## Why Biome over Prettier

- **One tool, one pass** — format + lint in a single fast binary; no Prettier ⇄
  ESLint plugin coordination.
- **Speed** — Rust-based; near-instant on save even on large trees.
- **Fewer moving parts** — no `eslint-config-prettier`/`eslint-plugin-prettier`
  glue to keep formatting and linting from fighting.

ESLint stays for the things Biome doesn't cover (Next.js rules, deep a11y, Storybook),
hence `eslint-config-biome` in the toolchain to disable overlapping ESLint rules.

## House style (from this config)

- 2-space indent, **100-char** line width.
- **Single quotes**, `trailingCommas: "all"` in JS/TS; **no** trailing commas in JSON.
- Linter recommended on, with `noExplicitAny` and `noImgElement` as **warnings**;
  Biome's `a11y` rules off (a11y handled by `eslint-plugin-jsx-a11y` + axe instead).
- CSS linting off (Stylelint owns CSS); CSS Modules + Tailwind directives recognized.

## Use

```bash
pnpm add -D @biomejs/biome
biome check --write .     # format + autofix
biome check .             # check only (CI)
```

Pair with [`../vscode`](../vscode) so the editor formats with Biome on save. Bump the
`$schema` version to match the installed `@biomejs/biome`.
