import type * as types from './core/types.ts'
import { md } from './core/utils.ts'
const name = 'readma'
const author = 'elcoosp'
const urls = {
  doc: `https://${name}.vercel.app/`,
}
const config: types.ReadmeTemplateArgs = {
  language: 'ts',
  title: 'Readma',
  author,
  githubUsername: author,
  repoName: name,
  xHandle: author,
  domain: 'gmail',
  email: author,
  urls,
  repobeats: '1b12e7ffd13fd2d15772a30e8b0a995976150797',
  images: { screenshot: 'images/screenshot.gif', logo: 'images/logo.png' },
  sections: {
    features: `
- Workspace compatible
- Automatic shields
- Cross platform`,
    projectDescription: 'Beautiful effortless README generator',
    about: 'Create README that rocks',
    installation: md.code(`deno install @${name}/core`),
    acknowledgments: `
- [Best Readme](https://github.com/othneildrew/Best-README-Template)
- [Badges 4 README](https://github.com/alexandresanlim/Badges4-README.md-Profile)`,
    gettingStarted: 'See screenshot',
    roadmap: `
- [x] CLI with config file
- [ ] Auto defaults from known files like Cargo.toml/{deno,package}.json`,
    usage: `🚧 In construction, refer to the [docs](${urls.doc})`,
  },
  template: {
    bugReport: 'bug-report.yml',
    featRequest: 'feature-request.yml',
  },
  backToTop: false,
} as const
export default config
