"""verify_secret.py — confirm a Keychain secret is retrievable AND looks valid.

A standalone check you can run before a deploy or after rotating a key. It reads the
lookup config from the **environment** (never hard-coded here) so the same script
works for any key without edits::

    KEYCHAIN_ACCOUNT      required — the key name, e.g. ANTHROPIC_API_KEY
    KEYCHAIN_SERVICE      optional — the keyring service (default: dev-keys)
    KEYCHAIN_PROVIDER     optional — provider id for the format/live checks
                                     (default: inferred from the account name)
    KEYCHAIN_KEY_PATTERN  optional — override the format regex (a regex source string)

Checks run in order; the first failure exits non-zero:
    1. retrievable — the secret exists under (service, account)
    2. non-empty   — it isn't blank / whitespace
    3. format      — matches the expected prefix/shape (only if one is known or given)
    4. live        — ONLY with --live: a real provider auth call proves the key works

Zero dependencies: Keychain read shells out to ``security`` (macOS); the live probe
uses the standard-library ``urllib``. The secret value is never printed — only its
last 6 characters, for eyeball confirmation::

    KEYCHAIN_ACCOUNT=ANTHROPIC_API_KEY python verify_secret.py
    KEYCHAIN_ACCOUNT=ANTHROPIC_API_KEY python verify_secret.py --live
"""

from __future__ import annotations

import os
import re
import sys
import urllib.error
import urllib.request
from typing import Callable, NoReturn

from get_secret import get_secret

DEFAULT_SERVICE = "dev-keys"
LIVE_TIMEOUT_S = 10


# A small, extend-me registry: one place for both the format check and the optional
# live probe. Add your own providers here. Each entry maps a provider id to
# (compiled pattern, live-probe builder). The live builder takes the key and returns
# (url, headers); a valid key should 200, an invalid one 401/403.
PROVIDERS: dict[str, tuple[re.Pattern[str], Callable[[str], tuple[str, dict[str, str]]] | None]] = {
    "anthropic": (
        re.compile(r"^sk-ant-"),
        lambda key: (
            "https://api.anthropic.com/v1/models",
            {"x-api-key": key, "anthropic-version": "2023-06-01"},
        ),
    ),
    "openai": (
        re.compile(r"^sk-"),
        lambda key: (
            "https://api.openai.com/v1/models",
            {"Authorization": f"Bearer {key}"},
        ),
    ),
}


def infer_provider(account: str) -> str | None:
    lowered = account.lower()
    return next((name for name in PROVIDERS if name in lowered), None)


def mask(secret: str) -> str:
    return "…" + secret[-6:] if len(secret) > 6 else "(too short to mask)"


def fail(message: str) -> NoReturn:
    print(f"✗ {message}", file=sys.stderr)
    raise SystemExit(1)


def probe(url: str, headers: dict[str, str]) -> int:
    req = urllib.request.Request(url, headers=headers, method="GET")
    try:
        with urllib.request.urlopen(req, timeout=LIVE_TIMEOUT_S) as resp:
            return resp.status
    except urllib.error.HTTPError as exc:
        return exc.code  # 401/403/etc. arrive here, not as a value


def main() -> None:
    live = "--live" in sys.argv[1:]

    account = os.environ.get("KEYCHAIN_ACCOUNT")
    if not account:
        print(
            "usage: KEYCHAIN_ACCOUNT=<KEY_NAME> python verify_secret.py [--live]",
            file=sys.stderr,
        )
        print(
            "  optional env: KEYCHAIN_SERVICE, KEYCHAIN_PROVIDER, KEYCHAIN_KEY_PATTERN",
            file=sys.stderr,
        )
        raise SystemExit(2)
    service = os.environ.get("KEYCHAIN_SERVICE", DEFAULT_SERVICE)

    # 1. retrievable
    try:
        secret = get_secret(account, service)
    except KeyError as exc:
        fail(exc.args[0])

    # 2. non-empty
    if not secret.strip():
        fail(f"'{account}' is present in '{service}' but empty — re-store it.")
    print(f"✓ retrievable — '{account}' from '{service}' ({mask(secret)})")

    # 3. format
    provider_name = os.environ.get("KEYCHAIN_PROVIDER", "").lower() or infer_provider(account)
    entry = PROVIDERS.get(provider_name) if provider_name else None
    pattern_src = os.environ.get("KEYCHAIN_KEY_PATTERN")
    pattern = re.compile(pattern_src) if pattern_src else (entry[0] if entry else None)
    if pattern is not None:
        if not pattern.search(secret):
            fail(f"format check failed — value does not match {pattern.pattern!r}. Wrong key stored?")
        print(f"✓ format — matches {pattern.pattern!r}")
    else:
        print(
            "• format — not checked (no known pattern; set KEYCHAIN_PROVIDER or KEYCHAIN_KEY_PATTERN)"
        )

    # 4. live (opt-in)
    if not live:
        return
    live_builder = entry[1] if entry else None
    if live_builder is None:
        fail(
            f"--live requested but no live probe is defined for provider "
            f"'{provider_name or '(unknown)'}'. Add one to the PROVIDERS registry."
        )
    url, headers = live_builder(secret)
    try:
        status = probe(url, headers)
    except (urllib.error.URLError, TimeoutError) as exc:
        fail(f"live probe could not reach {url}: {exc}")
    if status in (401, 403):
        fail(f"live probe rejected the key (HTTP {status}) — key is present but not valid.")
    if status >= 400:
        # Not an auth rejection; the key may be fine but the probe endpoint errored.
        print(f"⚠ live — probe returned HTTP {status} (not an auth rejection; treat as inconclusive)")
        return
    print(f"✓ live — provider accepted the key (HTTP {status})")


if __name__ == "__main__":
    main()
