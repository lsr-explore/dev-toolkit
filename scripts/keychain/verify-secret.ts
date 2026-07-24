/**
 * verify-secret.ts — confirm a Keychain secret is retrievable AND looks valid.
 *
 * A standalone check you can run before a deploy or after rotating a key. It reads
 * the lookup config from the **environment** (never hard-coded here) so the same
 * script works for any key without edits:
 *
 *   KEYCHAIN_ACCOUNT      required — the key name, e.g. ANTHROPIC_API_KEY
 *   KEYCHAIN_SERVICE      optional — the keyring service (default: dev-keys)
 *   KEYCHAIN_PROVIDER     optional — provider id for the format/live checks
 *                                    (default: inferred from the account name)
 *   KEYCHAIN_KEY_PATTERN  optional — override the format regex (a RegExp source string)
 *
 * Checks run in order; the first failure exits non-zero:
 *   1. retrievable — the secret exists under (service, account)
 *   2. non-empty   — it isn't blank / whitespace
 *   3. format      — matches the expected prefix/shape (only if one is known or given)
 *   4. live        — ONLY with --live: a real provider auth call proves the key works
 *
 * Zero dependencies: Keychain read shells out to `security` (macOS); the live probe
 * uses Node's built-in fetch (Node 18+). The secret value is never printed — only
 * its last 6 characters, for eyeball confirmation.
 *
 *   KEYCHAIN_ACCOUNT=ANTHROPIC_API_KEY npx tsx verify-secret.ts
 *   KEYCHAIN_ACCOUNT=ANTHROPIC_API_KEY npx tsx verify-secret.ts --live
 */
import { getSecret } from './get-secret';

const DEFAULT_SERVICE = 'dev-keys';
const LIVE_TIMEOUT_MS = 10_000;

interface Provider {
  /** Expected shape of the raw secret — a cheap sanity check, not proof of validity. */
  pattern: RegExp;
  /** Build a live auth probe: a request that 200s with a valid key and 401/403s without. */
  live?: (key: string) => { url: string; headers: Record<string, string> };
}

// A small, extend-me registry: one place for both the format check and the optional
// live probe. Add your own providers here. The provider is taken from
// KEYCHAIN_PROVIDER (matched case-insensitively), else inferred from the account name.
const PROVIDERS: Record<string, Provider> = {
  anthropic: {
    pattern: /^sk-ant-/,
    live: (key) => ({
      url: 'https://api.anthropic.com/v1/models',
      headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01' },
    }),
  },
  openai: {
    pattern: /^sk-/,
    live: (key) => ({
      url: 'https://api.openai.com/v1/models',
      headers: { authorization: `Bearer ${key}` },
    }),
  },
};

function inferProvider(account: string): string | undefined {
  const a = account.toLowerCase();
  return Object.keys(PROVIDERS).find((name) => a.includes(name));
}

function mask(secret: string): string {
  return secret.length > 6 ? `…${secret.slice(-6)}` : '(too short to mask)';
}

function fail(message: string): never {
  console.error(`✗ ${message}`);
  process.exit(1);
}

async function probe(url: string, headers: Record<string, string>): Promise<number> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), LIVE_TIMEOUT_MS);
  try {
    const res = await fetch(url, { headers, signal: controller.signal });
    return res.status;
  } finally {
    clearTimeout(timer);
  }
}

async function main(): Promise<void> {
  const live = process.argv.slice(2).includes('--live');

  const account = process.env.KEYCHAIN_ACCOUNT;
  if (!account) {
    console.error('usage: KEYCHAIN_ACCOUNT=<KEY_NAME> npx tsx verify-secret.ts [--live]');
    console.error('  optional env: KEYCHAIN_SERVICE, KEYCHAIN_PROVIDER, KEYCHAIN_KEY_PATTERN');
    process.exit(2);
  }
  const service = process.env.KEYCHAIN_SERVICE ?? DEFAULT_SERVICE;

  // 1. retrievable
  let secret: string;
  try {
    secret = getSecret(account, service);
  } catch (err) {
    fail((err as Error).message);
  }

  // 2. non-empty
  if (secret.trim() === '') {
    fail(`'${account}' is present in '${service}' but empty — re-store it.`);
  }
  console.log(`✓ retrievable — '${account}' from '${service}' (${mask(secret)})`);

  // 3. format
  const providerName = process.env.KEYCHAIN_PROVIDER?.toLowerCase() ?? inferProvider(account);
  const provider = providerName ? PROVIDERS[providerName] : undefined;
  const patternSrc = process.env.KEYCHAIN_KEY_PATTERN;
  const pattern = patternSrc ? new RegExp(patternSrc) : provider?.pattern;
  if (pattern) {
    if (!pattern.test(secret)) {
      fail(`format check failed — value does not match ${pattern}. Wrong key stored?`);
    }
    console.log(`✓ format — matches ${pattern}`);
  } else {
    console.log('• format — not checked (no known pattern; set KEYCHAIN_PROVIDER or KEYCHAIN_KEY_PATTERN)');
  }

  // 4. live (opt-in)
  if (!live) return;
  if (!provider?.live) {
    fail(
      `--live requested but no live probe is defined for provider '${providerName ?? '(unknown)'}'. ` +
        'Add one to the PROVIDERS registry.',
    );
  }
  const { url, headers } = provider.live(secret);
  let status: number;
  try {
    status = await probe(url, headers);
  } catch (err) {
    fail(`live probe could not reach ${url}: ${(err as Error).message}`);
  }
  if (status === 401 || status === 403) {
    fail(`live probe rejected the key (HTTP ${status}) — key is present but not valid.`);
  }
  if (status >= 400) {
    // Not an auth rejection; the key may be fine but the probe endpoint errored.
    console.log(`⚠ live — probe returned HTTP ${status} (not an auth rejection; treat as inconclusive)`);
    return;
  }
  console.log(`✓ live — provider accepted the key (HTTP ${status})`);
}

main().catch((err) => {
  console.error(`✗ ${(err as Error).message}`);
  process.exit(1);
});
