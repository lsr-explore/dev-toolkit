"""cache.py — a tiny disk-backed, provider-agnostic response cache.

Wrap any call in ``cached(req, producer)``. An identical ``req`` (by stable hash)
short-circuits to the value stored on disk instead of re-running the producer —
handy for not re-spending tokens on repeated AI calls during UI dev.

    from cache import cached
    res = cached(req, lambda: client.messages.create(**req))

Standard library only.
"""

from __future__ import annotations

import hashlib
import json
import os
import tempfile
import time
from pathlib import Path
from typing import Any, Callable, Optional, TypeVar

T = TypeVar("T")

DEFAULT_DIR = Path(os.environ.get("AI_CACHE_DIR", Path(tempfile.gettempdir()) / "ai-cache"))


def _hash_key(key: Any) -> str:
    # sort_keys makes logically-equal requests serialize identically; default=str
    # lets non-JSON values (e.g. enums) still contribute to the key.
    canonical = json.dumps(key, sort_keys=True, separators=(",", ":"), default=str)
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()


def _entry_path(key: Any, dir: Optional[Path], namespace: Optional[str]) -> Path:
    base = Path(dir) if dir else DEFAULT_DIR
    if namespace:
        base = base / namespace
    return base / f"{_hash_key(key)}.json"


def cached(
    key: Any,
    producer: Callable[[], T],
    *,
    dir: Optional[Path] = None,
    ttl: Optional[float] = None,
    namespace: Optional[str] = None,
) -> T:
    """Return the cached value for ``key``, or run ``producer``, store, and return it.

    Args:
        key: any JSON-serializable request describing the call.
        producer: the work to run on a cache miss.
        dir: cache directory (default ``$AI_CACHE_DIR`` or ``<tmp>/ai-cache``).
        ttl: ignore + overwrite entries older than this many seconds (default: never).
        namespace: optional subfolder to bucket entries.
    """
    path = _entry_path(key, dir, namespace)

    if path.exists():
        try:
            entry = json.loads(path.read_text())
            if ttl is None or (time.time() - entry["t"]) < ttl:
                return entry["v"]
        except (json.JSONDecodeError, KeyError, OSError):
            pass  # corrupt entry — regenerate

    value = producer()
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps({"t": time.time(), "v": value}))
    return value


def has(key: Any, *, dir: Optional[Path] = None, ttl: Optional[float] = None,
        namespace: Optional[str] = None) -> bool:
    """True if a (non-expired) entry exists for ``key``."""
    path = _entry_path(key, dir, namespace)
    if not path.exists():
        return False
    if ttl is None:
        return True
    try:
        entry = json.loads(path.read_text())
        return (time.time() - entry["t"]) < ttl
    except (json.JSONDecodeError, KeyError, OSError):
        return False
