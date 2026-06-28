# bashmarks

> **Purpose:** (personal env) one-letter directory bookmarks.
> **Copy to:** n/a (machine setup) · **Use when:** jumping between unrelated project roots. · **Related:** [worktrees](../../scripts/worktrees)

[bashmarks](https://github.com/huyng/bashmarks) gives you one-letter directory
bookmarks: save the current dir under a name, then jump to it from anywhere.

## Install

```bash
git clone https://github.com/huyng/bashmarks.git
cd bashmarks
make install
```

Then source it from your shell rc (works in zsh too):

```bash
# ~/.zshrc
source ~/.local/bin/bashmarks.sh
```

(`make install` drops `bashmarks.sh` into `~/.local/bin`; adjust the path if you
installed elsewhere.)

## Usage

```bash
s <name>     # save the current directory under <name>
g <name>     # go (cd) to the bookmarked directory
p <name>     # print the bookmarked directory
d <name>     # delete the bookmark
l            # list all bookmarks
```

Tab-completion works on bookmark names after `g`, `p`, and `d`.

## Pairs well with `wt`

`wt` handles *worktrees within a repo*; bashmarks handles *jumping between unrelated
project roots*. Save your common roots once:

```bash
cd ~/dev/next-template/main/next-template && s nt
cd ~/dev/dev-toolkit/main/dev-toolkit      && s tools
# later, from anywhere:
g nt
```
