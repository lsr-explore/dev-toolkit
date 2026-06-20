# AI response cache

A tiny **disk-backed cache** for AI API calls. While you iterate on UI, you tend to
re-issue the *same* prompts over and over — each one costs tokens. Wrap the call in
`cached(...)` and an identical request returns instantly from disk, for free, until
you change the request or clear the cache.

It is deliberately **provider-agnostic**: it caches whatever your producer function
returns, keyed on a stable hash of whatever request object you pass. Nothing here is
tied to a particular SDK.

## How the key works

The cache key is a SHA-256 of the request, canonicalized with **sorted object keys**
so logically-identical requests hash the same regardless of property order. Include
in the request object everything that should bust the cache (model, messages,
temperature, max_tokens, …) and nothing that shouldn't (e.g. a request id).

## Node — [`cache.ts`](./cache.ts)

```ts
import { cached } from './cache';

const req = { model: 'claude-opus-4-8', max_tokens: 1024, messages };

const res = await cached(req, () => anthropic.messages.create(req));
// First call hits the API and writes to disk; identical calls read from disk.
```

## Python — [`cache.py`](./cache.py)

```python
from cache import cached

req = {"model": "claude-opus-4-8", "max_tokens": 1024, "messages": messages}

res = cached(req, lambda: client.messages.create(**req))
```

## Options

| Option       | Default                          | Meaning                                   |
| ------------ | -------------------------------- | ----------------------------------------- |
| `dir`        | `$AI_CACHE_DIR` or `<tmp>/ai-cache` | where entries are written                 |
| `ttlMs`/`ttl`| none (never expires)             | ignore + overwrite entries older than this |
| `namespace`  | none                             | subfolder, e.g. per-feature buckets       |

Clear the cache by deleting the directory: `rm -rf "${AI_CACHE_DIR:-$TMPDIR/ai-cache}"`.

> ⚠️ Entries are stored as plain JSON. Don't point the cache dir at anything that
> gets committed, and don't cache responses containing secrets.
