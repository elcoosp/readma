import { md } from "./core/utils.ts";
const name = "readma";
const author = "elcoosp";
export default {
  language: "ts",
  title: "Readma",
  author,
  githubUsername: author,
  repoName: name,
  xHandle: author,
  domain: "gmail",
  email: author,
  repobeats: "1b12e7ffd13fd2d15772a30e8b0a995976150797",
  images: { screenshot: "images/screenshot.gif", logo: "images/logo.png" },
  sections: {
    projectDescription: "Beautiful effortless README generator",
    about: "Create README that rocks",
    installation: md.code(`deno install @${name}/core`),
    acknowledgments: `
- [Best Readme](https://github.com/othneildrew/Best-README-Template)`,
    gettingStarted: "See screenshot",
    roadmap: `
- [ ] CLI with config file
- [ ] Auto defaults from known files like Cargo.toml/{deno,package}.json`,
    usage: "See `scripts/gen-readme.ts`",
  },
  template: {
    bugReport: "bug-report--from-readme",
    featRequest: "feature-request---from-readme",
  },
  backToTop: false,
} as const;
