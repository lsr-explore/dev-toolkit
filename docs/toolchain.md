# Toolchain inventory

The tools used in the **next-template** repo
(`~/dev/next-template/main/next-template`), captured here as a reference checklist
when standing up a new project. This is a snapshot — the template repo is the source
of truth; bump versions there.

## Stack

| Area | Tool |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack) + React 19 |
| Language | TypeScript |
| Package manager | pnpm |

## Code quality

| Concern | Tool | Notes |
| --- | --- | --- |
| Format + lint (JS/TS/JSON) | **Biome** | replaces Prettier; see [`../config/biome`](../config/biome) |
| Lint (framework/a11y/Storybook) | ESLint | `eslint-config-next`, `eslint-plugin-jsx-a11y`, `eslint-plugin-storybook`, `eslint-config-biome` (disables overlap) |
| CSS lint | Stylelint | `stylelint-config-standard` |
| Markdown lint | markdownlint-cli2 | |
| Type check | `tsc --noEmit` | |
| i18n check | `@lingual/i18n-check` | against `messages/`, source `en`, next-intl format |

## Testing

| Type | Tool |
| --- | --- |
| Unit / component | Vitest (`@vitest/coverage-v8`, browser-playwright, jsdom) |
| Component testing libs | Testing Library (dom/react/jest-dom), `vitest-axe` |
| E2E | Playwright (`@axe-core/playwright` for a11y) |
| Component dev/docs | Storybook 10 (`addon-a11y`, `addon-docs`, `addon-vitest`, nextjs-vite) |

## Static analysis & budgets

| Concern | Tool |
| --- | --- |
| Circular deps | madge (`--circular`) |
| Dependency rules / graph | dependency-cruiser |
| Bundle size budget | size-limit (`@size-limit/file`) — JS 300 kB / CSS 30 kB gzip |
| Bundle analysis | `@next/bundle-analyzer` (`ANALYZE=true next build`) |

## Git hooks & commits

| Concern | Tool |
| --- | --- |
| Hooks | Husky |
| Commit lint | commitlint (`config-conventional`) |

## App libraries (notable)

- **UI**: `@base-ui/react`, `shadcn`, `lucide-react`, `class-variance-authority`,
  `clsx`, `tailwind-merge`, `tw-animate-css`, Tailwind v4
- **State**: `zustand`
- **i18n**: `next-intl`
- **Validation / env**: `zod`, `@t3-oss/env-nextjs`
- **Observability**: `pino` (+ `pino-pretty`), `@vercel/otel`, `@opentelemetry/api`

## Handy scripts (from `package.json`)

```bash
pnpm dev            # next dev --turbopack
pnpm check:all      # format:check + lint + lint:css + lint:md + i18n:check + typecheck + test
pnpm lint:all       # biome + eslint + stylelint + markdownlint
pnpm test           # vitest run
pnpm e2e            # playwright test
pnpm storybook      # storybook dev -p 6006
pnpm circular       # madge --circular
pnpm depcruise      # dependency-cruiser
pnpm size           # size-limit
```
