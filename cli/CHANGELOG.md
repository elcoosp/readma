# Changelog
All notable changes to this project will be documented in this file. See [conventional commits](https://www.conventionalcommits.org/) for commit guidelines.

- - -
## cli-0.10.0 - 2024-11-28
#### Bug Fixes
- **(core)** codecov url on workspace member use path - (918b2d6) - *elcoosp*
- workaround nested package json when reading pnpm workspace - (c64c0a1) - elcoosp
- cli vresion & regen readme - (e0b7758) - elcoosp
- use deno add not install to be consistent - (737343c) - elcoosp
- fix issue template not found on workspace member - (41fa88d) - elcoosp
#### Continuous Integration
- add feature-request gh template - (2c04f4d) - elcoosp
- add bug-report template issue - (34a4420) - elcoosp
#### Documentation
- **(documentation)** add pnpm-workspace related limitation section - (6b7bbfa) - *elcoosp*
- fix WorkspaceMember & some join - (2e08d1b) - elcoosp
#### Features
- handle coc in contributing optional section & add dryRun to global options for tests - (b5061d1) - elcoosp
#### Miscellaneous Chores
- version packages - (73518b9) - elcoosp
- fmt - (65761e6) - elcoosp
- fmt - (5562db8) - elcoosp
- add support custom section - (fa3ff5d) - elcoosp
#### Tests
- **(cli)** fix detectLanguage - (cb63dfa) - *elcoosp*
- up snap - (cba1fc4) - elcoosp

- - -

## cli-0.9.0 - 2024-11-26
#### Bug Fixes
- **(*)** missing paren on ternary - (e35fd33) - *elcoosp*
- default ws member description - (71cba1c) - elcoosp
#### Features
- **(*)** allow to not specify installation section in a single rust package case - (552b1bd) - *elcoosp*
- **(*)** fetch jsr meta to get workspace member description - (4677ca6) - *elcoosp*
- **(*)** add features section - (1921956) - *elcoosp*
#### Miscellaneous Chores
- version packages - (990f8b1) - elcoosp

- - -

## cli-0.8.1 - 2024-11-26
#### Bug Fixes
- mv about section - (9420588) - elcoosp
- mssing packageRegistry on main readme for single package - (31930bc) - elcoosp
#### Miscellaneous Chores
- version packages - (489b88a) - elcoosp
- version packages - (2002827) - elcoosp

- - -

## cli-0.8.0 - 2024-11-26
#### Documentation
- up readme - (f05b2c2) - elcoosp
#### Features
- **(*)** allow custom sections & workspace specific mdx files inside readma/sections/* - (02ad5ba) - *elcoosp*
- **(*)** poc mdx-manager module to handle custom sections per workspace member - (ed816f6) - *elcoosp*
#### Miscellaneous Chores
- use single quote - (4996de0) - elcoosp

- - -

## cli-0.7.2 - 2024-11-26
#### Bug Fixes
- **(*)** packages version - (c8a7fb9) - *elcoosp*

- - -

## cli-0.7.1 - 2024-11-26
#### Bug Fixes
- **(*)** packages table with rel links - (7bd169a) - *elcoosp*

- - -

## cli-0.7.0 - 2024-11-26
#### Features
- **(*)** add packages table in root readme - (4584dfb) - *elcoosp*

- - -

## cli-0.6.2 - 2024-11-26
#### Bug Fixes
- **(*)** rm root package.json making deno confused - (486537d) - *elcoosp*

- - -

## cli-0.6.1 - 2024-11-26
#### Bug Fixes
- **(cli,pkg-json)** use npm: specifier - (e580e60) - *elcoosp*

- - -

## cli-0.6.0 - 2024-11-26
#### Bug Fixes
- installation ws override for npm packageRegistry - (adc7550) - elcoosp
#### Documentation
- use @elcoosp-configs/docusaurus - (3e4de96) - elcoosp
#### Features
- add pkg-json package - (ca8e3b7) - elcoosp
- detect package registry & fix deno workspace member pkgName - (3be3e85) - elcoosp
- allow poc reading of pnpm workspace file if it exist, & deduce the packageRegistry from it + retrieve workspace members - (f8488bd) - elcoosp

- - -

## cli-0.5.11 - 2024-11-24
#### Bug Fixes
- **(cli)** deno version bump core in cli - (ac58b11) - *elcoosp*

- - -

## cli-0.5.10 - 2024-11-24
#### Bug Fixes
- **(*)** deno version bump - (de9f55f) - *elcoosp*

- - -

## cli-0.5.9 - 2024-11-24
#### Bug Fixes
- **(*)** test broken caused by license file read + setup rsdoctor - (a890485) - *elcoosp*
- **(cli)** logs - (2d3c694) - *elcoosp*
- **(core)** https://readma.vercel.app/ as doc url - (c48c88f) - *elcoosp*
- rename readReadmaConfig to getReadmaConfig - (b387f91) - elcoosp
#### Miscellaneous Chores
- 0.6.2 - (d42782a) - elcoosp

- - -

## cli-0.5.8 - 2024-11-24
#### Bug Fixes
- **(cli)** bump version - (f8b1d3e) - *elcoosp*

- - -

## cli-0.5.7 - 2024-11-23
#### Bug Fixes
- **(*)** readme - (f419f4c) - *elcoosp*

- - -

## cli-0.5.6 - 2024-11-23
#### Bug Fixes
- **(cli)** deno 0.6.0 - (753d1f5) - *elcoosp*
- **(cli)** core import - (11569fc) - *elcoosp*

- - -

## cli-0.5.5 - 2024-11-22
#### Bug Fixes
- **(cli)** deno pkg version - (37e3870) - *elcoosp*

- - -

## cli-0.5.4 - 2024-11-22
#### Bug Fixes
- **(cli)** opt files.rs.workspace.members - (6c8f7f2) - *elcoosp*

- - -

## cli-0.5.3 - 2024-11-22
#### Bug Fixes
- **(*)** fix rel import inside deno.json - (f599901) - *elcoosp*

- - -

## cli-0.5.2 - 2024-11-22
#### Bug Fixes
- **(*)** fix rel import of core inside cli - (1a4e9fe) - *elcoosp*

- - -

## cli-0.5.1 - 2024-11-22
#### Bug Fixes
- **(cli)** doc - (a53c13a) - *elcoosp*
#### Continuous Integration
- pub cli & update usage readma.config - (19074aa) - elcoosp
#### Miscellaneous Chores
- **(*)** fix deno pkgs version - (b61f767) - *elcoosp*

- - -

## cli-0.5.0 - 2024-11-22
#### Documentation
- **(cli)** add cli jsdoc - (2842e8d) - *elcoosp*
#### Features
- add branch codecov shield - (368a28f) - elcoosp
#### Miscellaneous Chores
- release 2024.11.22 - (7c769a0) - elcoosp
- update versions - (03b1176) - elcoosp
#### Tests
- **(core)** add readReadmaConfig to core & test - (3b6846b) - *elcoosp*

- - -

## cli-0.4.1 - 2024-11-22
#### Bug Fixes
- **(core)** template wording - (284ff84) - *elcoosp*
#### Continuous Integration
- coverage during t task - (779b471) - elcoosp

- - -

## cli-0.4.0 - 2024-11-21
#### Bug Fixes
- **(core)** regen readme - (6f7459b) - *elcoosp*
- **(core)** test markdown upside html - (501bdc0) - *elcoosp*
- **(core)** test markdown inside htmfor logo - (65ce276) - *elcoosp*
#### Features
- **(core)** jsr version shield template - (cf02c28) - *elcoosp*

- - -

## cli-0.3.1 - 2024-11-21
#### Bug Fixes
- **(core)** regen readme & rename ci workflow job - (28ae644) - *elcoosp*

- - -

## cli-0.3.0 - 2024-11-21
#### Bug Fixes
- **(core)** sync deno conf version - (3e0dc90) - *elcoosp*
- **(core)** emojis in template - (34bb9f0) - *elcoosp*
#### Features
- **(cli)** use david/dax - (8c589f6) - *elcoosp*

- - -

## cli-0.2.0 - 2024-11-21
#### Bug Fixes
- **(core)** fix logo path on ws member - (d56c3ca) - *elcoosp*
#### Features
- **(cli)** produce deep merged readma config per workspace member - (b763641) - *elcoosp*
- **(core)** ws member note in template - (6c516dc) - *elcoosp*
#### Miscellaneous Chores
- rm all changelog - (dea9d2a) - elcoosp
- revert changelog fmt add sep --- - (60eb2f3) - elcoosp
- changelog fmt add sep --- - (1c2bb9b) - elcoosp
- fmt changelog - (189d219) - elcoosp

- - -

Changelog generated by [cocogitto](https://github.com/cocogitto/cocogitto).