# VSCode

Drop these into a project's `.vscode/` folder (merge with anything already there).

- **`settings.json`** — Biome as the default formatter + format-on-save, plus a Vim
  (`vscodevim.vim`) setup.
- **`extensions.json`** — workspace extension recommendations (Vim, Biome, ESLint,
  Playwright).

## Biome over Prettier

`editor.defaultFormatter` is set to `biomejs.biome` globally and pinned per-language
so a stray Prettier install can't take over. `codeActionsOnSave` runs Biome's and
ESLint's safe fixes on save. There is **no Prettier extension in the
recommendations** on purpose. See [`../biome`](../biome) for the matching
`biome.json`.

## Vim

Uses the `vscodevim.vim` extension. Highlights of the config:

- `jk` in insert mode → `<Esc>`.
- Leader is `<space>`; `<space>w` saves, `<space>e` toggles the explorer.
- `useSystemClipboard` so yank/paste shares the OS clipboard.
- A few `Ctrl` chords (`C-c`, `C-v`, `C-a`, `C-f`) are handed back to VSCode so the
  native shortcuts keep working.

Tune the keybindings to taste — they're examples, not gospel.
