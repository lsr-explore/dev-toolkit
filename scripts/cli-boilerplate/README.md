# CLI boilerplate

> **Purpose:** Starter CLI — arg parsing, `--help`, leveled logging, exit codes. · **Lang:** TS + Python · **Deps:** none (`tsx` dev-only)
> **Copy to:** your project. · **Use when:** standing up a new Node or Python command-line script.

A starting point for a command-line script, in both **Node (TypeScript)** and
**Python**. Copy the file in your language of choice, rename the demo `greet`
command, and you have a CLI with argument parsing, `--help`, `--version`, leveled
logging, and proper exit codes already wired up.

**Zero runtime dependencies.** Everything is built-in:

- **Python** — `argparse` and `logging` are stdlib. Needs Python 3.8+.
- **Node** — argument parsing is `node:util` `parseArgs` (built in, Node 18.3+);
  logging is a ~10-line leveled console logger in the file. `tsx` is only a dev
  tool to run the TS directly — nothing ships at runtime.

## Run it

```bash
# Python
python cli.py --help
python cli.py greet World
python cli.py -v greet World           # DEBUG logging
python cli.py -q greet World           # warnings/errors only
python cli.py --version

# Node
npx tsx cli.ts --help
npx tsx cli.ts greet World --times 3
npx tsx cli.ts --version
```

Both print the same thing for the demo command:

```
$ python cli.py greet World
Hello, World!
```

## What you get

| Feature        | Python                                  | Node                                        |
| -------------- | --------------------------------------- | ------------------------------------------- |
| Arg parsing    | `argparse` (stdlib)                     | `node:util` `parseArgs` (built in)          |
| `--help` / `-h`| automatic from `argparse`               | printed `USAGE` string                      |
| `--version`    | `action="version"`                      | handled in `main`                           |
| Verbosity      | `-v`/`--verbose`, `-q`/`--quiet` → `logging` level | same flags → tiny leveled logger   |
| Demo action    | `greet <name>` subcommand               | `greet <name>` command                      |
| Exit codes     | `0` ok · `1` runtime error · `2` usage · `130` Ctrl-C | `0` ok · `1` runtime error · `2` usage |

**Logs go to stderr, real output to stdout** — so the program stays pipe-friendly
(`cli.py greet World | cat` gets just the greeting, not the log noise).

## Copy-in tweaks

- Rename `greet` to your real command and put the work in its handler
  (`cmd_greet` / `cmdGreet`).
- Bump `VERSION` (or wire it to package metadata: read `package.json` in Node,
  `importlib.metadata.version(...)` in Python).
- Add more subcommands: another `sub.add_parser(...)` in Python, another `case`
  in the Node command switch.

## Notes

- **Cross-platform** — no macOS-specific calls here, unlike most snippets in this
  repo. Both run the same on Linux/CI.
- The two versions are intentionally close in shape so you can keep a project's
  Python and Node CLIs feeling consistent. They are independent files, though —
  copy only the one you need.
