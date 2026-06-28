// fetch-retry.ts — zero-dependency HTTP fetch with per-attempt timeout,
// retry-with-backoff, and a typed error. Built-ins only.
//
// Runtime requirement: Node 18+ (global `fetch`, `AbortSignal.timeout`).
// No npm dependencies.
//
//   import { fetchRetry, FetchRetryError } from './fetch-retry';
//   const res = await fetchRetry('https://example.com', { retries: 3 });
//
// CLI demo:  npx tsx fetch-retry.ts https://example.com

/** Status codes worth retrying — transient server / rate-limit conditions. */
const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504]);

export interface FetchRetryOptions extends RequestInit {
  /** Max retries *after* the first attempt. Default 3 (so up to 4 requests). */
  retries?: number;
  /** Per-attempt timeout in ms. Default 10_000. */
  timeoutMs?: number;
  /** Base backoff in ms; grows exponentially per attempt. Default 300. */
  backoffMs?: number;
  /** Cap on a single backoff sleep in ms. Default 20_000. */
  maxBackoffMs?: number;
  /** Hook for observing each retry (logging/metrics). */
  onRetry?: (info: { attempt: number; error: Error; delayMs: number }) => void;
}

/** Thrown when every attempt fails. Carries the HTTP status (if any) and count. */
export class FetchRetryError extends Error {
  readonly status?: number;
  readonly attempts: number;
  readonly url: string;
  override readonly cause?: unknown;

  constructor(
    message: string,
    opts: { status?: number; attempts: number; url: string; cause?: unknown },
  ) {
    super(message);
    this.name = 'FetchRetryError';
    this.status = opts.status;
    this.attempts = opts.attempts;
    this.url = opts.url;
    this.cause = opts.cause;
  }
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/**
 * Parse a `Retry-After` header (delta-seconds or HTTP-date) into ms.
 * Returns undefined if absent or unparseable.
 */
function parseRetryAfter(value: string | null): number | undefined {
  if (!value) return undefined;
  const secs = Number(value);
  if (Number.isFinite(secs)) return Math.max(0, secs * 1000);
  const when = Date.parse(value);
  if (!Number.isNaN(when)) return Math.max(0, when - Date.now());
  return undefined;
}

/**
 * fetch() with a per-attempt timeout and exponential backoff + jitter.
 *
 * Retries on network errors and retryable status codes (429, 500, 502, 503,
 * 504), respecting `Retry-After` when present. Does NOT retry other 4xx — those
 * are returned as-is for the caller to handle. On final failure throws
 * {@link FetchRetryError}.
 */
export async function fetchRetry(
  url: string,
  options: FetchRetryOptions = {},
): Promise<Response> {
  const {
    retries = 3,
    timeoutMs = 10_000,
    backoffMs = 300,
    maxBackoffMs = 20_000,
    onRetry,
    signal: callerSignal,
    ...init
  } = options;

  let lastError: Error | undefined;
  let lastStatus: number | undefined;

  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    // Per-attempt timeout, combined with any caller-provided signal.
    const timeoutSignal = AbortSignal.timeout(timeoutMs);
    const signal = callerSignal
      ? AbortSignal.any([callerSignal, timeoutSignal])
      : timeoutSignal;

    let response: Response;
    try {
      response = await fetch(url, { ...init, signal });
    } catch (err) {
      // Network failure or timeout (AbortError). Retry unless caller aborted.
      lastError = err instanceof Error ? err : new Error(String(err));
      if (callerSignal?.aborted) {
        throw new FetchRetryError('Request aborted by caller', {
          attempts: attempt,
          url,
          cause: lastError,
        });
      }
      if (attempt > retries) break;
      const delayMs = backoffWithJitter(attempt, backoffMs, maxBackoffMs);
      onRetry?.({ attempt, error: lastError, delayMs });
      await sleep(delayMs);
      continue;
    }

    if (response.ok || !RETRYABLE_STATUS.has(response.status)) {
      // Success, or a non-retryable status (e.g. 400/401/403/404) — hand back.
      return response;
    }

    // Retryable status code.
    lastStatus = response.status;
    lastError = new Error(`HTTP ${response.status} ${response.statusText}`);
    if (attempt > retries) break;

    const retryAfter = parseRetryAfter(response.headers.get('retry-after'));
    const delayMs =
      retryAfter ?? backoffWithJitter(attempt, backoffMs, maxBackoffMs);
    onRetry?.({ attempt, error: lastError, delayMs });
    // Drain the body so the connection can be reused.
    await response.body?.cancel().catch(() => {});
    await sleep(delayMs);
  }

  throw new FetchRetryError(
    `Failed after ${retries + 1} attempt(s): ${lastError?.message ?? 'unknown error'}`,
    { status: lastStatus, attempts: retries + 1, url, cause: lastError },
  );
}

/** Exponential backoff (base * 2^(attempt-1)) with full jitter, capped. */
function backoffWithJitter(attempt: number, base: number, cap: number): number {
  const exp = Math.min(cap, base * 2 ** (attempt - 1));
  return Math.random() * exp; // full jitter: [0, exp)
}

// --- CLI demo -------------------------------------------------------------
// `npx tsx fetch-retry.ts <url>` — fetches a URL and prints status + size.
if (import.meta.url === `file://${process.argv[1]}`) {
  const url = process.argv[2] ?? 'https://example.com';
  fetchRetry(url, {
    retries: 3,
    onRetry: ({ attempt, error, delayMs }) =>
      console.error(
        `  retry ${attempt} after ${Math.round(delayMs)}ms — ${error.message}`,
      ),
  })
    .then(async (res) => {
      const body = await res.text();
      console.log(`✓ ${res.status} ${res.statusText} — ${body.length} bytes`);
    })
    .catch((err: unknown) => {
      if (err instanceof FetchRetryError) {
        console.error(
          `✗ ${err.message} (status=${err.status ?? 'n/a'}, attempts=${err.attempts})`,
        );
      } else {
        console.error('✗ unexpected error:', err);
      }
      process.exit(1);
    });
}
