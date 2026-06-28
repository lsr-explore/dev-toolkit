#!/bin/sh
# a11y-check.sh — lightweight accessibility smoke check for a single URL.
#
# DEPENDENCY (fetched on demand, nothing to install up front):
#   npx @axe-core/cli <url>   — the axe-core accessibility engine, run via npx.
#   Requires Node (for npx) and a local headless Chrome + chromedriver, which
#   @axe-core/cli drives. On macOS the easiest source is an existing Chrome plus
#   `npx @axe-core/cli` pulling a matching chromedriver, or `brew install chromedriver`.
#
# What it does: runs axe against ONE url, fails (exit 1) if there are violations,
# so it can gate a pre-push hook or a CI step. Use it for a quick check on a small
# site/page that does NOT already have a full vitest-axe + Playwright suite.
#
# Usage:  ./a11y-check.sh [url]     (url defaults to http://localhost:3000)
#         ./a11y-check.sh -h
#
# macOS-first, POSIX sh.

set -eu

# --- Configuration -----------------------------------------------------------
# Rule tags axe runs against. Edit this one line to widen/narrow coverage.
# Common tags: wcag2a wcag2aa wcag2aaa wcag21a wcag21aa wcag22aa best-practice
TAGS="wcag2a,wcag2aa,best-practice"

DEFAULT_URL="http://localhost:3000"

# --- Helpers -----------------------------------------------------------------
prog=$(basename "$0")

usage() {
  cat <<EOF
$prog — lightweight accessibility smoke check for a single URL (axe-core).

Usage:
  $prog [url]        Run axe against <url> (default: $DEFAULT_URL)
  $prog -h | --help  Show this help

Behaviour:
  • Runs:  npx @axe-core/cli <url> --tags $TAGS
  • Exits 0 when no violations are found, non-zero when there are (CI/pre-push gate).
  • Edit the TAGS variable near the top of this script to change rule coverage.

Requirements:
  • Node (for npx) and a headless Chrome + chromedriver that @axe-core/cli drives.
  • macOS-first. See README.md for when to use this vs. a full vitest-axe/Playwright
    setup, and for pa11y as an alternative engine.
EOF
}

die() {
  printf '%s: %s\n' "$prog" "$1" >&2
  exit 2
}

# --- Argument parsing --------------------------------------------------------
case "${1:-}" in
  -h|--help) usage; exit 0 ;;
esac

if [ "$#" -gt 1 ]; then
  usage >&2
  die "expected at most one argument (a url), got $#"
fi

URL="${1:-$DEFAULT_URL}"

# Minimal sanity check: must look like an http(s) URL.
case "$URL" in
  http://*|https://*) : ;;
  *) die "'$URL' is not an http(s) URL (expected e.g. http://localhost:3000)" ;;
esac

command -v npx >/dev/null 2>&1 || die "npx not found — install Node (https://nodejs.org)"

# --- Run axe -----------------------------------------------------------------
# Capture output so we can both show it and gate on the result. @axe-core/cli
# already exits non-zero on violations, but we re-derive a clean summary/exit
# below so the behaviour is explicit regardless of CLI version.
printf 'a11y-check: running axe (%s) against %s …\n\n' "$TAGS" "$URL" >&2

set +e
OUTPUT=$(npx --yes @axe-core/cli "$URL" --tags "$TAGS" --exit 2>&1)
STATUS=$?
set -e

printf '%s\n' "$OUTPUT"

# --- Summarise + decide exit code -------------------------------------------
# @axe-core/cli prints lines like "Found N accessibility issues:" / "Found 0".
# Trust its exit code as the source of truth; add a readable one-line summary.
echo
if [ "$STATUS" -eq 0 ]; then
  printf 'a11y-check: ✓ no violations for %s (tags: %s)\n' "$URL" "$TAGS"
  exit 0
else
  # Pull the count out of the axe summary line if present, for a tidy headline.
  COUNT=$(printf '%s\n' "$OUTPUT" | grep -Eo 'Found [0-9]+' | grep -Eo '[0-9]+' | head -n1)
  if [ -n "${COUNT:-}" ]; then
    printf 'a11y-check: ✗ %s accessibility violation(s) for %s (tags: %s)\n' \
      "$COUNT" "$URL" "$TAGS" >&2
  else
    printf 'a11y-check: ✗ axe reported a problem for %s (exit %s) — see output above\n' \
      "$URL" "$STATUS" >&2
  fi
  exit 1
fi
