#!/usr/bin/env python3
"""cli.py — boilerplate command-line script to copy and adapt.

Zero runtime dependencies: argument parsing (``argparse``) and leveled logging
(``logging``) are both stdlib. Runs anywhere Python 3.8+ is available.

Run it::

    python cli.py --help
    python cli.py greet World
    python cli.py -v greet World          # DEBUG logging
    python cli.py -q greet World          # warnings/errors only
    python cli.py --version

Copy-in tweaks:
  - Rename ``greet`` to your real subcommand and put the work in its handler.
  - Bump ``VERSION`` (or wire it to your package metadata).
  - Add more subparsers under ``build_parser`` for additional commands.
"""

from __future__ import annotations

import argparse
import logging
import sys

PROG = "cli"
VERSION = "0.1.0"

log = logging.getLogger(PROG)


def configure_logging(verbose: bool, quiet: bool) -> None:
    """Map --verbose/--quiet to a log level. Logs go to stderr so stdout stays
    clean for actual program output (pipe-friendly)."""
    if quiet:
        level = logging.WARNING
    elif verbose:
        level = logging.DEBUG
    else:
        level = logging.INFO
    logging.basicConfig(level=level, format="%(levelname)s: %(message)s", stream=sys.stderr)


def cmd_greet(args: argparse.Namespace) -> int:
    """Demonstrative subcommand: greet someone. Returns a process exit code."""
    log.debug("preparing greeting for %r", args.name)
    if not args.name.strip():
        # Errors go to stderr via logging; return non-zero so callers/CI notice.
        log.error("name must not be empty")
        return 1
    greeting = f"{args.greeting}, {args.name}!"
    # Real output goes to stdout.
    print(greeting * args.times if args.times == 1 else "\n".join([greeting] * args.times))
    log.debug("greeting emitted")
    return 0


def build_parser() -> argparse.ArgumentParser:
    # Global verbosity flags live on a parent parser so they're accepted BOTH
    # before and after the subcommand (`cli -v greet X` and `cli greet X -v`).
    # default=SUPPRESS is the key: an absent flag leaves the namespace untouched,
    # so the copy on the subparser can't clobber a value set before the command
    # (the classic argparse subparser footgun). -v and -q stay mutually exclusive.
    common = argparse.ArgumentParser(add_help=False)
    verbosity = common.add_mutually_exclusive_group()
    verbosity.add_argument("-v", "--verbose", action="store_true",
                           default=argparse.SUPPRESS, help="enable debug logging")
    verbosity.add_argument("-q", "--quiet", action="store_true",
                           default=argparse.SUPPRESS, help="only log warnings and errors")

    parser = argparse.ArgumentParser(
        prog=PROG,
        description="Boilerplate CLI — copy this file and replace the greet command.",
        parents=[common],
    )
    parser.add_argument("--version", action="version", version=f"%(prog)s {VERSION}")

    sub = parser.add_subparsers(dest="command", metavar="<command>")
    sub.required = True  # Python 3.8-safe way to require a subcommand.

    greet = sub.add_parser("greet", parents=[common], help="print a greeting (the demo action)")
    greet.add_argument("name", help="who to greet")
    greet.add_argument("--greeting", default="Hello", help="greeting word (default: Hello)")
    greet.add_argument("--times", type=int, default=1, help="repeat count (default: 1)")
    greet.set_defaults(func=cmd_greet)

    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    # getattr defaults because SUPPRESS means the attr is absent unless the flag
    # was actually passed (in either position).
    configure_logging(getattr(args, "verbose", False), getattr(args, "quiet", False))
    try:
        return args.func(args)
    except KeyboardInterrupt:
        log.error("interrupted")
        return 130
    except Exception as exc:  # noqa: BLE001 — top-level guard turns crashes into clean exits.
        log.error("%s", exc)
        log.debug("traceback follows", exc_info=True)
        return 1


if __name__ == "__main__":
    sys.exit(main())
