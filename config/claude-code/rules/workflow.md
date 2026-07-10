# Workflow preferences

## Git and commits

- Do not commit changes unless explicitly asked.
- Do not push to a remote unless explicitly asked.
- Use conventional commit style: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`, `ci:`.
- If the repo has a pre-commit hook (format / lint / typecheck), don't bypass it with
  `--no-verify` unless explicitly asked.

### After push + PR: run the review loop, then hand off for merge

Once a branch is pushed and the PR is open, **stay on it through review** rather than
ending the turn immediately:

1. **Wait for CI and any automated reviewer to land.** Watch efficiently — a backgrounded
   `gh pr checks <N> --watch` or a spaced poll, **not** a tight foreground loop.
   Distinguish a genuine failure from hosted-runner infra flakes (a whole-run failure with
   no job output is usually infra, not your diff) — re-trigger an infra flake once
   (`gh run rerun` or an empty commit); if it recurs, **stop and tell the user** rather
   than retrying indefinitely.
2. **Address automated-review comments with judgment — don't auto-apply.** For each
   finding: **fix it** in a follow-up commit if it's a genuine, in-scope defect with a
   clear correct fix; **record it** in the backlog/tech-debt doc if it's a design call
   that's the owner's, pre-existing/out-of-scope, low-value gold-plating, or a fix whose
   *direction* isn't obvious (a mechanical "make them match" can point the wrong way on
   safety-critical paths). **Reply on the thread** documenting what you did and why, so the
   decision is visible to a reviewer. (An automated reviewer here means a bot like
   CodeRabbit — see [`config/coderabbit`](../../coderabbit).)
3. **Fix real CI failures** (test / lint / type) on the branch and re-push.
4. **Update the docs the change touches** — backlog entries for deferrals, and the session
   log per [`.claude/rules/project-log.md`](../../../templates/docs/claude-rules/project-log.md).
5. **Then hand off for merge.** End the turn with CI status, what the reviewer raised + how
   each was dispositioned, and "ready to merge." **Do not merge** unless the user asks — the
   owner merges. Resume for the post-merge log wrap-up when they say it's merged.

## Commands

- Proceed without asking when running normal project scripts such as test, lint, build,
  and similar safe verification commands.
- Ask before running install / add or other dependency-changing commands.
- Ask before running destructive, network-heavy, or environment-altering commands.
- **Don't `cd` into the repo** — the shell's working directory persists across commands
  and starts at the repo root.
- **Prefer the repo's `package.json` scripts** over ad-hoc tool invocations, and pass
  extra args *through* the script rather than invoking arbitrary binaries directly (which
  stays off the allowlist).
- Interactive/blocking runners (e.g. a Playwright UI mode) should run in their own
  terminal, not via the agent.

## Change strategy

- Read relevant files before editing.
- Prefer the smallest safe change that satisfies the request.
- Avoid broad refactors unless explicitly requested.
- Run appropriate quality checks after making changes.

## Documentation discipline

- When an architectural decision is made, capture it as a new ADR in
  `docs/decision-records/` (numbered, e.g. `0003-….md`).
- Record session outcomes in `docs/project_log.md` rather than spreading notes across
  files. Follow its structure (living current-state + append-only history): see
  [`.claude/rules/project-log.md`](../../../templates/docs/claude-rules/project-log.md).
