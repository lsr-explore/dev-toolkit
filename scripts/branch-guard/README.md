# branch-guard

> **Purpose:** Local git hooks that refuse to commit or push directly to `main`. · **Lang:** POSIX sh · **Deps:** git (Husky optional)
> **Copy to:** `.husky/` (Husky) or `.githooks/` + `core.hooksPath`. · **Use when:** you (or an AI session using your credentials) can bypass branch protection on the remote, so the only guard that actually fires is local. · **Related:** [secret-guard](../secret-guard)

Two hooks — a **pre-commit** and a **pre-push** — that abort when you're on
`main` (commit) or pushing to `refs/heads/main` (push). Pure POSIX `sh` + `git`,
**zero runtime dependency**; Husky is just a convenient installer.

## Why local, and why this is the real protection

GitHub branch-protection rules / rulesets run **server-side**, but a ruleset that
lets the **repo owner bypass** it can't stop a push made with the owner's
credentials — which is exactly the case when an AI coding session (Claude Code,
etc.) pushes on your behalf. The server waves it through because it's "you."

The **local** pre-push hook is the last checkpoint that sees the push *before it
leaves the machine*, so it's the layer that can actually catch an accidental
`git push` while `main` is checked out, or a stray `git push origin HEAD:main`.
That's the protection this snippet provides.

## What each hook does

- **`pre-commit`** — reads the current branch (`git rev-parse --abbrev-ref HEAD`)
  and exits non-zero if it's `main`. Stops a commit from landing on `main` in the
  first place.
- **`pre-push`** — reads git's stdin (`<local ref> <local sha> <remote ref>
  <remote sha>` per line) and exits non-zero if any `remote_ref` is
  `refs/heads/main`. Catches `git push` (branch tracking main), `git push origin
  main`, and `git push origin HEAD:main` alike.

Both print a `✋` message and the intentional-override command, then exit `1`.

## Install

### (a) Husky (Node repos — how these were originally added)

```bash
npm install --save-dev husky
npx husky init            # creates .husky/ and wires the prepare script
cp scripts/branch-guard/pre-commit scripts/branch-guard/pre-push .husky/
chmod +x .husky/pre-commit .husky/pre-push
```

Husky v9+ runs these bare hook files as-is (no `husky.sh` sourcing line needed).
The `prepare` script `husky init` adds means the hooks activate on `npm install`
for every clone — this is the team-shareable path.

### (b) Plain `core.hooksPath` (no Node / no Husky)

```bash
mkdir -p .githooks
cp scripts/branch-guard/pre-commit scripts/branch-guard/pre-push .githooks/
chmod +x .githooks/pre-commit .githooks/pre-push
git config core.hooksPath .githooks      # per-clone; each dev runs this once
```

Commit `.githooks/`. `core.hooksPath` is local git config, so wire the one-line
`git config` into your bootstrap/`make setup`.

### Already have a pre-commit hook? (e.g. secret-guard)

A repo has one file per hook, so **chain** them. With Husky, add the guard line
to the existing `.husky/pre-commit`; with plain hooks, call one from the other:

```sh
# in your existing pre-commit, before your own logic:
"$(dirname "$0")/branch-guard-pre-commit" || exit 1
```

This pairs naturally with [`secret-guard`](../secret-guard) (also a pre-commit):
one keeps secrets out of a commit, the other keeps commits off `main`.

## Bypassing intentionally

```bash
git commit --no-verify       # or: git commit -n
git push   --no-verify
```

> **Pair with a deny rule to make it a hard lock for an AI session.** On its own
> this hook is a speed-bump: `--no-verify` walks right past it. To close that for
> an assistant working with your credentials, **deny** the bypass commands in your
> Claude Code settings so the assistant can't reach for them:
>
> ```jsonc
> // .claude/settings.json → permissions.deny
> "Bash(git commit --no-verify:*)",
> "Bash(git commit -n:*)",
> "Bash(git push --no-verify:*)"
> ```
>
> Now the hook stops the *accidental* push (plain `git push` on main) and the deny
> rule stops the *deliberate* override — while you, working in your own terminal
> outside Claude Code's permission layer, keep `--no-verify` for the legitimate
> owner bypass. Note the deny patterns are prefix matches: a flag in a different
> position (`git push origin main --no-verify`) won't match, so keep the branch as
> the guard's job and treat the deny list as belt-to-its-suspenders, not the sole
> lock.

## Tweaks on copy-in

- **Different default branch.** Change `main` to `master`/`develop` in both files
  (the `[ "$branch" = "main" ]` test and the `refs/heads/main` case).
- **Guard several branches.** Widen the `case` in `pre-push`, e.g.
  `refs/heads/main|refs/heads/release/*)`.
- **Message/tone.** The `echo` lines are yours to reword; keep them on stderr
  (`>&2`) so they show even when git is quiet.
