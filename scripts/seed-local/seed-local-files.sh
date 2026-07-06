#!/usr/bin/env bash
#
# seed-local-files.sh — copy untracked, gitignored local files from an existing
# worktree/clone into THIS one, driven by an explicit manifest.
#
# `git clone` and `git worktree add` only materialize *tracked* files. Local-only
# artifacts — real .env secrets, per-repo Claude skills, downloaded corpus snapshots,
# your local permission allowlist — are gitignored and therefore absent from a fresh
# checkout. Run this once after cloning or adding a worktree to seed them.
#
# WHAT it copies is defined entirely by a manifest (see scripts/seed-local-files.manifest),
# NOT by scanning for untracked files. A directory entry is rsync'd (merged, no delete);
# a file entry is copied. This is deliberate: it will not sweep up arbitrary branch WIP,
# only the paths you list. Even so, a directory entry copies everything under it — use
# --dry-run first, and pass a narrower --manifest for one-off, surgical copies.
#
# Usage (run from inside the DESTINATION clone/worktree):
#   scripts/seed-local-files.sh [-m FILE] [-n] <path-to-source-worktree>
#
#   -m, --manifest FILE   list of paths to copy; a .json array (needs jq) or a
#                         newline-delimited file. default: scripts/seed-local-files.manifest
#   -n, --dry-run         print what would be copied; copy nothing
#   -h, --help            this help
#
# Example:
#   scripts/seed-local-files.sh -n ../../dev/veloce-trace     # preview
#   scripts/seed-local-files.sh    ../../dev/veloce-trace     # do it
#
# Deps/caches are intentionally NOT in the default manifest — regenerate them:
#   pnpm install     # node_modules
#   uv sync          # python/.venv (run in python/)
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DST="$(cd "$SCRIPT_DIR/.." && pwd)"           # repo root = the clone we're seeding
DEFAULT_MANIFEST="$SCRIPT_DIR/seed-local-files.manifest"

usage() { sed -n '2,30p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'; }

MANIFEST="$DEFAULT_MANIFEST"
DRY=false
SRC_ARG=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    -m|--manifest) MANIFEST="${2:-}"; shift 2 ;;
    -n|--dry-run)  DRY=true; shift ;;
    -h|--help)     usage; exit 0 ;;
    -*)            echo "error: unknown option: $1" >&2; exit 2 ;;
    *)             SRC_ARG="$1"; shift ;;
  esac
done

if [[ -z "$SRC_ARG" ]]; then
  echo "usage: scripts/seed-local-files.sh [-m FILE] [-n] <path-to-source-worktree>" >&2
  exit 2
fi
SRC="$(cd "$SRC_ARG" 2>/dev/null && pwd || true)"
if [[ -z "$SRC" || ! -d "$SRC" ]]; then
  echo "error: source worktree not found: $SRC_ARG" >&2
  exit 2
fi
if [[ "$SRC" == "$DST" ]]; then
  echo "error: source and destination are the same worktree ($DST)" >&2
  exit 2
fi
if [[ ! -f "$MANIFEST" ]]; then
  echo "error: manifest not found: $MANIFEST" >&2
  exit 2
fi

# Load the manifest into ENTRIES (pure-bash-3.2-safe; no mapfile).
ENTRIES=()
if [[ "$MANIFEST" == *.json ]]; then
  command -v jq >/dev/null 2>&1 || { echo "error: jq required to read a .json manifest" >&2; exit 2; }
  while IFS= read -r line; do ENTRIES+=("$line"); done < <(jq -r '.[]' "$MANIFEST")
else
  while IFS= read -r raw || [[ -n "$raw" ]]; do
    line="${raw#"${raw%%[![:space:]]*}"}"   # ltrim
    line="${line%"${line##*[![:space:]]}"}" # rtrim
    [[ -z "$line" || "$line" == \#* ]] && continue
    ENTRIES+=("$line")
  done < "$MANIFEST"
fi

echo "seeding local files$( $DRY && echo ' (dry run — nothing will be copied)')"
echo "  from:     $SRC"
echo "  into:     $DST"
echo "  manifest: $MANIFEST"
echo

for rel in "${ENTRIES[@]}"; do
  src="$SRC/$rel"
  dst="$DST/$rel"
  if [[ -d "$src" ]]; then
    echo "  dir   $rel/"
    $DRY || { mkdir -p "$dst"; rsync -a "$src/" "$dst/"; }
  elif [[ -f "$src" ]]; then
    echo "  file  $rel"
    $DRY || { mkdir -p "$(dirname "$dst")"; cp -p "$src" "$dst"; }
  else
    echo "  skip  $rel (absent in source)"
  fi
done

echo
if $DRY; then
  echo "dry run complete — re-run without -n to copy."
else
  echo "done. remaining setup in the new worktree:"
  echo "  pnpm install   # node_modules"
  echo "  uv sync        # python/.venv (run in python/)"
fi
