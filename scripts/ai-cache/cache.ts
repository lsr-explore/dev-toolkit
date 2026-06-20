/**
 * cache.ts — a tiny disk-backed, provider-agnostic response cache.
 *
 * Wrap any async call in `cached(req, producer)`. An identical `req` (by stable
 * hash) short-circuits to the value stored on disk instead of re-running the
 * producer — handy for not re-spending tokens on repeated AI calls during UI dev.
 *
 *   import { cached } from './cache';
 *   const res = await cached(req, () => anthropic.messages.create(req));
 *
 * Zero dependencies (Node built-ins only).
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';

export interface CacheOptions {
  /** Directory for cache entries. Default: $AI_CACHE_DIR or <tmp>/ai-cache. */
  dir?: string;
  /** Ignore (and overwrite) entries older than this many ms. Default: never expire. */
  ttlMs?: number;
  /** Optional subfolder to bucket entries, e.g. per feature. */
  namespace?: string;
}

const DEFAULT_DIR = process.env.AI_CACHE_DIR ?? join(tmpdir(), 'ai-cache');

/** Recursively sort object keys so logically-equal requests serialize identically. */
function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === 'object') {
    return Object.keys(value as Record<string, unknown>)
      .sort()
      .reduce<Record<string, unknown>>((acc, k) => {
        acc[k] = sortKeys((value as Record<string, unknown>)[k]);
        return acc;
      }, {});
  }
  return value;
}

function hashKey(key: unknown): string {
  return createHash('sha256').update(JSON.stringify(sortKeys(key))).digest('hex');
}

function entryPath(key: unknown, opts: CacheOptions): string {
  const dir = opts.dir ?? DEFAULT_DIR;
  const ns = opts.namespace ? `${opts.namespace}/` : '';
  return join(dir, `${ns}${hashKey(key)}.json`);
}

/**
 * Return the cached value for `key`, or run `producer`, store, and return its result.
 * @param key       any JSON-serializable request describing the call
 * @param producer  the (async) work to run on a cache miss
 */
export async function cached<T>(
  key: unknown,
  producer: () => Promise<T> | T,
  opts: CacheOptions = {},
): Promise<T> {
  const file = entryPath(key, opts);

  if (existsSync(file)) {
    try {
      const entry = JSON.parse(readFileSync(file, 'utf8')) as { t: number; v: T };
      if (opts.ttlMs === undefined || Date.now() - entry.t < opts.ttlMs) {
        return entry.v;
      }
    } catch {
      // Corrupt entry — fall through and regenerate.
    }
  }

  const value = await producer();
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify({ t: Date.now(), v: value }));
  return value;
}

/** True if a (non-expired) entry exists for `key`. */
export function has(key: unknown, opts: CacheOptions = {}): boolean {
  const file = entryPath(key, opts);
  if (!existsSync(file)) return false;
  if (opts.ttlMs === undefined) return true;
  try {
    const entry = JSON.parse(readFileSync(file, 'utf8')) as { t: number };
    return Date.now() - entry.t < opts.ttlMs;
  } catch {
    return false;
  }
}
