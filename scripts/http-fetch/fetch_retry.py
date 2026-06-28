"""fetch_retry.py — zero-dependency HTTP fetch with per-attempt timeout,
retry-with-backoff, and a typed error. Python stdlib only (urllib) — no requests.

Runtime requirement: Python 3.8+. No pip dependencies.

    from fetch_retry import fetch_retry, FetchRetryError
    resp = fetch_retry("https://example.com", retries=3)
    body = resp.read().decode()

CLI demo:  python fetch_retry.py https://example.com
"""

from __future__ import annotations

import random
import sys
import time
import urllib.error
import urllib.request
from email.utils import parsedate_to_datetime
from datetime import datetime, timezone
from http.client import HTTPResponse
from typing import Callable, Mapping, Optional

# Status codes worth retrying — transient server / rate-limit conditions.
RETRYABLE_STATUS = frozenset({429, 500, 502, 503, 504})


class FetchRetryError(Exception):
    """Raised when every attempt fails. Carries the HTTP status (if any),
    the number of attempts made, and the underlying cause."""

    def __init__(
        self,
        message: str,
        *,
        status: Optional[int] = None,
        attempts: int,
        url: str,
        cause: Optional[BaseException] = None,
    ) -> None:
        super().__init__(message)
        self.status = status
        self.attempts = attempts
        self.url = url
        self.__cause__ = cause


def _parse_retry_after(value: Optional[str]) -> Optional[float]:
    """Parse a Retry-After header (delta-seconds or HTTP-date) into seconds."""
    if not value:
        return None
    value = value.strip()
    if value.isdigit():
        return max(0.0, float(value))
    try:
        when = parsedate_to_datetime(value)
    except (TypeError, ValueError):
        return None
    if when is None:
        return None
    if when.tzinfo is None:
        when = when.replace(tzinfo=timezone.utc)
    return max(0.0, (when - datetime.now(timezone.utc)).total_seconds())


def _backoff_with_jitter(attempt: int, base: float, cap: float) -> float:
    """Exponential backoff (base * 2**(attempt-1)) with full jitter, capped."""
    exp = min(cap, base * (2 ** (attempt - 1)))
    return random.uniform(0.0, exp)  # full jitter: [0, exp)


def fetch_retry(
    url: str,
    *,
    method: str = "GET",
    data: Optional[bytes] = None,
    headers: Optional[Mapping[str, str]] = None,
    retries: int = 3,
    timeout: float = 10.0,
    backoff: float = 0.3,
    max_backoff: float = 20.0,
    on_retry: Optional[Callable[[int, BaseException, float], None]] = None,
) -> HTTPResponse:
    """Open ``url`` with a per-attempt timeout and exponential backoff + jitter.

    Retries on network errors and retryable status codes (429, 500, 502, 503,
    504), respecting ``Retry-After`` when present. Does NOT retry other 4xx —
    those are raised immediately (wrapped) so the caller can inspect them. On
    final failure raises :class:`FetchRetryError`.

    Returns the live ``HTTPResponse`` (call ``.read()`` to get the body).

    :param retries: max retries *after* the first attempt (default 3 → up to 4).
    :param timeout: per-attempt timeout in seconds.
    """
    req = urllib.request.Request(url, data=data, method=method)
    for key, val in (headers or {}).items():
        req.add_header(key, val)

    last_error: Optional[BaseException] = None
    last_status: Optional[int] = None

    for attempt in range(1, retries + 2):
        delay: Optional[float] = None
        try:
            return urllib.request.urlopen(req, timeout=timeout)  # noqa: S310
        except urllib.error.HTTPError as err:
            # The server answered with an error status.
            last_status = err.code
            last_error = err
            if err.code not in RETRYABLE_STATUS:
                # Non-retryable (e.g. 400/401/403/404) — surface immediately.
                raise FetchRetryError(
                    f"HTTP {err.code} {err.reason}",
                    status=err.code,
                    attempts=attempt,
                    url=url,
                    cause=err,
                ) from err
            delay = _parse_retry_after(err.headers.get("Retry-After"))
        except (urllib.error.URLError, OSError) as err:
            # Network failure or timeout (socket.timeout is an OSError subclass).
            last_error = err

        if attempt > retries:
            break
        if delay is None:
            delay = _backoff_with_jitter(attempt, backoff, max_backoff)
        if on_retry is not None and last_error is not None:
            on_retry(attempt, last_error, delay)
        time.sleep(delay)

    raise FetchRetryError(
        f"Failed after {retries + 1} attempt(s): {last_error}",
        status=last_status,
        attempts=retries + 1,
        url=url,
        cause=last_error,
    )


# --- CLI demo -------------------------------------------------------------
def _main(argv: list) -> int:
    url = argv[1] if len(argv) > 1 else "https://example.com"

    def _log(attempt: int, error: BaseException, delay: float) -> None:
        print(f"  retry {attempt} after {delay:.2f}s — {error}", file=sys.stderr)

    try:
        resp = fetch_retry(url, retries=3, on_retry=_log)
        body = resp.read()
        print(f"✓ {resp.status} {resp.reason} — {len(body)} bytes")
        return 0
    except FetchRetryError as err:
        print(
            f"✗ {err} (status={err.status}, attempts={err.attempts})",
            file=sys.stderr,
        )
        return 1


if __name__ == "__main__":
    sys.exit(_main(sys.argv))
