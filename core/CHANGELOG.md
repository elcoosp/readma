# Changelog
All notable changes to this project will be documented in this file. See [conventional commits](https://www.conventionalcommits.org/) for commit guidelines.

- - -
## [2.8.0](https://github.com/elcoosp/readma/compare/ed816f65a1889b1d6e2bb2273f0e0266acfe7452..2.8.0) - 2024-11-26
### Package updates
- [cli-0.8.0](cli) bumped to [cli-0.8.0](https://github.com/elcoosp/readma/compare/cli-0.7.2..cli-0.8.0)
- [core-0.10.0](core) bumped to [core-0.10.0](https://github.com/elcoosp/readma/compare/core-0.9.4..core-0.10.0)
### Global changes
#### Features
- **(*)** poc mdx-manager module to handle custom sections per workspace member - ([ed816f6](https://github.com/elcoosp/readma/commit/ed816f65a1889b1d6e2bb2273f0e0266acfe7452)) - [@elcoosp](https://github.com/elcoosp)

- - -

## core-0.9.4 - 2024-11-26
#### Bug Fixes
- **(*)** screenshot src using gh content - (98f65e0) - *elcoosp*
- **(*)** packages table only if at least one root.members - (2f7d7a9) - *elcoosp*
- **(*)** packages table in templates link to folder not just readme - (36d2405) - *elcoosp*
#### Documentation
- up readme - (f05b2c2) - elcoosp

- - -

## core-0.9.3 - 2024-11-26
#### Bug Fixes
- **(*)** packages version - (c8a7fb9) - *elcoosp*

- - -

## core-0.9.2 - 2024-11-26
#### Bug Fixes
- **(*)** packages table with rel links - (7bd169a) - *elcoosp*

- - -

## core-0.9.1 - 2024-11-26
#### Bug Fixes
- **(*)** re jsr shield - (7e8da38) - *elcoosp*
- **(*)** jsr shield - (060a9ed) - *elcoosp*

- - -

## core-0.9.0 - 2024-11-26
#### Features
- **(*)** add packages table in root readme - (4584dfb) - *elcoosp*

- - -

## core-0.8.0 - 2024-11-26
#### Documentation
- use @elcoosp-configs/docusaurus - (3e4de96) - elcoosp
#### Features
- add pkg-json package - (ca8e3b7) - elcoosp
- detect package registry & fix deno workspace member pkgName - (3be3e85) - elcoosp

- - -

## core-0.7.2 - 2024-11-24
#### Bug Fixes
- **(*)** deno version bump - (de9f55f) - *elcoosp*

- - -

## core-0.7.1 - 2024-11-24
#### Bug Fixes
- **(*)** crates version link - (c738b28) - *elcoosp*
- **(*)** test broken caused by license file read + setup rsdoctor - (a890485) - *elcoosp*
- **(cli)** logs - (2d3c694) - *elcoosp*
- **(core)** https://readma.vercel.app/ as doc url - (c48c88f) - *elcoosp*
- **(core)** default domainExt - (a754218) - *elcoosp*
- **(core)** derive licenseSectionBody from LICENSE.txt file - (153e970) - *elcoosp*
- make badgeStyle part of ReadmeTemplateArgs - (d7c8879) - elcoosp
- rename readReadmaConfig to getReadmaConfig - (b387f91) - elcoosp

- - -

## core-0.7.0 - 2024-11-24
#### Features
- **(*)** crates.io version shield - (d21e2fa) - *elcoosp*
#### Miscellaneous Chores
- 0.6.2 - (d42782a) - elcoosp

- - -

## core-0.6.3 - 2024-11-23
#### Bug Fixes
- **(*)** readme - (f419f4c) - *elcoosp*

- - -

## core-0.6.2 - 2024-11-23
#### Bug Fixes
- **(cli)** core import - (11569fc) - *elcoosp*
- **(core)** deno 0.6.1 - (7fed2b6) - *elcoosp*

- - -

## core-0.6.1 - 2024-11-23
#### Bug Fixes
- **(core)** shield license dup - (01cf001) - *elcoosp*
- **(core)** opt screenshot - (dfe1867) - *elcoosp*

- - -

## core-0.6.0 - 2024-11-22
#### Features
- **(core)** add branch & ws handling to codecov shield linkUrll - (32dbecf) - *elcoosp*

- - -

## core-0.5.1 - 2024-11-22
#### Bug Fixes
- **(*)** fix rel import of core inside cli - (1a4e9fe) - *elcoosp*
#### Continuous Integration
- pub cli & update usage readma.config - (19074aa) - elcoosp
#### Documentation
- **(core)** add readme jsdoc - (7a6e3cd) - *elcoosp*
- **(core)** add ReadmeTemplateArgs jsdoc - (b611a0a) - *elcoosp*
#### Miscellaneous Chores
- **(*)** fix deno pkgs version - (b61f767) - *elcoosp*

- - -

## core-0.5.0 - 2024-11-22
#### Bug Fixes
- **(*)** fmt - (a1d1ddd) - *elcoosp*
- **(core)** doc & ret ty on readReadmaConfig - (c8348d5) - *elcoosp*
#### Continuous Integration
- ignore lint fmt for deno_cache - (115a087) - elcoosp
#### Documentation
- **(core)** add shields jsdoc - (f2bbaf9) - *elcoosp*
#### Features
- add branch codecov shield - (368a28f) - elcoosp
#### Miscellaneous Chores
- release 2024.11.22 - (7c769a0) - elcoosp
- update versions - (03b1176) - elcoosp
#### Tests
- **(core)** add readReadmaConfig to core & test - (3b6846b) - *elcoosp*

- - -

## core-0.4.1 - 2024-11-22
#### Bug Fixes
- **(core)** template wording - (284ff84) - *elcoosp*
- **(core)** 0.4.0 - (baa9a25) - *elcoosp*
#### Continuous Integration
- coverage during t task - (779b471) - elcoosp

- - -

## core-0.4.0 - 2024-11-21
#### Bug Fixes
- **(core)** regen readme - (6f7459b) - *elcoosp*
- **(core)** use gh user content to get a static logo src & fix jsr display - (1bbe1c5) - *elcoosp*
- **(core)** add inline style to center logo - (88142e7) - *elcoosp*
- **(core)** test markdown upside html - (501bdc0) - *elcoosp*
- **(core)** test markdown inside htmfor logo - (65ce276) - *elcoosp*
- **(core)** jsr shield - (f0189d6) - *elcoosp*
#### Features
- **(core)** jsr version shield template - (cf02c28) - *elcoosp*

- - -

## core-0.3.1 - 2024-11-21
#### Bug Fixes
- **(core)** regen readme & rename ci workflow job - (28ae644) - *elcoosp*
- **(core)** template contrib update - (9a9491f) - *elcoosp*

- - -

## core-0.3.0 - 2024-11-21
#### Bug Fixes
- **(core)** sync deno conf version - (3e0dc90) - *elcoosp*
- **(core)** emojis in template - (34bb9f0) - *elcoosp*
#### Features
- **(cli)** use david/dax - (8c589f6) - *elcoosp*

- - -

## core-0.2.0 - 2024-11-21
#### Bug Fixes
- **(core)** fix logo path on ws member - (d56c3ca) - *elcoosp*
#### Features
- **(core)** ws member note in template - (6c516dc) - *elcoosp*
- **(core)** render workspaceMember in template - (0b9b1d1) - *elcoosp*
#### Miscellaneous Chores
- rm all changelog - (dea9d2a) - elcoosp
- revert changelog fmt add sep --- - (60eb2f3) - elcoosp
- changelog fmt add sep --- - (1c2bb9b) - elcoosp
- fmt changelog - (189d219) - elcoosp

- - -

Changelog generated by [cocogitto](https://github.com/cocogitto/cocogitto).