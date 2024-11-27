# Limitations

## Runtime

Need a node runtime to interpret the configuration file using
[jiti](https://github.com/unjs/jiti)

## VCS

For now, readma assume your vcs is github and will break asset loading (e.g.
logo) on other vcs

## Package registries

To get a version shield and automatic installation section your package need to
be hosted on one of those registry

| Registry                      | Support |
| ----------------------------- | ------- |
| [jsr](http://jsr.io)          | ✅      |
| [npm](http://npmjs.com)       | ✅      |
| [crates.io](http://crates.io) | ✅      |

## `pnpm-workspace.yml`

Currently glob is executed at a maxDepth of 3, and `!` patterns are not handled