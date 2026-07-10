# Frontend rules

Apply when editing frontend / UI source.

- Use strict TypeScript.
- Prefer functional React components.
- Avoid `any` unless necessary and documented.
- Follow accessibility best practices that comply with WCAG 2.2 AA and ARIA guidelines.
- Prefer semantic HTML.
- Avoid deeply nested components.
- Use the project's styling system consistently; keep design tokens in one place (a
  shared theme/tokens package), not redefined per component.
- Import shared UI primitives from the project's design-system package — don't
  duplicate them per app/feature.
- Route all user-facing copy through the i18n layer; don't hard-code strings.
  Translations live in the project's message catalog, not inline.
