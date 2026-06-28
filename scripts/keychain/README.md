# Keychain secrets

> **Purpose:** Read API keys from the macOS Keychain at runtime instead of `.env`. · **Lang:** TS + Python · **Deps:** none (macOS `security` CLI)
> **Copy to:** your project — keep the filename + this README. · **Use when:** you want secrets off-disk on a dev machine; not Linux CI (inject via env there). · **Related:** [secret-guard](../secret-guard), [claude-code settings](../../config/claude-code)

Store API keys in the macOS Keychain instead of `.env` files, and read them at
runtime with the helper in your language of choice. Both helpers shell out to the
built-in `security` CLI, so there is **zero runtime dependency** to install.

Convention used here: a single flat keyring.

- **service** = `dev-keys` (the same for every key)
- **account** = the key name, e.g. `ANTHROPIC_API_KEY`

## `security` CLI cheatsheet

```bash
# Store a secret (prompts for the value; -w with no arg keeps it off your shell history)
security add-generic-password -s dev-keys -a ANTHROPIC_API_KEY -w

# Store / overwrite non-interactively (-U updates if it already exists)
security add-generic-password -s dev-keys -a ANTHROPIC_API_KEY -w 'sk-ant-...' -U

# Retrieve a secret to stdout
security find-generic-password -s dev-keys -a ANTHROPIC_API_KEY -w

# Delete a secret
security delete-generic-password -s dev-keys -a ANTHROPIC_API_KEY

# List every account stored under this service (the closest thing to "list mine")
security dump-keychain | grep -A1 '"svce".*"dev-keys"' | grep '"acct"'
```

> `security dump-keychain` walks the whole login keychain; the grep narrows it to
> accounts filed under `dev-keys`. There is no first-class "list by service"
> command, so this is the practical recipe.

## Usage

**TypeScript / Node** — see [`get-secret.ts`](./get-secret.ts):

```ts
import { getSecret } from './get-secret';
const apiKey = getSecret('ANTHROPIC_API_KEY');
```

**Python** — see [`get_secret.py`](./get_secret.py):

```python
from get_secret import get_secret
api_key = get_secret("ANTHROPIC_API_KEY")
```

Both default the service to `dev-keys`; pass a second argument to override.

Run either helper directly to **verify** a key is retrievable. To avoid spilling
the secret to your terminal, the CLI prints only the last six characters — use
the library API in code to get the real value:

```bash
python get_secret.py ANTHROPIC_API_KEY
# ✓ ANTHROPIC_API_KEY retrieved from 'dev-keys' (…AbC123)

npx tsx get-secret.ts ANTHROPIC_API_KEY
# ✓ ANTHROPIC_API_KEY retrieved from 'dev-keys' (…AbC123)
```

## Integration guidance

The point of pulling secrets from the Keychain is to keep them out of `.env`
files and off disk. A few patterns below preserve that guarantee — it is easy to
quietly undo it.

### Copy the file as-is, alongside its README

Keep the same file name when you copy the helper into a new project — rename only
on a genuine collision — and keep it as a standalone file rather than folding it
into an existing module. That keeps it easy to spot and to re-sync from this
library later. Copy this `README.md` over too, so the guidance below travels with
the code. Once it's integrated you can of course adapt the code to the project.

### 1. Don't put the secret in the process environment

Read the secret and hand it **directly** to the client that needs it. Do not
assign it back into `process.env` / `os.environ`. Once a secret is in the
environment it leaks into every child process, shows up in `env`, and can land in
crash dumps and logs.

```python
# ❌ anti-pattern — the key is now visible to `env` and every subprocess
import os
os.environ["GOOGLE_API_KEY"] = get_secret("GOOGLE_API_KEY")
agent = Agent(...)            # SDK reads it back out of the environment

# ✅ pass it straight to the client
agent = Agent(..., api_key=get_secret("GOOGLE_API_KEY"))
```

> This bit a recent project: a module using Google's Agent Development Kit
> fetched the key from the Keychain but then set it in the environment so the SDK
> would find it — making it visible to `env`. If an SDK *only* reads from the
> environment, scope the assignment as tightly as possible (set it immediately
> before the call and `del` it after) rather than at module import.

### 2. Keep the lookup config (account + service) out of git

The secret value is in the Keychain — but the **account name** and **service**
used to look it up are still configuration. Don't hardcode them into a committed
source file (e.g. `config.py`). Read them from environment variables and keep
those in a git-ignored file.

```python
# ❌ config.py — gets committed; bakes the lookup into the repo
KEYCHAIN_ACCOUNT = "ACME_PROD_API_KEY"
KEYCHAIN_SERVICE = "dev-keys"

# ✅ read the lookup config from the environment, with sensible defaults
import os
account = os.environ["KEYCHAIN_ACCOUNT"]                  # required, not in git
service = os.environ.get("KEYCHAIN_SERVICE", "dev-keys")  # default is fine to commit
api_key = get_secret(account, service)
```

Put the names in a git-ignored `.env` (loaded by your shell or a dotenv loader),
and commit a [`.env.example`](./.env.example) documenting which variables are
expected — names only, never values:

```bash
# .env.example  (committed — documents the contract)
KEYCHAIN_SERVICE=dev-keys
KEYCHAIN_ACCOUNT=ANTHROPIC_API_KEY
```

```gitignore
# .gitignore
.env
```

### Other guidance

- **Never log or print the value.** Redact it in error messages and avoid
  dumping config objects that hold it. The helpers here put only the *account* and
  *service* in their error text, never the secret.
- **Don't cache it on disk or in long-lived globals.** Fetch at the point of use;
  the `security` call is cheap. A module-level constant holding the plaintext
  defeats the purpose and widens its blast radius.
- **Fail fast and loud.** Use `get_secret` (raises) for required keys so a missing
  secret stops startup with a clear message; reserve `try_get_secret` /
  `tryGetSecret` for genuinely optional ones.
- **This is macOS-only.** `security` does not exist in Linux CI or containers.
  Keep the call behind a small accessor (as here) so CI can inject the secret a
  different way — e.g. fall back to an environment variable provided by your CI
  secret store — without changing call sites.
