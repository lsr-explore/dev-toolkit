# secret-guard

> **Purpose:** Pre-commit hook blocking `.env` + common secret patterns. · **Lang:** POSIX sh · **Deps:** git + grep
> **Copy to:** `.git/hooks` or `core.hooksPath`. · **Use when:** you want to stop secrets leaking into a commit; pre-commit only, not a history scanner. · **Related:** [keychain](../keychain)

A git **pre-commit hook** that blocks secrets from entering the repo. Pure POSIX
`sh` + `git` + `grep` + `awk` — **zero runtime dependency** to install, works on
macOS (BSD tools) and Linux (GNU tools).

This is the companion to [`scripts/keychain`](../keychain). Keychain keeps secrets
**out** of the repo at the source (read them from the macOS Keychain instead of a
`.env` file); secret-guard is the backstop that stops them leaking **in** when
something gets staged anyway. Belt and suspenders — use both.

## What it checks

Against the **staged** changes only (`git diff --cached`):

1. **Blocked filenames** — rejects `.env` and variants (`.env.local`,
   `.env.production.local`, `.env.<anything>`). Documentation stubs
   `.env.example` / `.env.sample` / `.env.template` are allowed through.
2. **Secret patterns in the diff** — scans added lines for:
   - private key headers — `-----BEGIN [A-Z ]*PRIVATE KEY-----`
   - AWS access key ids — `AKIA[0-9A-Z]{16}`
   - Anthropic keys — `sk-ant-…`
   - OpenAI-style keys — `sk-…` (20+ chars)
   - GitHub tokens — `ghp_…`, `gho_/ghu_/ghs_/ghr_…`, `github_pat_…`
   - Slack tokens — `xox[baprs]-…`
   - generic assignments — `*_API_KEY=` / `*_SECRET=` / `*_TOKEN=` with a
     real-looking value (12+ non-space chars; empty template values are ignored)

On a hit it prints each offending `file:line` and the rule that tripped, then
exits non-zero to abort the commit. A clean commit exits `0` silently.

## Install

### (a) Single repo — drop it in `.git/hooks`

```bash
cp scripts/secret-guard/pre-commit .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

`.git/hooks` is **not** tracked by git, so this protects only your local clone.
Use (b) if you want the team to share it.

### (b) Shared via `core.hooksPath` (committed, team-wide)

Keep the hook in a tracked directory and point git at it:

```bash
mkdir -p .githooks
cp scripts/secret-guard/pre-commit .githooks/pre-commit
chmod +x .githooks/pre-commit
git config core.hooksPath .githooks      # per-clone; each dev runs this once
```

Commit `.githooks/pre-commit`. Note `core.hooksPath` is a local git config, so
each contributor still runs the one-line `git config` after cloning (wire it into
your bootstrap/`make setup` script).

### Already have a pre-commit hook?

A repo can only have one `pre-commit` file, so **chain** it. Rename this one and
call it from your existing hook:

```bash
cp scripts/secret-guard/pre-commit .git/hooks/secret-guard
chmod +x .git/hooks/secret-guard
```

```sh
# in your existing .git/hooks/pre-commit, before your own logic:
.git/hooks/secret-guard || exit 1
```

If you use a hook manager (Husky, pre-commit, Lefthook), add it as one more hook
entry pointing at the script instead.

## Bypassing intentionally

- **One-off** — skip all pre-commit hooks for a single commit:

  ```bash
  git commit --no-verify
  ```

- **A specific `.env` you really do want tracked** — add its exact path to
  `ALLOW_ENV` near the top of the hook (space-separated), e.g.
  `ALLOW_ENV="config/.env.defaults"`.

## Tuning false positives

The patterns deliberately err toward catching. If a legitimate line trips a rule:

- The generic `*_API_KEY` / `*_SECRET` / `*_TOKEN` rules are the usual culprits —
  a long non-secret value (a URL, a UUID-ish constant) can look real. Tighten or
  remove the offending rule in the `rules` list, or raise the `{12,}` length
  threshold in `val`.
- To stop scanning a file type (e.g. lockfiles, fixtures), filter `staged_files`
  / the diff by path before the checks.
- The matcher reads `@@` hunk headers to report line numbers; with very unusual
  diffs the line number may be approximate, but the file and rule are always
  correct.

## Tweaks on copy-in

- **Add your own providers.** Append `label<TAB>extended-regex` lines to the
  `rules` heredoc — e.g. Stripe `sk_live_[0-9A-Za-z]{24,}`, Google
  `AIza[0-9A-Za-z_-]{35}`, Twilio `SK[0-9a-fA-F]{32}`.
- **Allowlist doc filenames.** The `.env.example/.sample/.template` allowance is a
  `case` near the filename check — add your conventions there.
- Tools required are all stock on macOS and Linux; nothing to `npm`/`pip` install.
