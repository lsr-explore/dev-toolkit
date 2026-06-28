# HTTP fetch with timeout + retry

A small **HTTP client wrapper** that adds the three things a raw `fetch` /
`urlopen` lacks for talking to flaky networks and rate-limited APIs: a
**per-attempt timeout**, **retry with exponential backoff + jitter**, and a
**typed error** you can branch on. Copy the file for your language into your
project — there is **zero runtime dependency** to install.

It is deliberately **unopinionated about the body**: it hands you back the live
response so you decide how to read it (`.text()` / `.json()` in Node,
`.read()` in Python). Nothing here is tied to a particular API or SDK.

## What it retries (and what it doesn't)

- **Retries** on network errors / timeouts and on retryable status codes:
  **429, 500, 502, 503, 504**.
- **Does not retry** other 4xx (400, 401, 403, 404, …) — those are deterministic
  client errors; retrying just wastes time. Node returns the `Response` as-is;
  Python raises `FetchRetryError` immediately so you can inspect `.status`.
- **Backoff** is exponential with **full jitter** (`random() * base * 2^n`),
  capped per sleep, with a capped retry count — so a thundering herd doesn't all
  retry in lockstep.
- **Respects `Retry-After`** (delta-seconds *or* HTTP-date) when the server sends
  it, overriding the computed backoff for that attempt.
- On final failure it throws/raises a typed error carrying **status** and
  **attempt count**.

> `retries` is the number of retries *after* the first attempt. `retries: 3`
> means up to **4** total requests.

## Node — [`fetch-retry.ts`](./fetch-retry.ts)

Requires **Node 18+** (global `fetch`, `AbortSignal.timeout`).

```ts
import { fetchRetry, FetchRetryError } from './fetch-retry';

try {
  const res = await fetchRetry('https://api.example.com/thing', {
    retries: 3,
    timeoutMs: 5000,
    headers: { accept: 'application/json' },
  });
  if (!res.ok) {
    // a non-retryable 4xx — handle however you like
    throw new Error(`unexpected ${res.status}`);
  }
  const data = await res.json();
} catch (err) {
  if (err instanceof FetchRetryError) {
    console.error(`gave up: status=${err.status}, attempts=${err.attempts}`);
  }
}
```

## Python — [`fetch_retry.py`](./fetch_retry.py)

Stdlib **urllib** only — no `requests`. Python 3.8+.

```python
from fetch_retry import fetch_retry, FetchRetryError

try:
    resp = fetch_retry(
        "https://api.example.com/thing",
        retries=3,
        timeout=5.0,
        headers={"accept": "application/json"},
    )
    data = resp.read().decode()
except FetchRetryError as err:
    print(f"gave up: status={err.status}, attempts={err.attempts}")
```

## Options

| Node (`FetchRetryOptions`) | Python (kwargs) | Default  | Meaning                                  |
| -------------------------- | --------------- | -------- | ---------------------------------------- |
| `retries`                  | `retries`       | `3`      | retries after the first attempt          |
| `timeoutMs`                | `timeout` (sec) | `10_000` / `10.0` | per-attempt timeout            |
| `backoffMs`                | `backoff` (sec) | `300` / `0.3`     | base backoff, doubles each attempt |
| `maxBackoffMs`             | `max_backoff` (sec) | `20_000` / `20.0` | cap on a single backoff sleep |
| `onRetry`                  | `on_retry`      | none     | callback per retry, for logging/metrics  |

The Node version also accepts any standard `fetch` `RequestInit` field (`method`,
`headers`, `body`, a caller `signal`, …). The Python version takes `method`,
`data` (bytes), and `headers`.

## CLI demo

Both files run directly — fetch a URL and print status + byte count:

```bash
npx tsx fetch-retry.ts https://example.com
# ✓ 200 OK — 1256 bytes

python fetch_retry.py https://httpbin.org/status/503
# ✗ Failed after 4 attempt(s): HTTP 503 ... (status=503, attempts=4)
```

> The per-attempt timeout means a single hung connection can't exceed
> `timeoutMs`, but total wall-clock for a call is roughly
> `retries * (timeout + backoff)` in the worst case. Size `retries` and
> `timeout` for your caller's latency budget.
