# kill-port

Find and (optionally) kill whatever is listening on a TCP port — the usual fix
for "address already in use" after a dev server didn't shut down cleanly.

Built on `lsof` + `kill`, both built into macOS. **Zero runtime dependency** to
install.

## Behavior

The default is deliberately **safe**: `kill-port <port>` *reports* what is
listening and kills nothing. You have to opt in with `-f`/`--force` to send a
signal. This avoids the muscle-memory accident of nuking the wrong process when
you fat-finger a port.

```
kill-port [-f|--force] [-9|--kill] <port>

-f, --force   actually send the signal (default: report only)
-9, --kill    SIGKILL instead of the default SIGTERM
-h, --help    show help
```

- **SIGTERM by default** (graceful); `-9`/`--kill` upgrades to SIGKILL.
- **Multiple PIDs** on the same port are all handled — each is signalled and
  reported individually.
- `-9` still requires `--force` to act; on its own it only changes which signal a
  forced run would send.

### Exit codes

| Code | Meaning                                                        |
|------|---------------------------------------------------------------|
| `0`  | killed, or reported successfully with something listening     |
| `1`  | bad usage / invalid port                                      |
| `3`  | nothing was listening on that port                            |

"Nothing listening" is a distinct `3` (not an error `1`) so a wrapper script can
tell "already free" apart from "you called me wrong" — while still being
non-zero so `kill-port X && start X` won't barrel ahead on a typo. Flip it to
`exit 0` if you'd rather treat an empty port as success.

## Usage

```bash
kill-port 3000           # show what's on :3000, kill nothing
kill-port -f 3000        # SIGTERM the listener(s) on :3000
kill-port -f -9 3000     # SIGKILL the listener(s) on :3000
```

Example session:

```
$ kill-port 3000
Listening on TCP port 3000:
COMMAND   PID   USER   FD   TYPE  DEVICE SIZE/OFF NODE NAME
node    47143 laurie    3u  IPv4  0x...       0t0  TCP *:3000 (LISTEN)

Reported only. Re-run with -f/--force to send SIGTERM.

$ kill-port -f 3000
Listening on TCP port 3000:
...
Sent SIGTERM to PID 47143 (node)
```

## Install

```bash
mkdir -p ~/.local/bin
cp kill-port.sh ~/.local/bin/kill-port
chmod +x ~/.local/bin/kill-port
# ensure ~/.local/bin is on your PATH (add to ~/.zshrc if needed):
#   export PATH="$HOME/.local/bin:$PATH"
```

Or just run it in place: `./kill-port.sh 3000`.

## Tweaks

- **Always-kill (skip the report-only gate):** drop the `force` flag and the
  `if [ "$force" -eq 0 ]` block — but then you lose the safety net.
- **Confirm instead of `--force`:** swap the gate for a `read` prompt
  (`printf 'kill these? [y/N] '; read ans`). The `--force` flag was chosen over a
  prompt so the script stays usable non-interactively (in a `package.json`
  script, a Makefile, etc.).
- **UDP too:** change `-iTCP:` to `-iUDP:` (UDP has no `LISTEN` state, so drop the
  `-sTCP:LISTEN` filter for that case).

## Linux note

The `lsof` flags here (`-nP -iTCP:<port> -sTCP:LISTEN -t`) are macOS-oriented and
work with Linux `lsof` too, so the script is portable as-is. If you'd rather use
native Linux tooling:

```bash
fuser -k <port>/tcp        # find and kill in one shot (add -k to kill)
ss -ltnp | grep :<port>    # inspect the listener and its PID
```

`fuser -k` is the closest one-liner, but note it kills immediately with no
report-first step.
