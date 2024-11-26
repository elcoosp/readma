# Limitations

## Runtime

Need a deno runtime to interpret the configuration file

## VCS

For now, readma assume your vcs is github and will break asset loading (e.g.
logo) on other vcs

## Package registries

To get a version shield your package need to be hosted on one of those registry

| Registry                      | Support |
| ----------------------------- | ------- |
| [jsr](http://jsr.io)          | ✅      |
| [npm](http://npmjs.com)       | ✅      |
| [crates.io](http://crates.io) | ✅      |
