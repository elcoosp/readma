<a id="readme-top"></a>
  <!-- PROJECT LOGO -->
  <br />
  <div align="center">
  <a href="https://github.com/elcoosp/readma">
  <img src="https://raw.githubusercontent.com/elcoosp/readma/HEAD/images/logo.png" style="max-height: 200px; object-fit: contain;" alt="Logo">
  </a>
  <h3 align="center">Readma</h3>
  <h4 align="center">@readma/pkg-json</h4>
  <p align="center">
  Beautiful effortless README generator
  <br />
  <a href="https://readma.vercel.app/"><strong>📖 Explore the docs »</strong></a>
  <br />
  <br />
  <a href="https://github.com/elcoosp/readma">View Demo</a>
  ·
  <a href="https://github.com/elcoosp/readma/issues/new?template=bug-report.yml&title=%5BBug%5D%3A+&labels=bug&assignees=elcoosp">Report Bug</a>
  ·
  <a href="https://github.com/elcoosp/readma/issues/new?template=feature-request.yml&title=%5BFeat%5D%3A+&labels=enhancement&assignees=elcoosp">Request Feature</a>
    </p>
    </div>

> [!NOTE]
> You are inside the **@readma/pkg-json** workspace member package, not the repository entry point
      
[![JSR version][jsr-version-shield]][jsr-version-url]
[![Codecov][codecov-shield]][codecov-url]
[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stargazers-shield]][stargazers-url]
[![Commit activity][commit-activity-shield]][commit-activity-url]
[![Branch action runs][branch-action-runs-shield]][branch-action-runs-url]
[![License][license-shield]][license-url]

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of contents</summary>
  <ol>
   <li><a href="#about-the-project">💡 About the project</a></li>
   <li><a href="#features">✨ Features</a></li>
   <li><a href="#getting-started">🎉 Getting started</a></li>
   <li><a href="#installation">📋 Installation</a></li>
   <li><a href="#usage">🔧 Usage</a></li>
   <li><a href="#roadmap">🚀 Roadmap</a></li>
   <li><a href="#support">⛑️ Support</a></li>
   <li><a href="#contributing">💻 Contributing</a></li>
   <li><a href="#contact">📨 Contact</a></li>
   <li><a href="#acknowledgments">👏 Acknowledgments</a></li>
   <li><a href="#license">📄 License</a></li>
  </ol>
</details>

## 💡 About the project

Create README that rocks

<img src="https://raw.githubusercontent.com/elcoosp/readma/HEAD/images/screenshot.gif" alt="Product screenshot" />

## ✨ Features

- Workspace compatible
- Automatic shields
- Cross platform

## 🎉 Getting started

See screenshot

## 📋 Installation

```sh
deno add @readma/pkg-json
```

## 🔧 Usage

<pre><code class="language-ts">import { loadPkgJson } from &quot;@readma/pkg-json&quot;
const pkg = await loadPkgJson(&quot;package.json&quot;)
</code></pre>

## 🚀 Roadmap

- [x] CLI with config file
- [x] Workspace readme generated from known files like `Cargo.toml`/`deno.json`/`pnpm-workspace.yml`
- [x] Github issue template links

See the [open issues](https://github.com/elcoosp/readma/issues) for a full list of proposed features (and known issues).

## ⛑️ Support

Software is still **very early** expect **unexpected breaking changes**

## 💻 Contributing

Any contributions you make are **greatly appreciated**.

> [!NOTE]
> Check the [code of conduct](https://github.com/elcoosp/readma/tree/main/.github/CODE_OF_CONDUCT.md)

## 📨 Contact

elcoosp - [@elcoosp](https://twitter.com/elcoosp) - [elcoosp@gmail.com](elcoosp@gmail.com)

Project Link: [https://github.com/elcoosp/readma](https://github.com/elcoosp/readma)

## 👏 Acknowledgments

- [Best Readme](https://github.com/othneildrew/Best-README-Template)
- [Badges 4 README](https://github.com/alexandresanlim/Badges4-README.md-Profile)

<!--MARKDOWN LINKS & IMAGES-- >
<!--https://www.markdownguide.org/basic-syntax/#reference-style-links -->
![Alt](https://repobeats.axiom.co/api/embed/1b12e7ffd13fd2d15772a30e8b0a995976150797.svg "Repobeats analytics image")
## 📄 License

<sup> Licensed under <a href="https://github.com/elcoosp/readma/blob/master/LICENSE-MIT">MIT license</a></sup>


[jsr-version-shield]: https://img.shields.io/jsr/v/@readma/pkg-json.svg?style=for-the-badge&logo=jsr&logoColor=f5f5f5
[jsr-version-url]: https://jsr.io/@readma/pkg-json
[codecov-shield]: https://img.shields.io/codecov/c/github/elcoosp/readma/main.svg?style=for-the-badge&logo=codecov&logoColor=f5f5f5
[codecov-url]: https://codecov.io/github/elcoosp/readma/tree/main/packages/pkg-json
[contributors-shield]: https://img.shields.io/github/contributors/elcoosp/readma.svg?style=for-the-badge
[contributors-url]: https://github.com/elcoosp/readma/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/elcoosp/readma.svg?style=for-the-badge
[forks-url]: https://github.com/elcoosp/readma/network/members
[stargazers-shield]: https://img.shields.io/github/stars/elcoosp/readma.svg?style=for-the-badge
[stargazers-url]: https://github.com/elcoosp/readma/stargazers
[commit-activity-shield]: https://img.shields.io/github/commit-activity/w/elcoosp/readma.svg?style=for-the-badge
[commit-activity-url]: https://github.com/elcoosp/readma/commits
[branch-action-runs-shield]: https://img.shields.io/github/check-runs/elcoosp/readma/main.svg?style=for-the-badge&logo=githubactions&logoColor=f5f5f5
[branch-action-runs-url]: https://github.com/elcoosp/readma/actions?query=branch%3Amain
[license-shield]: https://img.shields.io/github/license/elcoosp/readma.svg?style=for-the-badge
[license-url]: https://github.com/elcoosp/readma/blob/master/LICENSE.txt