# dev-toolkit

A personal **snippet library** — not a project template. Nothing here is meant to
be cloned as a starting point. Instead, each folder holds a small, self-contained
piece (a script, a config, a cheatsheet) that you **copy into another project** and
adapt. Snippets avoid cross-dependencies on purpose so a single file can be lifted
out cleanly.

## Layout

```
scripts/
  keychain/     Retrieve API keys from the macOS Keychain (TS + Python) + security-CLI cheatsheet
  worktrees/    The `wt` git-worktree helper + install instructions
  ai-cache/     Disk-backed response cache to stop re-spending tokens during UI dev (Node + Python)
config/
  claude-code/  Security-focused Claude Code settings.json + notes
  iterm2/       iTerm2 setup notes
  bashmarks/    bashmarks install + usage
  vscode/       VSCode settings + extensions (incl. Vim)
  biome/        biome.json + "why Biome over Prettier"
templates/
  docs/         Copyable doc scaffolding: project_log + ADR templates (with instructions)
  conventions/  Tooling conventions + per-repo verify checklist + reference configs
docs/
  toolchain.md  Inventory of the tools used in the next-template repo
  references.md External resources: agent skills, package hygiene, TS reference
  backlog.md    Candidate snippet ideas, not yet built
```

## How to use

Browse to the folder you want, read its `README.md`, and copy the file(s) you need
into your target project. Most snippets note any required tweaks at the top of the
file.

## Conventions baked in

- **Keychain**: a single flat keyring, service `dev-keys`, one account per key.
- **Editor/format**: Biome over Prettier; Vim keybindings in VSCode.
- **Terminal**: iTerm2 + zsh, with `bashmarks` for folder jumps and `wt` for worktrees.

## License

[MIT](./LICENSE). Snippets are meant to be copied and adapted freely.
