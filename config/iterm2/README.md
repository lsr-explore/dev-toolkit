# iTerm2

Notes for reproducing the terminal setup. iTerm2's settings live in a binary plist,
so rather than committing that, the reliable approach is **point iTerm2 at a synced
folder** and let it export/import there.

## Sync preferences to a folder

**Settings → General → Settings**:

1. Check **Load settings from a custom folder or URL**.
2. Point it at a folder you control (e.g. `~/dev/lsr-dev-tools/config/iterm2/prefs`
   or a Dropbox/iCloud path).
3. Set **Save changes** to *Automatically*.

iTerm2 writes `com.googlecode.iterm2.plist` there and reloads it on launch, so the
config follows you to a new machine.

> This folder intentionally doesn't commit the plist — it's machine/UI state. Keep
> the exported plist in personal sync storage, not in this snippet repo.

## Things worth setting

- **Profiles** — a default profile with your font (e.g. a Nerd Font for glyphs),
  colors, and a generous scrollback.
- **Natural text editing** — Profiles → Keys → Key Mappings → **Presets… → Natural
  Text Editing** (word-wise option-arrow, etc.).
- **Shell integration** — `iterm2_shell_integration` for marks, command status, and
  the `imgcat`/`it2*` utilities. Install from the iTerm2 menu or:
  ```bash
  curl -L https://iterm2.com/shell_integration/zsh -o ~/.iterm2_shell_integration.zsh
  echo 'source ~/.iterm2_shell_integration.zsh' >> ~/.zshrc
  ```
- **`wt` integration** — the [`wt`](../../scripts/worktrees) helper opens new
  worktrees in fresh iTerm2 tabs (`wt new <branch> -c`), which relies on iTerm2
  being the default terminal and `osascript` automation being allowed.
