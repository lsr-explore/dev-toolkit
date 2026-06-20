/**
 * Reference ESLint flat config — Next.js + Biome + jsx-a11y + Storybook.
 *
 * ⚠️ Stack-specific (depends on eslint-config-next). On another stack, keep the
 * PRINCIPLE from conventions.md §1 — "a11y enforced by exactly one tool" — and adapt:
 *   - one a11y source (jsx-a11y here),
 *   - eslint-config-biome LAST to disable rules Biome owns,
 *   - Biome's a11y group OFF in biome.json.
 * Then run the <img>-no-alt test to PROVE a11y actually fires.
 */
import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import storybook from 'eslint-plugin-storybook';
import biome from 'eslint-config-biome';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  // a11y OWNER: jsx-a11y recommended rules (plugin is registered by eslint-config-next).
  // This is the single source of a11y enforcement; Biome's a11y group is off (biome.json).
  {
    rules: {
      ...jsxA11y.flatConfigs.recommended.rules,
    },
  },

  // House rules (optional — personal taste, safe to drop).
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      'id-length': [
        'error',
        { min: 2, exceptions: ['_'], exceptionPatterns: ['^_'], properties: 'never' },
      ],
      'func-style': ['error', 'expression', { allowArrowFunctions: true }],
    },
  },

  { settings: { react: { version: 'detect' } } },

  // Storybook rules.
  ...storybook.configs['flat/recommended'],

  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'storybook-static/**',
    'coverage/**',
  ]),

  // MUST be last: disables ESLint rules that Biome already handles. Placing it last
  // means it can't accidentally turn OFF the jsx-a11y rules added above — verify after
  // any reorder with the <img>-no-alt test (conventions.md §1).
  biome,
]);

export default eslintConfig;
