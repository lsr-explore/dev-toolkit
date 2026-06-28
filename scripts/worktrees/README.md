# `wt` — git worktree helper

A lightweight zsh helper for git worktrees. Worktrees are placed at
`<base>/<branch>/<repo-name>`, where `<base>` defaults to the grouping directory
two levels above the repo (so it matches a `main/<repo>` layout). It can also open
the new worktree straight into an iTerm2 tab running `claude`, or a VSCode window.

## Commands

```
wt new <branch> [-c] [-e] [--base DIR] [--link-env] [--setup CMD]
                                         create or check out a worktree
wt open <branch> [-c] [-e]               open an existing worktree
wt ls                                    list worktrees
wt rm <branch> [-f] [--rm-branch]        remove a worktree (and optionally the branch)
wt help

-c / --claude   open a new iTerm2 tab in the worktree and run `claude`
-e / --code     open the worktree in a VSCode window
-f / --force    force-remove a worktree with uncommitted changes
--rm-branch     also delete the local branch after removal
--base DIR      base directory to place the worktree under (or set $WT_BASE)
--link-env      symlink the main worktree's root .env into the new worktree
--setup CMD     run CMD inside the new worktree after creating it (e.g. 'pnpm install')
```

## Install

The script is plain zsh with no dependencies beyond `git` (plus `osascript` for the
iTerm2 integration and the `code` CLI for the VSCode integration — both optional).

```bash
# 1. Put it on your PATH. ~/.local/bin is a common choice.
mkdir -p ~/.local/bin
cp wt ~/.local/bin/wt
chmod +x ~/.local/bin/wt

# 2. Make sure ~/.local/bin is on your PATH (add to ~/.zshrc if needed):
#    export PATH="$HOME/.local/bin:$PATH"

# 3. Verify:
wt help
```

To open worktrees in VSCode (`-e`), install the `code` CLI: in VSCode run
**Shell Command: Install 'code' command in PATH** from the command palette.

## Notes

- `--base` / `$WT_BASE` override where worktrees land if your layout differs.
- `wt rm` prunes the now-empty `<branch>/` parent directories left behind by the
  nesting scheme (capped, and `rmdir`-only so it can never touch a non-empty dir).
- `--link-env` *symlinks* the main worktree's root `.env` rather than copying it,
  so secrets/config live in one place and aren't duplicated to disk across worktrees
  (in the spirit of keeping secrets out of extra files — pair it with a keychain
  workflow for the values themselves). It skips silently when there's no `.env` and
  never overwrites an existing one in the new worktree.
- `--setup CMD` runs `CMD` inside the new worktree after creation — handy for
  `--setup 'pnpm install'` or any per-worktree bootstrap. Both flags are opt-in;
  plain `wt new <branch>` behaves exactly as before.
