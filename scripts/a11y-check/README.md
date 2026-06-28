# a11y smoke check

> **Purpose:** One-command axe-core accessibility smoke check of a URL. · **Lang:** sh · **Deps:** `npx @axe-core/cli` + Chrome/driver
> **Copy to:** your project. · **Use when:** a quick a11y pass on a small site with no test setup; not a replacement for a real suite — graduate to Playwright/vitest-axe. · **Related:** [playwright](../playwright)

A one-command accessibility smoke check for a **single URL**, with no test
harness to wire up. It shells out to the [axe-core][axe] engine via the
`@axe-core/cli` tool and fails (non-zero exit) when there are violations, so you
can drop it into a pre-push hook or a CI step.

> **Dependency (fetched on demand — nothing to install up front):**
> [`@axe-core/cli`][cli], run via `npx`. The first run downloads it.
>
> **Runtime requirement:** Node (for `npx`) **and** a local **headless Chrome +
> chromedriver**, which `@axe-core/cli` launches and drives. On macOS the usual
> path is an existing Google Chrome plus a matching chromedriver — `npx
> @axe-core/cli` will pull one, or `brew install chromedriver` if you want it
> pinned. macOS-first; this has not been smoothed over for Linux CI images
> (you'd install Chrome + chromedriver there yourself).

## When to use this — and when not to

This is the **lightweight** option, on purpose. Reach for it when:

- You have a small site, a static page, or a quick prototype with **no existing
  accessibility test setup**, and you just want a fast pass/fail against a
  running URL.
- You want a cheap **pre-push / CI gate** without adding test dependencies to the
  project.
- You're spot-checking a deployed or local page and don't want to write a spec.

**Do not** use it as a replacement for a real suite. The owner's `next-template`
already has the full setup — **vitest-axe** for component-level assertions and
**Playwright + `@axe-core/playwright`** for end-to-end, per-route scans wired
into the test run. That setup gives you per-component coverage, fixtures,
authenticated routes, and assertions living next to the code. When a project has
that, use it. This snippet is the quick smoke check for everything that *doesn't*.

A useful rule of thumb: if you find yourself wanting to scan more than a couple of
URLs, handle auth, or assert on specific rules per component — graduate to the
Playwright/vitest-axe setup instead of growing this script.

## Usage

```bash
# Default target is http://localhost:3000
./a11y-check.sh

# Or pass a URL
./a11y-check.sh http://localhost:5173
./a11y-check.sh https://google.com

# Help
./a11y-check.sh -h
```

Exit code is **0** when clean, **non-zero** when axe finds violations (so it
gates), and the script prints axe's findings plus a one-line summary.

### Troubleshooting: ChromeDriver / Chrome version mismatch

If axe aborts with `session not created: This version of ChromeDriver only
supports Chrome version N` (your Chrome auto-updated past the bundled driver),
sync them or point axe at a matching driver:

```bash
npx browser-driver-manager install chrome     # install matching Chrome + driver
# …or pass an explicit driver you control:
npx @axe-core/cli <url> --chromedriver-path /path/to/chromedriver
```

The script exits non-zero here (it can't tell a tooling failure from a real
violation), so a red result with this message is an environment issue, not an
accessibility finding.

### Pre-push hook example

```sh
# .git/hooks/pre-push  (chmod +x)
#!/bin/sh
scripts/a11y-check/a11y-check.sh http://localhost:3000 || {
  echo "Accessibility check failed — push aborted." >&2
  exit 1
}
```

(Assumes the dev server is already running; start it first, or have the hook do so.)

## Configuring rule coverage

The rule tags are a single editable variable near the top of `a11y-check.sh`:

```sh
TAGS="wcag2a,wcag2aa,best-practice"
```

Common tags: `wcag2a` `wcag2aa` `wcag2aaa` `wcag21a` `wcag21aa` `wcag22aa`
`best-practice`. The defaults cover WCAG 2.0/2.1 A + AA plus axe's best-practice
rules — a sensible smoke-test baseline. Tighten or widen as the project requires.

## Alternative engine: pa11y

If you'd rather not pull in `@axe-core/cli` (or you want HTML CodeSniffer rules
instead of axe), [**pa11y**][pa11y] is a drop-in alternative that also runs
headless and exits non-zero on issues:

```bash
npx pa11y http://localhost:3000
# or, to run the axe ruleset through pa11y:
npx pa11y --runner axe http://localhost:3000
```

The wrapper here standardises on `@axe-core/cli` because it tracks the axe-core
ruleset directly and matches the engine used in the full `next-template` suite,
keeping local results consistent with CI.

[axe]: https://github.com/dequelabs/axe-core
[cli]: https://github.com/dequelabs/axe-core-npm/tree/develop/packages/cli
[pa11y]: https://github.com/pa11y/pa11y
