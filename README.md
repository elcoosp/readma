<a id="readme-top"></a>
<!-- PROJECT LOGO -->
<br />
<div align="center">
<a href="https://github.com/elcoosp/readma">
<img src="https://raw.githubusercontent.com/elcoosp/readma/HEAD/images/logo.png" style="max-height: 200px; object-fit: contain;" alt="Logo">
</a>
<h3 align="center">Readma</h3>
<p align="center">
Beautiful effortless README generator<br />
<a href="https://readma.vercel.app/"><strong>Explore the docs »</strong></a>
<br />
<br />
<a href="https://github.com/elcoosp/readma/issues/new?template=bug-report.yml&title=%5BBug%5D%3A+&labels=bug&assignees=elcoosp">Report Bug</a>
·
<a href="https://github.com/elcoosp/readma/issues/new?template=feature-request.yml&title=%5BFeat%5D%3A+&labels=enhancement&assignees=elcoosp">Request Feature</a>
</p>
</div>
[![Codecov][codecov-shield]][codecov-url]
[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stargazers-shield]][stargazers-url]
[![Commit activity][commit-activity-shield]][commit-activity-url]
[![Branch action runs][branch-action-runs-shield]][branch-action-runs-url]
[![Issues][issues-shield]][issues-url]
[![Pull requests][pull-requests-shield]][pull-requests-url]
[![Last commit][last-commit-shield]][last-commit-url]
[![Release][release-shield]][release-url]
[![License][license-shield]][license-url]

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of contents</summary>
  <ol>
   <li><a href="#about">About</a></li>
   <li><a href="#features">Features</a></li>
   <li><a href="#getting-started">Getting started</a></li>
   <li><a href="#installation">Installation</a></li>
   <li><a href="#usage">Usage</a></li>
   <li><a href="#roadmap">Roadmap</a></li>
   <li><a href="#support">Support</a></li>
   <li><a href="#contributing">Contributing</a></li>
   <li><a href="#contact">Contact</a></li>
   <li><a href="#acknowledgments">Acknowledgments</a></li>
   <li><a href="#license">License</a></li>
  </ol>
</details>

## About

Create README that rocks

<img src="https://raw.githubusercontent.com/elcoosp/readma/HEAD/images/screenshot.gif" alt="Product screenshot" />


> [!TIP]
> You are inside the entry point of **readma** workspace, here is a list of available packages

| Package                               | Description                         |
| ------------------------------------- | ----------------------------------- |
| [@readma/core](packages/core)         | Readma core engine                  |
| [@readma/cli](packages/cli)           | Readma command line interface       |
| [@readma/pkg-json](packages/pkg-json) | Typed function to read package.json |

## Features

- Workspace compatible (deno, pnpm/npm and cargo workspaces)
- Automatic shields.io badges, disableable and extensible
- Content files: section bodies live as markdown files inside `readma/`, never
  inside the config
- Cli with `init`, `gen`, `validate` and `schema` commands
- `--check` mode to keep readmes in sync in CI
- Cross platform

## Getting started

The fastest way to try Readma is to run `init` inside your project, it scaffolds
a ready to edit `readma.yaml` and a `readma/` content directory, then follow the
[usage](#usage) steps.

## Installation

```sh
# Run the cli straight from jsr, nothing to install
deno run -A jsr:@readma/cli --help
```

## Usage

```sh
# Scaffold a readma.yaml and a readma/ content directory from the local project
deno run -A jsr:@readma/cli init

# Generate the workspace root and member readmes
deno run -A jsr:@readma/cli gen

# Validate the config and its referenced files
deno run -A jsr:@readma/cli validate

# Print the JSON schema of the config for your editor
deno run -A jsr:@readma/cli schema
```

Refer to the [docs](https://readma.vercel.app) for the full option list

## Roadmap

- [x] Cli with configuration file
- [x] Workspace readme generated from known files like
      `Cargo.toml`/`deno.json`/`pnpm-workspace.yaml`
- [x] Automatic github issue template links
- [x] Content files: section bodies live in markdown files instead of the config
- [x] Check mode for CI pipelines
- [x] Config validation and JSON schema export
- [ ] Multiple registries per package
- [ ] Custom user templates

See the [open issues](https://github.com/elcoosp/readma/issues) for a full list of proposed features (and known issues).

## Support

Software is still **very early** expect **unexpected breaking changes**

## Contributing

PRs are welcome
> [!NOTE]
> Check the [code of conduct](https://github.com/elcoosp/readma/tree/main/.github/CODE_OF_CONDUCT.md)

## Contact

elcoosp - [@elcoosp](https://x.com/elcoosp) - [elcoosp@gmail.com](mailto:elcoosp@gmail.com)

Project Link: [elcoosp/readma](https://github.com/elcoosp/readma)

## Acknowledgments

- [Best Readme](https://github.com/othneildrew/Best-README-Template)
- [Badges 4 README](https://github.com/alexandresanlim/Badges4-README.md-Profile)

## License

<sup> Licensed under <a href="https://github.com/elcoosp/readma/blob/main/LICENSE.txt">MIT license</a></sup>


![Alt](https://repobeats.axiom.co/api/embed/1b12e7ffd13fd2d15772a30e8b0a995976150797.svg "Repobeats analytics image")
<!--MARKDOWN LINKS & IMAGES-->
<!--https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[codecov-shield]: https://img.shields.io/codecov/c/github/elcoosp/readma/main.svg?logo=codecov&logoColor=f5f5f5
[codecov-url]: https://codecov.io/github/elcoosp/readma/tree/main
[contributors-shield]: https://img.shields.io/github/contributors/elcoosp/readma.svg
[contributors-url]: https://github.com/elcoosp/readma/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/elcoosp/readma.svg
[forks-url]: https://github.com/elcoosp/readma/network/members
[stargazers-shield]: https://img.shields.io/github/stars/elcoosp/readma.svg
[stargazers-url]: https://github.com/elcoosp/readma/stargazers
[commit-activity-shield]: https://img.shields.io/github/commit-activity/w/elcoosp/readma.svg
[commit-activity-url]: https://github.com/elcoosp/readma/commits
[branch-action-runs-shield]: https://img.shields.io/github/check-runs/elcoosp/readma/main.svg?logo=githubactions&logoColor=f5f5f5
[branch-action-runs-url]: https://github.com/elcoosp/readma/actions?query=branch%3Amain
[issues-shield]: https://img.shields.io/github/issues/elcoosp/readma.svg
[issues-url]: https://github.com/elcoosp/readma/issues
[pull-requests-shield]: https://img.shields.io/github/issues-pr/elcoosp/readma.svg
[pull-requests-url]: https://github.com/elcoosp/readma/pulls
[last-commit-shield]: https://img.shields.io/github/last-commit/elcoosp/readma/main.svg
[last-commit-url]: https://github.com/elcoosp/readma/commits
[release-shield]: https://img.shields.io/github/v/release/elcoosp/readma.svg
[release-url]: https://github.com/elcoosp/readma/releases
[license-shield]: https://img.shields.io/github/license/elcoosp/readma.svg
[license-url]: https://github.com/elcoosp/readma/blob/main/LICENSE.txt
