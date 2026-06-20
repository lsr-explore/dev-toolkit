# Keychain secrets

Store API keys in the macOS Keychain instead of `.env` files, and read them at
runtime with the helper in your language of choice. Both helpers shell out to the
built-in `security` CLI, so there is **zero runtime dependency** to install.

Convention used here: a single flat keyring.

- **service** = `lsr-dev-keys` (the same for every key)
- **account** = the key name, e.g. `ANTHROPIC_API_KEY`

## `security` CLI cheatsheet

```bash
# Store a secret (prompts for the value; -w with no arg keeps it off your shell history)
security add-generic-password -s lsr-dev-keys -a ANTHROPIC_API_KEY -w

# Store / overwrite non-interactively (-U updates if it already exists)
security add-generic-password -s lsr-dev-keys -a ANTHROPIC_API_KEY -w 'sk-ant-...' -U

# Retrieve a secret to stdout
security find-generic-password -s lsr-dev-keys -a ANTHROPIC_API_KEY -w

# Delete a secret
security delete-generic-password -s lsr-dev-keys -a ANTHROPIC_API_KEY

# List every account stored under this service (the closest thing to "list mine")
security dump-keychain | grep -A1 '"svce".*"lsr-dev-keys"' | grep '"acct"'
```

> `security dump-keychain` walks the whole login keychain; the grep narrows it to
> accounts filed under `lsr-dev-keys`. There is no first-class "list by service"
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

Both default the service to `lsr-dev-keys`; pass a second argument to override.
