# `seed-local-files` — copy gitignored local files into a fresh worktree

> **Purpose:** seed a new clone/worktree with the gitignored local files (`.env`, local settings, per-repo skills, data) it needs, copied from an existing worktree. · **Lang:** bash (3.2+, macOS-safe) · **Deps:** `rsync`; `jq` only if you use a `.json` manifest
> **Copy to:** `<project>/scripts/` (the script derives the repo root as its own parent dir). · **Use when:** you run parallel branches as git worktrees and each checkout needs per-worktree secrets/config that git doesn't track. · **Related:** [worktrees (`wt`)](../worktrees), [keychain](../keychain), [secret-guard](../secret-guard)

`git clone` and `git worktree add` only materialize **tracked** files. Local-only
artifacts — real `.env` secrets, `.claude/settings.local.json`, per-repo skills,
downloaded fixtures/data — are gitignored and therefore absent from a fresh checkout.
This copies them in from an existing worktree, driven by an **explicit manifest** so it
never sweeps up arbitrary untracked branch WIP.

## Copy to

Both files go together into your project's `scripts/`:

```text
<project>/scripts/seed-local-files.sh
<project>/scripts/seed-local-files.manifest
```

The script resolves its destination as its own parent's parent (`scripts/..` = repo root),
and reads `seed-local-files.manifest` from beside itself — so keep them together.

## Use

```sh
# run from inside the DESTINATION clone/worktree; SOURCE is an existing populated one
scripts/seed-local-files.sh -n ../other-worktree    # dry run — print the plan, copy nothing
scripts/seed-local-files.sh    ../other-worktree    # copy

# one-off with a narrower explicit list (newline file or JSON array)
scripts/seed-local-files.sh -m /tmp/just-envs.json ../other-worktree
```

Flags: `-n/--dry-run`, `-m/--manifest FILE`, `-h/--help`.

## Edit the manifest

`seed-local-files.manifest` — one repo-relative path per line; `#` comments and blank
lines ignored. A path that is a **directory** in the source is `rsync`'d (merged, no
delete); a **file** is copied. Replace the shipped examples with your project's paths.

## Safety notes

- **Manifest-driven, not a scan.** It copies only the listed paths — it will not pick up
  arbitrary untracked files, so branch WIP outside the manifest is never touched.
- **A directory entry still copies everything under it.** Keep actively-edited work out of
  listed dirs, or use `--dry-run` + a narrower `-m` manifest for surgical one-offs.
- **No `--delete`.** Existing destination files under a copied dir are overwritten by the
  source but never removed.
- Guards against same-worktree, missing source, and missing manifest. Skips paths absent in
  the source.
- **Don't list deps/caches** (`node_modules`, `.venv`, `*_cache`) — regenerate those in the
  new worktree instead (`pnpm install`, `uv sync`, etc.).
