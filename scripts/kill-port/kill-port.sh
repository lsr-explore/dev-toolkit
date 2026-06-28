#!/bin/sh
#
# kill-port — find and (optionally) kill whatever is listening on a TCP port.
#
# Deps: lsof + kill, both built into macOS. Zero install.
# macOS-first; see README for the Linux equivalent (fuser / ss).
#
# Default is SAFE: it prints what it found and stops. Pass -f / --force to
# actually signal the process(es). SIGTERM by default; -9 / --kill for SIGKILL.

set -eu

usage() {
	cat <<'EOF'
Usage: kill-port [-f|--force] [-9|--kill] <port>

Find the process(es) listening on a TCP port. Prints what it finds and,
unless --force is given, leaves them running.

Options:
  -f, --force   actually send the signal (default: report only, do not kill)
  -9, --kill    use SIGKILL instead of the default SIGTERM (implies a forceful
                kill; -9 still requires --force to act)
  -h, --help    show this help

Exit codes:
  0  killed, or reported successfully with something listening
  1  bad usage / invalid port
  3  nothing was listening on that port

Examples:
  kill-port 3000           # show what's on :3000, kill nothing
  kill-port -f 3000        # SIGTERM the listener(s) on :3000
  kill-port -f -9 3000     # SIGKILL the listener(s) on :3000
EOF
}

force=0
signal=TERM
port=""

while [ $# -gt 0 ]; do
	case "$1" in
		-f|--force) force=1 ;;
		-9|--kill)  signal=KILL ;;
		-h|--help)  usage; exit 0 ;;
		-*)
			printf 'kill-port: unknown option: %s\n\n' "$1" >&2
			usage >&2
			exit 1
			;;
		*)
			if [ -n "$port" ]; then
				printf 'kill-port: too many arguments\n\n' >&2
				usage >&2
				exit 1
			fi
			port="$1"
			;;
	esac
	shift
done

# Validate the port: required, digits only, 1..65535.
if [ -z "$port" ]; then
	printf 'kill-port: missing <port>\n\n' >&2
	usage >&2
	exit 1
fi
case "$port" in
	''|*[!0-9]*)
		printf 'kill-port: invalid port: %s (must be a number 1-65535)\n' "$port" >&2
		exit 1
		;;
esac
if [ "$port" -lt 1 ] || [ "$port" -gt 65535 ]; then
	printf 'kill-port: invalid port: %s (must be a number 1-65535)\n' "$port" >&2
	exit 1
fi

# Collect listening PIDs. lsof exits non-zero when there are no matches, which
# would trip `set -e`, so guard it.
pids=$(lsof -nP -iTCP:"$port" -sTCP:LISTEN -t 2>/dev/null || true)

if [ -z "$pids" ]; then
	printf 'kill-port: nothing is listening on TCP port %s.\n' "$port"
	exit 3
fi

# Show the human-readable detail (command, PID, user) for what we found.
printf 'Listening on TCP port %s:\n' "$port"
lsof -nP -iTCP:"$port" -sTCP:LISTEN 2>/dev/null || true
printf '\n'

if [ "$force" -eq 0 ]; then
	printf 'Reported only. Re-run with -f/--force to send SIG%s.\n' "$signal"
	exit 0
fi

# Force: signal each PID. Report per-PID success/failure but keep going.
status=0
for pid in $pids; do
	name=$(ps -p "$pid" -o comm= 2>/dev/null || true)
	if kill -"$signal" "$pid" 2>/dev/null; then
		printf 'Sent SIG%s to PID %s (%s)\n' "$signal" "$pid" "${name:-?}"
	else
		printf 'kill-port: failed to signal PID %s (%s) — already gone, or try sudo?\n' \
			"$pid" "${name:-?}" >&2
		status=1
	fi
done

exit "$status"
