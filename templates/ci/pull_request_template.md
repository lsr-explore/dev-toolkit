<!-- Copy to .github/pull_request_template.md in your repo. GitHub auto-fills new
     PR descriptions with this. Keep it short — delete sections that don't apply. -->

<!-- Tip: for any change that isn't self-explanatory, leave an inline comment on
     the specific line(s) in the diff to give reviewers context — preface each with
     "Note to reviewer:" so it reads as author context, not part of the code. -->

<!-- Tip: before requesting human review, consider an AI review pass over the diff
     (your editor's assistant, GitHub Copilot, or `claude` /code-review). It's cheap
     and catches obvious bugs, edge cases, and leftover debug — and is especially
     worth it for AI-assisted changes, which still need a real review. It augments
     human review; it doesn't replace it. -->

## What & why

<!-- What does this change, and why? -->

## Related issue

<!-- Paste the FULL issue URL (e.g. https://github.com/OWNER/REPO/issues/42), not
     just #42 — GitHub unfurls a full URL to show the issue's title inline. Use a
     closing keyword (Closes / Fixes / Resolves) to auto-close it when this merges. -->
- Resolves https://github.com/OWNER/REPO/issues/

## Changes

-

## Screenshots / video

<!-- If this changes the UI or any user-visible behavior, add a before/after
     screenshot or a short screen recording. Delete this section if not applicable. -->

## How to test

<!-- Steps for a reviewer to verify locally. -->

## Checklist

- Diff is clean — no leftover `console.log`/debug or commented-out code, and nothing
  committed that shouldn't be (or missing that should). A fresh clone of the branch
  surfaces both.
- Performance — no obvious regressions on hot paths: bundle size, needless re-renders,
  N+1 queries (if applicable)
- Security — no secrets committed, inputs validated/escaped, authorization intact
  (if applicable)
- Updated docs / comments where behavior changed
- Accessibility — keyboard, focus order, semantics, contrast (if UI changed)
