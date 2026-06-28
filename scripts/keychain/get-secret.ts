/**
 * get-secret.ts — read a secret from the macOS Keychain via the `security` CLI.
 *
 * Zero dependencies: shells out to `security` (macOS only). Convention is a single
 * flat keyring — service `dev-keys`, one account per key name.
 *
 * Library:
 *   import { getSecret } from './get-secret';
 *   const key = getSecret('ANTHROPIC_API_KEY');
 *
 * CLI (verification only — prints just the last 6 chars, not the full secret):
 *   npx tsx get-secret.ts ANTHROPIC_API_KEY [service]
 */
import { execFileSync } from 'node:child_process';

const DEFAULT_SERVICE = 'dev-keys';

/**
 * Return the secret stored under (service, account), or throw if it is not found.
 * @param account  the key name, e.g. 'ANTHROPIC_API_KEY'
 * @param service  the keyring service; defaults to 'dev-keys'
 */
export function getSecret(account: string, service: string = DEFAULT_SERVICE): string {
  try {
    const out = execFileSync(
      'security',
      ['find-generic-password', '-s', service, '-a', account, '-w'],
      { encoding: 'utf8' },
    );
    // `-w` prints the password followed by a trailing newline.
    return out.replace(/\n$/, '');
  } catch {
    throw new Error(
      `Keychain secret not found: service='${service}' account='${account}'. ` +
        `Store it with: security add-generic-password -s ${service} -a ${account} -w`,
    );
  }
}

/** Like getSecret but returns undefined instead of throwing when absent. */
export function tryGetSecret(account: string, service: string = DEFAULT_SERVICE): string | undefined {
  try {
    return getSecret(account, service);
  } catch {
    return undefined;
  }
}

// Run directly: `npx tsx get-secret.ts <ACCOUNT> [service]`
if (import.meta.url === `file://${process.argv[1]}`) {
  const [account, service] = process.argv.slice(2);
  if (!account) {
    console.error('usage: get-secret.ts <ACCOUNT> [service]');
    process.exit(2);
  }
  try {
    const secret = getSecret(account, service);
    // Verification only: print the last 6 characters so you can confirm the key
    // was retrieved without spilling the whole secret to the terminal. Use the
    // library API (getSecret) to obtain the real value in code.
    const svc = service ?? DEFAULT_SERVICE;
    const masked = secret.length > 6 ? `…${secret.slice(-6)}` : '(too short to mask)';
    console.log(`✓ ${account} retrieved from '${svc}' (${masked})`);
  } catch (err) {
    console.error((err as Error).message);
    process.exit(1);
  }
}
