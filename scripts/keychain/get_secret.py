"""get_secret.py — read a secret from the macOS Keychain via the `security` CLI.

Zero dependencies: shells out to `security` (macOS only). Convention is a single
flat keyring — service ``dev-keys``, one account per key name.

Library::

    from get_secret import get_secret
    key = get_secret("ANTHROPIC_API_KEY")

CLI::

    python get_secret.py ANTHROPIC_API_KEY [service]
"""

from __future__ import annotations

import subprocess
import sys

DEFAULT_SERVICE = "dev-keys"


def get_secret(account: str, service: str = DEFAULT_SERVICE) -> str:
    """Return the secret stored under (service, account), or raise if missing.

    Args:
        account: the key name, e.g. ``"ANTHROPIC_API_KEY"``.
        service: the keyring service; defaults to ``"dev-keys"``.
    """
    try:
        out = subprocess.check_output(
            ["security", "find-generic-password", "-s", service, "-a", account, "-w"],
            text=True,
            stderr=subprocess.DEVNULL,
        )
    except subprocess.CalledProcessError as exc:
        raise KeyError(
            f"Keychain secret not found: service={service!r} account={account!r}. "
            f"Store it with: security add-generic-password -s {service} -a {account} -w"
        ) from exc
    # `-w` prints the password followed by a trailing newline.
    return out.rstrip("\n")


def try_get_secret(account: str, service: str = DEFAULT_SERVICE) -> str | None:
    """Like ``get_secret`` but returns ``None`` instead of raising when absent."""
    try:
        return get_secret(account, service)
    except KeyError:
        return None


if __name__ == "__main__":
    args = sys.argv[1:]
    if not args:
        print("usage: get_secret.py <ACCOUNT> [service]", file=sys.stderr)
        sys.exit(2)
    account = args[0]
    service = args[1] if len(args) > 1 else DEFAULT_SERVICE
    try:
        sys.stdout.write(get_secret(account, service))
    except KeyError as exc:
        print(exc, file=sys.stderr)
        sys.exit(1)
