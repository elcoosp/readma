<div align="center">
  <img src="docs/logo.png" alt="Readma Logo" width="300"/>
  <p>
    <strong>A beautiful, effortless README generator for modern workspaces.</strong><br/>
    Automatically generates comprehensive, well-structured README files from known project files like <code>deno.json</code>, <code>Cargo.toml</code>, or <code>pnpm-workspace.yaml</code>. 
    Features workspace compatibility, automatic shields, and cross-platform support.
  </p>
  <p>
    <img src="https://img.shields.io/badge/Deno-2.0%2B-000000?style=flat-square&logo=deno" alt="Deno"/>
    <img src="https://img.shields.io/badge/TypeScript-5.0%2B-3178C6?style=flat-square&logo=typescript" alt="TypeScript"/>
    <img src="https://img.shields.io/badge/License-MIT-blue?style=flat-square" alt="License MIT"/>
    <img src="https://img.shields.io/badge/Workspace-pnpm%20%7C%20Deno-orange?style=flat-square" alt="Workspace"/>
    <img src="https://img.shields.io/badge/Features-Auto%20Shields%20%7C%20Cross--platform-brightgreen?style=flat-square" alt="Features"/>
  </p>
</div>

---

## About the Project

**Readma** is a workspace-compatible documentation generator designed to make README creation effortless. Instead of manually writing and updating documentation, Readma parses your existing project configuration files and automatically generates a standardized, informative README complete with dynamic badges and relevant links.


<img src="https://raw.githubusercontent.com/elcoosp/readma/HEAD/images/screenshot.gif" alt="Product screenshot" />

> [!NOTE]
> This repository serves as the entry point for the Readma monorepo. It is structured as a workspace containing multiple focused packages.

### Workspace Packages

| Package | Description |
| :--- | :--- |
| `@readma/core` | The core engine responsible for parsing project files and generating README content. |
| `@readma/cli` | The command-line interface to easily run and configure the README generation process. |
| `@readma/pkg-json` | A typed utility function to safely read and parse `package.json` files. |

---

## Features

- **Workspace Compatible**: Seamlessly integrates with monorepos and workspaces (Deno, pnpm, Cargo).
- **Automatic Shields**: Dynamically generates relevant badges (e.g., language, license, build status) based on your project files.
- **Cross-Platform**: Built with Deno and TypeScript to run consistently across all major operating systems.
- **Configurable**: Supports custom configuration files to tailor the output to your project's specific needs.

---

## Getting Started

### Prerequisites

Ensure you have [Deno](https://deno.com/) installed on your machine. Readma requires Deno 2.0 or higher.

### Installation

You can add the tools directly to your project's dependencies:

```bash
# Add the CLI to your project
deno add @readma/cli

# Or add the core package if you are building a custom integration
deno add @readma/core
```

### Usage

Run the generation task directly using Deno:

```bash
# Generate README for the current workspace using the predefined task
deno task r

# Or run the CLI module directly with all permissions
deno run -A packages/cli/src/mod.ts gen
```

> [!WARNING]
> The project is still in its early stages. While the core functionality is operational, you may encounter unexpected breaking changes as the API stabilizes.

---

## Roadmap

- [x] CLI with configuration file support
- [x] Workspace README generation from known files (`Cargo.toml`, `deno.json`, `pnpm-workspace.yaml`)
- [x] Automatic GitHub issue template links
- [ ] Comprehensive documentation and usage examples
- [ ] Support for additional project file formats

---

## Acknowledgments

- [Best README Template](https://github.com/othneildrew/Best-README-Template) for structural inspiration.
- [Badges 4 README](https://github.com/alexandresanlim/Badges4-README.md-Profile) for badge resources.
