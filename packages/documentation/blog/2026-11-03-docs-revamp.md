---
title: "Readma 0.6: the documentation gets a revamp"
description: "The documentation website has been rebuilt: complete CLI and config references, recipes, FAQ and a brand-new navy & coral theme."
authors: [elcoosp]
image: /img/social-card.png
hide_table_of_contents: false
tags: [docs, release]
---

The Readma documentation website has been completely rebuilt. What used to be
a single landing page with a short intro is now a full documentation site.

## What's new

- **Complete guides** — [Getting started](/docs/getting-started),
  [workspace detection](/docs/workspace-detection),
  [sections & MDX](/docs/sections) and
  [limitations](/docs/limitations) now cover the full workflow.
- **CLI reference** — every command (`init`, `gen`, `validate`, `schema`)
  with its options, exit codes and CI recipes.
- **Configuration reference** — every field of `ReadmeTemplateArgs`
  documented, plus a dedicated [badges & shields](/docs/config/badges) page.
- **Programmatic API** — render readmes from your own tooling with
  `@readma/core` ([API](/docs/api)).
- **Recipes and FAQ** — copy-paste configs for Deno monorepos, Rust crates,
  badge surgery and GitHub Actions workflows.
- **A new theme** — the site now wears Readma's colors: deep navy and coral,
  derived straight from the logo, with light and dark modes.

<!-- truncate -->

## Why document now?

Readma grew from a template script into a workspace-aware generator with a
CLI, a rendering engine and an MDX pipeline. The features were documented in
the source (100% coverage helps!), but features you can't find don't exist.

The new docs aim to answer three questions quickly:

1. *What does Readma generate for me?* — see the
   [introduction](/docs/intro) and the homepage showcase.
2. *How do I wire it into my project?* — follow the
   [five minutes quick start](/docs/intro#quick-start-five-minutes).
3. *What exactly does option X do?* — the
   [config reference](/docs/config/reference) documents every field.

## Feedback

The docs live in
[`packages/documentation`](https://github.com/elcoosp/readma/tree/main/packages/documentation)
— PRs fixing a typo or clarifying a dark corner are very welcome.
