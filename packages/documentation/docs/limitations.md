---
sidebar_position: 17
title: Limitations
description: Known limitations and current boundaries of Readma.
---

# Limitations

## VCS

For now, Readma assumes your VCS is **GitHub** and will break asset loading
(e.g. logo) on other platforms: raw asset URLs, shields endpoints and issue
template links are all GitHub-shaped.

## Package registries

To get a version shield and an automatic installation section your package
needs to be hosted on one of these registries:

| Registry                      | Support |
| ----------------------------- | ------- |
| [jsr](http://jsr.io)          | ✅      |
| [npm](http://npmjs.com)       | ✅      |
| [crates.io](http://crates.io) | ✅      |

## Mixed workspaces

A repository with both a `deno.json` and a `Cargo.toml` is rejected — only
one language/registry per workspace is supported for now.

## `pnpm-workspace.yaml`

Glob expansion runs at a max depth of 3, and `!` (negated) patterns are not
handled.

## Config file

The config is a TypeScript module imported at runtime by the Deno CLI —
there is no JSON/YAML fallback. Editors autocomplete it through the
`@readma/core` types; serialized configs can be checked with the JSON schema
printed by `readma schema`.

## Root vs member features

- The workspace **root** readme never gets a registry version badge.
- MDX section overrides apply to **members only**.
- `status` (`unreleased` / `early` / `stable`) is accepted but not rendered
  yet.

## Network calls

Without `--offline`, Readma fetches member descriptions from the JSR
registry when they are not set locally, and shields.io images load in the
browser when the readme is viewed. In CI use `gen --check --offline` for a
fully hermetic run.
