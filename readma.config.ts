import { md } from "./core/utils.ts"
const name = "readma"
const author = "elcoosp"
export default {
  language: "ts",
  title: "Readma",
  author,
  github_username: author,
  repo_name: name,
  x_handle: author,
  domain: "gmail",
  email: author,
  repobeats: "bcfa91e5586a81b65ba4e64a132ce351cacec4b2",
  images: { screenshot: "images/screenshot.gif", logo: "images/logo.png" },
  sections: {
    project_description: "Beautiful effortless README generator",
    about: "Create README that rocks",
    installation: md.code(`deno install ${name}`),
    acknowledgments: `
- [Best Readme](https://github.com/othneildrew/Best-README-Template)
- [Table of content library](https://github.com/a-ahandani/ah-toc)`,
    getting_started: "See screenshot",
    roadmap: `
- [ ] CLI with config file
- [ ] Auto defaults from known files like Cargo.toml/{deno,package}.json`,
    usage: "See `scripts/gen-readme.ts`",
  },
  template: {
    bug_report: "bug-report--from-readme",
    feat_request: "feature-request---from-readme",
  },
  back_to_top: false,
} as const
