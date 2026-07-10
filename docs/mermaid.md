# Mermaid diagrams

> **Status:** working notes / placeholder — flesh out over time.

[Mermaid](https://mermaid.js.org/) is the diagramming tool of choice here — text-based
diagrams that live in Markdown and render in GitHub, VS Code, and most docs sites.

## Notes

<!-- Placeholder: add your own patterns, reusable snippets, and gotchas here. -->

- _TODO — add notes._

## Open problem — dark/light theming

Diagrams don't always render correctly in **dark mode**, and I haven't settled on a
color scheme that reads well under a dark/light toggle. Typical symptom: node colors
that look fine on a light background wash out or lose contrast on dark.

Leads to chase (fill in as tested):

- Prefer Mermaid's **theme variables** over hardcoded hex — set `theme: 'base'` and drive
  colors through a `%%{init: {'theme':'base','themeVariables':{…}}}%%` directive, so one
  palette adapts instead of per-node inline colors.
- Or pick a **neutral palette that clears WCAG contrast on both** backgrounds (the
  "works in light and dark" dataviz approach) rather than switching themes at all.
- Check what the render surface does: **GitHub** auto-swaps Mermaid's theme with the page
  theme; a custom docs site sets it explicitly (e.g. Bryan Finster's mkdocs
  `docs/js/mermaid-init.js`).

## References

- [Mermaid docs](https://mermaid.js.org/) — syntax + theming (`themeVariables`, `%%{init}%%` directives).
- [bdfinst/ai-patterns · `MERMAID_DEBUG.md`](https://github.com/bdfinst/ai-patterns/blob/master/MERMAID_DEBUG.md)
  — Bryan Finster's Mermaid debugging guide. Note it targets _rendering / loading_ failures
  (CDN, CSP, script order), **not** dark-mode color contrast — adjacent to the theming
  problem above, not the fix for it.

<!-- Once the palette is settled, this may graduate into a reusable config snippet
     (a Mermaid dark/light theme) under config/. -->
