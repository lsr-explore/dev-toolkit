#!/usr/bin/env -S npx tsx
/**
 * cli.ts — boilerplate command-line script to copy and adapt.
 *
 * Zero runtime dependencies: argument parsing uses `node:util` parseArgs (built
 * in, Node 18.3+) and logging is a ~10-line leveled console logger below. `tsx`
 * is only a dev tool to run TypeScript directly; nothing ships at runtime.
 *
 * Run it:
 *   npx tsx cli.ts --help
 *   npx tsx cli.ts greet World
 *   npx tsx cli.ts -v greet World          # DEBUG logging
 *   npx tsx cli.ts -q greet World          # warnings/errors only
 *   npx tsx cli.ts --version
 *
 * Copy-in tweaks:
 *   - Rename `greet` to your real command and put the work in its handler.
 *   - Bump VERSION (or read it from package.json).
 *   - Add cases to the command switch for more subcommands.
 */
import { parseArgs } from 'node:util';

const PROG = 'cli';
const VERSION = '0.1.0';

// --- tiny leveled logger (no deps) ------------------------------------------
// Logs go to stderr so stdout stays clean for actual program output.
const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 } as const;
type Level = keyof typeof LEVELS;
let threshold = LEVELS.info;
const setLevel = (l: Level) => { threshold = LEVELS[l]; };
const log = {
  debug: (...a: unknown[]) => { if (threshold <= LEVELS.debug) console.error('DEBUG:', ...a); },
  info: (...a: unknown[]) => { if (threshold <= LEVELS.info) console.error('INFO:', ...a); },
  warn: (...a: unknown[]) => { if (threshold <= LEVELS.warn) console.error('WARN:', ...a); },
  error: (...a: unknown[]) => { if (threshold <= LEVELS.error) console.error('ERROR:', ...a); },
};
// ----------------------------------------------------------------------------

const USAGE = `${PROG} ${VERSION} — boilerplate CLI; copy this file and replace the greet command.

Usage:
  ${PROG} [options] <command> [args]

Commands:
  greet <name>            print a greeting (the demo action)

Options:
  -v, --verbose           enable debug logging
  -q, --quiet             only log warnings and errors
      --greeting <word>   greeting word for 'greet' (default: Hello)
      --times <n>         repeat count for 'greet' (default: 1)
  -h, --help              show this help
      --version           show version`;

function cmdGreet(positionals: string[], values: Record<string, unknown>): number {
  const name = positionals[0];
  if (!name || !name.trim()) {
    log.error('greet requires a non-empty <name>');
    return 1;
  }
  const greeting = (values.greeting as string) ?? 'Hello';
  const times = Number(values.times ?? 1);
  if (!Number.isInteger(times) || times < 1) {
    log.error(`--times must be a positive integer (got ${values.times})`);
    return 1;
  }
  log.debug(`preparing greeting for ${JSON.stringify(name)}`);
  // Real output goes to stdout.
  console.log(Array.from({ length: times }, () => `${greeting}, ${name}!`).join('\n'));
  log.debug('greeting emitted');
  return 0;
}

function main(argv: string[]): number {
  let parsed;
  try {
    parsed = parseArgs({
      args: argv,
      allowPositionals: true,
      options: {
        verbose: { type: 'boolean', short: 'v' },
        quiet: { type: 'boolean', short: 'q' },
        help: { type: 'boolean', short: 'h' },
        version: { type: 'boolean' },
        greeting: { type: 'string' },
        times: { type: 'string' },
      },
    });
  } catch (err) {
    // parseArgs throws on unknown flags / missing values — treat as usage error.
    log.error((err as Error).message);
    console.error(`\n${USAGE}`);
    return 2;
  }

  const { values, positionals } = parsed;

  if (values.version) { console.log(`${PROG} ${VERSION}`); return 0; }
  if (values.help || positionals.length === 0) {
    console.log(USAGE);
    return values.help ? 0 : 2;
  }

  if (values.quiet) setLevel('warn');
  else if (values.verbose) setLevel('debug');

  const [command, ...rest] = positionals;
  switch (command) {
    case 'greet':
      return cmdGreet(rest, values);
    default:
      log.error(`unknown command: ${command}`);
      console.error(`\n${USAGE}`);
      return 2;
  }
}

// Run directly: `npx tsx cli.ts ...`
if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    process.exit(main(process.argv.slice(2)));
  } catch (err) {
    // Top-level guard: turn any unexpected crash into a clean non-zero exit.
    log.error((err as Error).message);
    process.exit(1);
  }
}

export { main };
