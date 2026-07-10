# Test conventions

- **Co-located test files** — place `*.test.ts` / `*.test.tsx` next to the source file.
- **Mock data in separate files** — keep mock/fixture data shareable, not inline in tests.
- **Vitest** for unit and component tests; **Playwright** for e2e (kept in a dedicated
  `e2e/` directory).
- **Accessibility assertions** — use `vitest-axe` or `@axe-core/playwright` for a11y
  coverage on interactive components.
