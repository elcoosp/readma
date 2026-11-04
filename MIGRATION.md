# Migrating from v1 to v2

Readma v2 is a clean break: the readme text moves out of TypeScript into
markdown files, and the config becomes a declarative data file. Read this guide
and run `readma init` in a scratch folder to see the target layout.

## TL;DR

```text
v1                                 | v2
readma.config.ts                   | readma.yaml (+ readma.yml/.toml/.json)
sections: { features: "- Fast" }   | readma/features.md containing "- Fast"
sections: { "My section": "..." }  | readma/my-section.md (+ front matter title)
sections: { projectDescription }   | description in readma.yaml
section emoji titles               | plain titles, overridable per section
import type * as types from ...    | nothing to import, the config is data
readma/sections/*.mdx overrides    | readma/*.md overrides, plain markdown
```

The CLI commands (`gen`, `init`, `validate`, `schema`) and their flags keep the
same names and behaviour. `--check`, `--dry-run`, `--stdout` and `--offline` are
unchanged.

## Config format

The config is no longer a TypeScript module. Delete `readma.config.ts` and
create a `readma.yaml` (or `readma.yml`, `readma.toml`, `readma.json`) at the
same location. Nothing is executed anymore: the config is parsed, normalized and
validated as data.

```bash
deno run -A jsr:@readma/cli init          # scaffolds the v2 layout
deno run -A jsr:@readma/cli schema > readma.schema.json   # editor integration
```

## Field mapping

| v1 (`readma.config.ts`)                | v2                                                             |
| -------------------------------------- | -------------------------------------------------------------- |
| `language`, `packageRegistry`          | same names, optional — the CLI detection wins                  |
| `title`                                | `title` (still the only required field)                        |
| `sections.projectDescription`          | `description`                                                  |
| `githubUsername` + `repoName`          | `repo: "owner/name"`                                           |
| `urls.repo` / `urls.doc` / `urls.demo` | `links.repo` / `links.doc` / `links.demo`                      |
| `author`                               | `author`                                                       |
| `email` + `domain` + `domainExt`       | `contact.email` (full address, e.g. `me@gmail.com`)            |
| `xHandle`                              | `contact.x` — links now point to `x.com`                       |
| `linkedinUsername`                     | `contact.linkedin`                                             |
| `images.logo`, `images.screenshot`     | `images.logo`, `images.screenshot` (both optional now)         |
| `template.bugReport` / `featRequest`   | `issueTemplates.bug` / `issueTemplates.feature` (optional now) |
| `badgeStyle`                           | `badges.style`                                                 |
| `badges.disabled`, `badges.custom`     | unchanged                                                      |
| `backToTop`                            | `toc.backToTop`                                                |
| `toc.title`, `toc.hide`                | unchanged                                                      |
| `license`, `licenseFile`               | `license.id`, `license.file`                                   |
| `coc`                                  | `coc` (unchanged)                                              |
| `repobeats`                            | `repobeats` (unchanged)                                        |
| `workspaceMember`, `root.members`      | unchanged (CLI managed)                                        |
| `status`                               | removed (it was never used)                                    |

## Sections

Section bodies are markdown files inside the content directory (`readma/` by
default, configurable with `content.dir`):

| v1 section key    | v2 file                     | Notes                                          |
| ----------------- | --------------------------- | ---------------------------------------------- |
| `about`           | `readma/about.md`           |                                                |
| `features`        | `readma/features.md`        |                                                |
| `gettingStarted`  | `readma/getting-started.md` | kebab-case file name                           |
| `installation`    | `readma/installation.md`    | auto-generated when absent                     |
| `usage`           | `readma/usage.md`           |                                                |
| `roadmap`         | `readma/roadmap.md`         |                                                |
| `contributing`    | `readma/contributing.md`    | default text when only a CoC exists            |
| `acknowledgments` | `readma/acknowledgments.md` |                                                |
| any custom key    | `readma/<id>.md`            | front matter `title` replaces the key-as-title |

Front matter and numeric prefixes replace the v1 positional rules:

```md
---
title: My section title
order: 30
---

Section body.
```

- Builtin sections no longer require titles with pictographs — the defaults are
  plain (`About`, `Features`, `Usage`...), overridable per file or via the
  `sections` config map.
- Empty v1 strings (`installation: ""`) become simply: no file.
- Custom sections can now be positioned anywhere with `order` or a `20-` file
  name prefix; they are no longer stuck between roadmap and contributing.

## Member overrides

The `readma/sections/*.mdx` convention is replaced by a plain `readma/`
directory per member package, containing regular `.md` files:

```text
v1: packages/core/readma/sections/features.mdx
v2: packages/core/readma/features.md
```

v1 could only override section keys already present in the config; v2 members
can override any builtin section and add their own custom sections.

## Programmatic API

The `@readma/core` signature changed:

| v1                                 | v2                                                                |
| ---------------------------------- | ----------------------------------------------------------------- |
| `readme(args: ReadmeTemplateArgs)` | `readme(config: ReadmaConfig, options?)`                          |
| sections passed as strings in args | content loaded from a directory or injected via `options.content` |
| `getReadmaConfig()` (TS import)    | `loadConfigFile()` / `parseConfigText()` / `normalizeConfig()`    |
| `mdx.processFile()`                | removed (plain markdown passthrough)                              |
| `missingConfigFields()` in the CLI | `configIssues()` returning `{ path, message }`                    |

## Validation

`readma validate` no longer requires a fixed set of fields — everything except
`title` is optional. It now also checks the content directory: front matter
parse errors (error), empty files (warning), duplicate section ids (warning) and
leftover `.mdx` files (warning).

## Generated output

- Section titles are plain text; no pictographs are emitted anywhere.
- The license section link follows the detected branch instead of the hard-coded
  `master`.
- The contact email is a real `mailto:` link and X links point to `x.com`.
- Header links ("Explore the docs", "View Demo") only render when their url is
  configured.
