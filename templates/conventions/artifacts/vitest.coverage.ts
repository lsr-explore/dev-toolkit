/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';

/**
 * Reference coverage config (conventions.md §3 — "coverage wired from day one").
 *
 * The point is the `coverage` block, not the rest of the Vitest setup — lift it into
 * your existing vitest.config.ts. Requires the provider: `pnpm add -D @vitest/coverage-v8`.
 * Verify with `pnpm test:coverage` (writes ./coverage).
 */
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'], // text = terminal, html = browseable, lcov = CI tools
      reportsDirectory: './coverage',
      include: ['src/**/*.{ts,tsx}', 'libs/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.{test,spec}.{ts,tsx}',
        'src/**/test-setup.ts',
        'src/app/layout.tsx', // framework boilerplate, not meaningful to cover
        'libs/**/index.ts', // barrel re-exports
      ],
    },
  },
});
