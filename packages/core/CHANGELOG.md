# Changelog

## 0.6.15

### Patch Changes

- 05bd86a: Reorganize internal packages to use turbo workspace

## 0.6.14

### Patch Changes

- b68d86c: Setup unified workspace & ci

All notable changes to this project will be documented in this file. See
[conventional commits](https://www.conventionalcommits.org/) for commit
guidelines.

---

## core-0.13.0 - 2024-11-28

#### Bug Fixes

- **(core)** codecov url on workspace member use path - (918b2d6) - _elcoosp_
- workaround nested package json when reading pnpm workspace - (c64c0a1) -
  elcoosp
- cli version & regen readme - (e0b7758) - elcoosp
- use note info does not exist if gfm - (99b5359) - elcoosp
- use deno add not install to be consistent - (737343c) - elcoosp
- fix issue template not found on workspace member - (41fa88d) - elcoosp

#### Continuous Integration

- add bug-report template issue - (34a4420) - elcoosp

#### Documentation

- fix WorkspaceMember & some join - (2e08d1b) - elcoosp
- better type GhIssueTemplateFilename - (00ba324) - elcoosp

#### Features

- handle coc in contributing optional section & add dryRun to global options for
  tests - (b5061d1) - elcoosp
- pass globalOptions to template to be able to read github issue templates from
  the folderPath & use correct links on bug report/feat request - (d965a18) -
  elcoosp

#### Miscellaneous Chores

- version packages - (73518b9) - elcoosp
- fmt - (65761e6) - elcoosp
- version packages - (90d43b3) - elcoosp
- add support custom section - (fa3ff5d) - elcoosp
- setup biome - (4010d3d) - elcoosp
- fmt - (609d209) - elcoosp

#### Tests

- up snap - (3dcab27) - elcoosp
- up snap - (cba1fc4) - elcoosp
- fix core test, do not rely on current README, this should be done in cli test
  which has whole context - (d3b8f2d) - elcoosp
- shields test #12 - (7143b88) - elcoosp

---

## [2.11.0](https://github.com/elcoosp/readma/compare/b5061d1e45b034be0bd6cef4911e6f618a86d4c7..2.11.0) - 2024-11-27

### Package updates

- [cli-0.10.0](cli) bumped to
  [cli-0.10.0](https://github.com/elcoosp/readma/compare/cli-0.9.0..cli-0.10.0)
- [core-0.13.0](core) bumped to
  [core-0.13.0](https://github.com/elcoosp/readma/compare/core-0.12.0..core-0.13.0)

### Global changes

#### Bug Fixes

- **(documentation)** broken link -
  ([a1b72cc](https://github.com/elcoosp/readma/commit/a1b72cc0b6bb0e14c6cc85ab27852192b1ee34e9)) -
  [@elcoosp](https://github.com/elcoosp)
- fix issue template not found on workspace member -
  ([41fa88d](https://github.com/elcoosp/readma/commit/41fa88d225b43bbda7ca7b322b138a83719fe05c)) -
  [@elcoosp](https://github.com/elcoosp)
- use deno add not install to be consistent -
  ([737343c](https://github.com/elcoosp/readma/commit/737343cd4269b96a5d6e81189307a6bb556b9eaf)) -
  [@elcoosp](https://github.com/elcoosp)

#### Continuous Integration

- do not deno lint documentation npm package -
  ([031ceca](https://github.com/elcoosp/readma/commit/031ceca7d3d21555cf3e6fdfc9609fb2d369f9c1)) -
  [@elcoosp](https://github.com/elcoosp)
- add bug-report template issue -
  ([34a4420](https://github.com/elcoosp/readma/commit/34a4420ef34f33281aab57f3db83bb78aa56678c)) -
  [@elcoosp](https://github.com/elcoosp)
- add feature-request gh template -
  ([2c04f4d](https://github.com/elcoosp/readma/commit/2c04f4df4714d457977df0e08ef0b58da48fa5b9)) -
  [@elcoosp](https://github.com/elcoosp)

#### Documentation

- **(documentation)** rename intro docs -
  ([532ba54](https://github.com/elcoosp/readma/commit/532ba543f3dce3e5c55c77254918dce39416256a)) -
  [@elcoosp](https://github.com/elcoosp)
- up readme -
  ([82309dd](https://github.com/elcoosp/readma/commit/82309dd096de8268f08b140be92fa5076e118925)) -
  [@elcoosp](https://github.com/elcoosp)

#### Features

- handle coc in contributing optional section & add dryRun to global options for
  tests -
  ([b5061d1](https://github.com/elcoosp/readma/commit/b5061d1e45b034be0bd6cef4911e6f618a86d4c7)) -
  [@elcoosp](https://github.com/elcoosp)

#### Miscellaneous Chores

- setup biome -
  ([4010d3d](https://github.com/elcoosp/readma/commit/4010d3d16935d9b4d614444cae7bc47bd1bec1b4)) -
  [@elcoosp](https://github.com/elcoosp)
- use biome-deno lefthook config -
  ([d3c4050](https://github.com/elcoosp/readma/commit/d3c40506e770b475e9bb72ee9edc1a99117210c3)) -
  [@elcoosp](https://github.com/elcoosp)
- wrong nl in feat request template -
  ([8d83c85](https://github.com/elcoosp/readma/commit/8d83c85ddf62d9f253b2c69bff33893475736ce5)) -
  [@elcoosp](https://github.com/elcoosp)
- add support custom section -
  ([fa3ff5d](https://github.com/elcoosp/readma/commit/fa3ff5dcaa99d04bfcc116cd288382caec1a7766)) -
  [@elcoosp](https://github.com/elcoosp)

#### Tests

- shields test #12 -
  ([7143b88](https://github.com/elcoosp/readma/commit/7143b88c60bfd00d5ff3770b8d7c44939060673d)) -
  [@elcoosp](https://github.com/elcoosp)

---

## core-0.12.0 - 2024-11-26

#### Bug Fixes

- default ws member description - (71cba1c) - elcoosp

#### Features

- **(\*)** allow to not specify installation section in a single rust package
  case - (552b1bd) - _elcoosp_
- **(\*)** add features section - (1921956) - _elcoosp_

#### Miscellaneous Chores

- version packages - (990f8b1) - elcoosp

---

## core-0.11.1 - 2024-11-26

#### Bug Fixes

- mv about section - (9420588) - elcoosp

#### Miscellaneous Chores

- version packages - (489b88a) - elcoosp

---

## core-0.11.0 - 2024-11-26

#### Documentation

- **(core)** processFile - (33d17c2) - _elcoosp_

#### Features

- **(\*)** use jiti to read config - (32b1a6c) - _elcoosp_

#### Miscellaneous Chores

- version packages - (2002827) - elcoosp

---

## core-0.10.0 - 2024-11-26

#### Features

- **(\*)** allow custom sections & workspace specific mdx files inside
  readma/sections/\* - (02ad5ba) - _elcoosp_
- **(\*)** poc mdx-manager module to handle custom sections per workspace
  member - (ed816f6) - _elcoosp_

#### Miscellaneous Chores

- use single quote - (4996de0) - elcoosp

---

## [2.8.0](https://github.com/elcoosp/readma/compare/ed816f65a1889b1d6e2bb2273f0e0266acfe7452..2.8.0) - 2024-11-26

### Package updates

- [cli-0.8.0](cli) bumped to
  [cli-0.8.0](https://github.com/elcoosp/readma/compare/cli-0.7.2..cli-0.8.0)
- [core-0.10.0](core) bumped to
  [core-0.10.0](https://github.com/elcoosp/readma/compare/core-0.9.4..core-0.10.0)

### Global changes

#### Features

- **(\*)** poc mdx-manager module to handle custom sections per workspace
  member -
  ([ed816f6](https://github.com/elcoosp/readma/commit/ed816f65a1889b1d6e2bb2273f0e0266acfe7452)) -
  [@elcoosp](https://github.com/elcoosp)

---

## core-0.9.4 - 2024-11-26

#### Bug Fixes

- **(\*)** screenshot src using gh content - (98f65e0) - _elcoosp_
- **(\*)** packages table only if at least one root.members - (2f7d7a9) -
  _elcoosp_
- **(\*)** packages table in templates link to folder not just readme -
  (36d2405) - _elcoosp_

#### Documentation

- up readme - (f05b2c2) - elcoosp

---

## core-0.9.3 - 2024-11-26

#### Bug Fixes

- **(\*)** packages version - (c8a7fb9) - _elcoosp_

---

## core-0.9.2 - 2024-11-26

#### Bug Fixes

- **(\*)** packages table with rel links - (7bd169a) - _elcoosp_

---

## core-0.9.1 - 2024-11-26

#### Bug Fixes

- **(\*)** re jsr shield - (7e8da38) - _elcoosp_
- **(\*)** jsr shield - (060a9ed) - _elcoosp_

---

## core-0.9.0 - 2024-11-26

#### Features

- **(\*)** add packages table in root readme - (4584dfb) - _elcoosp_

---

## core-0.8.0 - 2024-11-26

#### Documentation

- use @elcoosp-configs/docusaurus - (3e4de96) - elcoosp

#### Features

- add pkg-json package - (ca8e3b7) - elcoosp
- detect package registry & fix deno workspace member pkgName - (3be3e85) -
  elcoosp

---

## core-0.7.2 - 2024-11-24

#### Bug Fixes

- **(\*)** deno version bump - (de9f55f) - _elcoosp_

---

## core-0.7.1 - 2024-11-24

#### Bug Fixes

- **(\*)** crates version link - (c738b28) - _elcoosp_
- **(\*)** test broken caused by license file read + setup rsdoctor - (a890485) -
  _elcoosp_
- **(cli)** logs - (2d3c694) - _elcoosp_
- **(core)** https://readma.vercel.app/ as doc url - (c48c88f) - _elcoosp_
- **(core)** default domainExt - (a754218) - _elcoosp_
- **(core)** derive licenseSectionBody from LICENSE.txt file - (153e970) -
  _elcoosp_
- make badgeStyle part of ReadmeTemplateArgs - (d7c8879) - elcoosp
- rename readReadmaConfig to getReadmaConfig - (b387f91) - elcoosp

---

## core-0.7.0 - 2024-11-24

#### Features

- **(\*)** crates.io version shield - (d21e2fa) - _elcoosp_

#### Miscellaneous Chores

- 0.6.2 - (d42782a) - elcoosp

---

## core-0.6.3 - 2024-11-23

#### Bug Fixes

- **(\*)** readme - (f419f4c) - _elcoosp_

---

## core-0.6.2 - 2024-11-23

#### Bug Fixes

- **(cli)** core import - (11569fc) - _elcoosp_
- **(core)** deno 0.6.1 - (7fed2b6) - _elcoosp_

---

## core-0.6.1 - 2024-11-23

#### Bug Fixes

- **(core)** shield license dup - (01cf001) - _elcoosp_
- **(core)** opt screenshot - (dfe1867) - _elcoosp_

---

## core-0.6.0 - 2024-11-22

#### Features

- **(core)** add branch & ws handling to codecov shield linkUrll - (32dbecf) -
  _elcoosp_

---

## core-0.5.1 - 2024-11-22

#### Bug Fixes

- **(\*)** fix rel import of core inside cli - (1a4e9fe) - _elcoosp_

#### Continuous Integration

- pub cli & update usage readma.config - (19074aa) - elcoosp

#### Documentation

- **(core)** add readme jsdoc - (7a6e3cd) - _elcoosp_
- **(core)** add ReadmeTemplateArgs jsdoc - (b611a0a) - _elcoosp_

#### Miscellaneous Chores

- **(\*)** fix deno pkgs version - (b61f767) - _elcoosp_

---

## core-0.5.0 - 2024-11-22

#### Bug Fixes

- **(\*)** fmt - (a1d1ddd) - _elcoosp_
- **(core)** doc & ret ty on readReadmaConfig - (c8348d5) - _elcoosp_

#### Continuous Integration

- ignore lint fmt for deno_cache - (115a087) - elcoosp

#### Documentation

- **(core)** add shields jsdoc - (f2bbaf9) - _elcoosp_

#### Features

- add branch codecov shield - (368a28f) - elcoosp

#### Miscellaneous Chores

- release 2024.11.22 - (7c769a0) - elcoosp
- update versions - (03b1176) - elcoosp

#### Tests

- **(core)** add readReadmaConfig to core & test - (3b6846b) - _elcoosp_

---

## core-0.4.1 - 2024-11-22

#### Bug Fixes

- **(core)** template wording - (284ff84) - _elcoosp_
- **(core)** 0.4.0 - (baa9a25) - _elcoosp_

#### Continuous Integration

- coverage during t task - (779b471) - elcoosp

---

## core-0.4.0 - 2024-11-21

#### Bug Fixes

- **(core)** regen readme - (6f7459b) - _elcoosp_
- **(core)** use gh user content to get a static logo src & fix jsr display -
  (1bbe1c5) - _elcoosp_
- **(core)** add inline style to center logo - (88142e7) - _elcoosp_
- **(core)** test markdown upside html - (501bdc0) - _elcoosp_
- **(core)** test markdown inside htmfor logo - (65ce276) - _elcoosp_
- **(core)** jsr shield - (f0189d6) - _elcoosp_

#### Features

- **(core)** jsr version shield template - (cf02c28) - _elcoosp_

---

## core-0.3.1 - 2024-11-21

#### Bug Fixes

- **(core)** regen readme & rename ci workflow job - (28ae644) - _elcoosp_
- **(core)** template contrib update - (9a9491f) - _elcoosp_

---

## core-0.3.0 - 2024-11-21

#### Bug Fixes

- **(core)** sync deno conf version - (3e0dc90) - _elcoosp_
- **(core)** emojis in template - (34bb9f0) - _elcoosp_

#### Features

- **(cli)** use david/dax - (8c589f6) - _elcoosp_

---

## core-0.2.0 - 2024-11-21

#### Bug Fixes

- **(core)** fix logo path on ws member - (d56c3ca) - _elcoosp_

#### Features

- **(core)** ws member note in template - (6c516dc) - _elcoosp_
- **(core)** render workspaceMember in template - (0b9b1d1) - _elcoosp_

#### Miscellaneous Chores

- rm all changelog - (dea9d2a) - elcoosp
- revert changelog fmt add sep --- - (60eb2f3) - elcoosp
- changelog fmt add sep --- - (1c2bb9b) - elcoosp
- fmt changelog - (189d219) - elcoosp

---

Changelog generated by [cocogitto](https://github.com/cocogitto/cocogitto).
