# Node version pinning

> **Purpose:** Pin Node across a team: `.nvmrc` vs Volta vs Corepack + `engines`.
> **Copy to:** your project root. · **Use when:** pinning Node across dev + CI. · **Related:** [github](../../templates/github)

How to pin Node (and the package manager) so a team — and a pile of git worktrees —
all run the same toolchain. Four mechanisms, three jobs: pin **Node**, pin the
**package manager**, and set an enforced **floor**. They layer; pick the combo that
matches how much you trust the room to read a README.

macOS-first, but everything here is cross-platform (nvm/fnm/Volta/Corepack all run on
Linux + Windows), which matters for CI parity.

## TL;DR recommendation (frontend team)

- **Pin the major in `.nvmrc`** — universal, CI reads it, every Node manager respects it.
- **Pin the package manager via Corepack** (`packageManager` field) — kills "works on
  pnpm 8, breaks on pnpm 9" lockfile churn.
- **Set `engines` as a guardrail** — advisory floor, flipped to enforced in CI.
- Reach for **Volta instead** if manual `nvm use` keeps getting skipped and you want
  auto-switching with zero shell ritual — but standardize on it team-wide, don't mix.

```jsonc
// package.json — the recommended baseline (nvm/fnm + Corepack)
{
  "packageManager": "pnpm@9.12.0",
  "engines": {
    "node": ">=22.0.0",
    "pnpm": ">=9.0.0"
  }
}
```

## The four mechanisms

| Mechanism | Pins | Auto-switch | Lives in | Enforced? |
| --- | --- | --- | --- | --- |
| `.nvmrc` (+ nvm/fnm) | Node | No — manual `nvm use` (fnm can auto) | `.nvmrc` | No |
| Volta | Node **+** pkg mgr | **Yes** — transparent shims | `package.json` (`volta`) | Yes, locally |
| Corepack | pkg mgr only | **Yes** — on pnpm/yarn invocation | `package.json` (`packageManager`) | Yes |
| `engines` | floor for Node/pkg mgr | No | `package.json` (`engines`) | Advisory (enforceable) |

### `.nvmrc` — the lowest common denominator

A one-line file naming the Node version. Read by **nvm**, **fnm**, CI setup actions
(`actions/setup-node` with `node-version-file: .nvmrc`), and most platform installers.
Costs nothing, breaks nothing, works everywhere — that's why it's the floor of any setup.

```bash
nvm use            # nvm: reads .nvmrc, switches (manual, per shell)
fnm use            # fnm: same; add shell hook for auto-switch on cd
```

Pin the **major only** (`22`) unless you have a reason to pin a minor/patch — lets
`nvm install` grab the latest patch (security fixes) without a repo edit. See
[`.nvmrc`](./.nvmrc) in this folder.

**Tradeoff:** plain nvm doesn't auto-switch — you have to remember `nvm use` in every
new shell / worktree, or wire up a `cd` hook. fnm fixes this (`--use-on-cd`) and is much
faster, so prefer fnm if the team is on board.

### Volta — pins the whole toolchain, switches transparently

Volta installs shims for `node`/`npm`/`pnpm`/`yarn` and reads the pin from
`package.json`. `cd` into the repo and `node -v` is already correct — no `use` command,
no shell hook, works the same in every worktree.

```jsonc
// package.json — Volta pins node AND the package manager
{
  "volta": {
    "node": "22.11.0",
    "pnpm": "9.12.0"
  }
}
```

```bash
volta install node@22      # add the toolchain
volta pin node@22.11.0     # writes the volta.node field
volta pin pnpm@9.12.0      # writes the volta.pnpm field
```

**Tradeoff:** auto-switching is the win — nobody runs the wrong Node again. Costs: it
wants an exact version (more pin churn for patch bumps), it's a separate install everyone
needs, and its pin is **Volta-only** — CI and non-Volta teammates ignore the `volta`
field, so still ship a `.nvmrc` for them. Don't run Volta and nvm/fnm in the same shell;
the shims fight.

### Corepack — pins just the package manager

Ships with Node. The `packageManager` field nails the exact pm + version; Corepack
downloads and runs that version on invocation, so everyone gets identical pnpm/yarn
behavior and lockfile format regardless of what they installed globally.

```jsonc
// package.json
{
  "packageManager": "pnpm@9.12.0"
}
```

```bash
corepack enable            # activate the shims (once per machine)
pnpm install               # corepack runs exactly pnpm@9.12.0
```

**Tradeoff:** solves only the package-manager half — pair it with `.nvmrc` or Volta for
Node itself. Wants an exact `name@version` (use a digest for stricter supply-chain
control). Was Node-default-on for a stretch, now opt-in via `corepack enable` again, so
document the enable step. This is the cleanest answer to package-manager-version drift.

### `engines` — the guardrail, not the switcher

Declares the **supported range**. It doesn't install or switch anything — it's a floor
that fails the install when someone's on an unsupported version.

```jsonc
// package.json
{
  "engines": {
    "node": ">=22.0.0",
    "pnpm": ">=9.0.0"
  }
}
```

- **npm:** advisory by default — set `engine-strict=true` in `.npmrc` to make it hard-fail.
- **pnpm:** enforces `engines.node` by default; can auto-download a matching Node with
  `manage-package-manager-versions` / `use-node-version`.
- **yarn:** enforces by default.

**Tradeoff:** a backstop, never the source of truth — it catches a wrong version, it
doesn't *give* you the right one. Use a `>=` floor so you're not rejecting newer patches.

## How they layer

```text
.nvmrc        → Node version, universal + CI-friendly      (everyone reads it)
   +
Corepack      → exact package manager                       (kills pm drift)
   +
engines       → enforced floor, fail-fast guardrail         (CI + engine-strict)
```

or, if you want auto-switching with no shell ritual:

```text
Volta         → Node + package manager, auto-switch         (Volta users)
   +
.nvmrc        → same Node version, for CI + non-Volta folks (redundant but cheap)
   +
engines       → enforced floor                              (guardrail)
```

Rules of thumb:

- **`.nvmrc` is the floor of every setup** — keep it even when using Volta, because CI and
  teammates without your manager still read it. One source of truth for the Node *major*.
- **Don't pin the package manager twice with conflicting versions.** If Volta pins pnpm
  in `volta.pnpm`, let it own that; if you're on Corepack, use `packageManager`. Keep
  `engines.pnpm` as a `>=` floor either way — it won't fight an exact pin.
- **Volta vs. nvm/fnm is an either/or per developer** — both install shims; running both
  in one shell causes the wrong binary to win. Standardize team-wide.

## CI

Make CI read the **same** files so local and CI never diverge:

```yaml
# GitHub Actions
- uses: actions/setup-node@v4
  with:
    node-version-file: '.nvmrc'   # single source of truth for the Node version
- run: corepack enable            # honor the packageManager field
- run: pnpm install --frozen-lockfile
```

`engines` + `engine-strict` (npm) or default enforcement (pnpm/yarn) then fail the CI
install loudly if anything drifts.

## Files in this folder

- [`.nvmrc`](./.nvmrc) — sample, pins Node major `22` (current LTS line). Copy to repo root.
