import type * as types from './packages/core/src/types.ts'
import { md } from './packages/core/src/utils.ts'
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
- Workspace compatible (deno, pnpm/npm and cargo workspaces)
- Automatic shields.io badges, disableable and extensible
- Cli with \`init\`, \`gen\`, \`validate\` and \`schema\` commands
- \`--check\` mode to keep readmes in sync in CI
- Cross platform`,
    projectDescription: 'Beautiful effortless README generator',
    about: 'Create README that rocks',
    installation: md.code(`deno install @${name}/core`),
    acknowledgments: `
- [Best Readme](https://github.com/othneildrew/Best-README-Template)
- [Badges 4 README](https://github.com/alexandresanlim/Badges4-README.md-Profile)`,
    gettingStarted: 'See screenshot',
    usage: `\`\`\`sh
# Scaffold a readma.config.ts from the local project
deno run -A jsr:@readma/cli init

# Generate the workspace root and member readmes
deno run -A jsr:@readma/cli gen

# Validate the config and its referenced files
deno run -A jsr:@readma/cli validate

# Print the JSON schema of the config for your editor
deno run -A jsr:@readma/cli schema
\`\`\`
Refer to the [docs](${urls.doc}) for the full option list`,
    roadmap: `
- [x] CLI with config file
- [x] Workspace readme generated from known files like \`Cargo.toml\`/\`deno.json\`/\`pnpm-workspace.yml\`
- [x] Github issue template links`,
    contributing:
      'PRs are welcome, check the [code of conduct](https://github.com/elcoosp/readma/blob/master/.github/CODE_OF_CONDUCT.md)',
    '⛑️ Support':
      'Software is still **very early** expect **unexpected breaking changes**',
  },
  template: {
    bugReport: 'bug-report.yml',
    featRequest: 'feature-request.yml',
  },
  backToTop: false,
} as const
export default config
