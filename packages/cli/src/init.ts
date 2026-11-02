import * as path from '@std/path'
import { detectLicense, io, ReadmaError } from '@readma/core'
import { detectWorkspace, type WorkspaceDetection } from './detect.ts'
import { logger } from './logger.ts'
/** Options of the `init` command */
export type InitOptions = {
  /** Overwrite an existing config file */
  force?: boolean
  /** Target config file path, default to `readma.config.ts` inside the root path */
  configPath?: string
  /** Return the config content without writing it */
  dryRun?: boolean
  /** Project root path, default to the current working directory */
  rootPath?: string
}
/** Result of the `init` command */
export type InitResult = {
  /** Path of the config file */
  configPath: string
  /** Generated config content */
  content: string
  /** Whether the file was actually written */
  written: boolean
}
/** Parse a git remote url into a github username and repository name */
export function parseGitRemote(
  remoteUrl: string,
): { username?: string; repoName?: string } {
  const sshMatch = remoteUrl.match(
    /^git@github\.com:(?<username>[^/]+)\/(?<repoName>.+?)(?:\.git)?$/u,
  )
  if (sshMatch?.groups) {
    return {
      username: sshMatch.groups.username,
      repoName: sshMatch.groups.repoName,
    }
  }
  const httpsMatch = remoteUrl.match(
    /^https?:\/\/github\.com\/(?<username>[^/]+)\/(?<repoName>.+?)(?:\.git)?$/u,
  )
  if (httpsMatch?.groups) {
    return {
      username: httpsMatch.groups.username,
      repoName: httpsMatch.groups.repoName,
    }
  }
  return {}
}
/** Derive the github username and repo name from the local git remote */
export async function detectGithubRemote(
  rootPath = '.',
): Promise<{ username?: string; repoName?: string }> {
  try {
    const result = await io.runCommand({
      cmd: 'git',
      args: ['config', '--get', 'remote.origin.url'],
      cwd: rootPath,
    })
    if (!result.success) return {}
    return parseGitRemote(result.stdout.trim())
  } catch {
    return {}
  }
}
/** Generate the content of a `readma.config.ts` file */
export function generateInitConfig(
  detection: WorkspaceDetection,
  detected: {
    username?: string
    repoName?: string
    licenseId?: string
  },
): string {
  const username = detected.username ?? 'your-github-username'
  const repoName = detected.repoName ?? 'your-repo-name'
  return `import type * as types from '@readma/core'

const urls = {
  doc: \`https://github.com/${username}/${repoName}\`,
}

const config: types.ReadmeTemplateArgs = {
  language: '${detection.language}',
  title: '${repoName}',
  author: '${username}',
  githubUsername: '${username}',
  repoName: '${repoName}',
  xHandle: '${username}',
  domain: 'gmail',
  email: '${username}',
  urls,
  images: { logo: 'images/logo.png' },
  sections: {
    features: \`
- Feature one
- Feature two\`,
    projectDescription: 'A short description of your project',
    about: 'Tell more about the project',
    installation: 'Installation instructions',
    acknowledgments: \`
- [Best Readme](https://github.com/othneildrew/Best-README-Template)\`,
    gettingStarted: 'Getting started instructions',
    usage: 'Usage instructions',
    roadmap: \`
- [ ] Roadmap item\`,
  },
  template: {
    bugReport: 'bug-report.yml',
    featRequest: 'feature-request.yml',
  },
  backToTop: true,
  license: '${detected.licenseId ?? 'MIT'}',
  packageRegistry: '${detection.packageRegistry}',
}

export default config
`
}
/**
 * Run the `init` command: scaffold a `readma.config.ts` pre filled with the
 * locally detected git remote, language, registry and license
 */
export async function runInit(
  opts: InitOptions = {},
): Promise<InitResult> {
  const rootPath = path.resolve(opts.rootPath ?? '.')
  const targetPath = opts.configPath
    ? path.resolve(rootPath, opts.configPath)
    : path.join(rootPath, 'readma.config.ts')
  const existing = await Deno.readTextFile(targetPath).then(
    () => true,
    () => false,
  )
  if (existing && !opts.force) {
    throw new ReadmaError(
      `${targetPath} already exists, use the --force flag to overwrite it`,
    )
  }
  const detection = await detectWorkspace(rootPath)
  const gitRemote = await detectGithubRemote(rootPath)
  const license = await detectLicense(rootPath)
  const licenseId = license.id
  const content = generateInitConfig(detection, {
    username: gitRemote.username,
    repoName: gitRemote.repoName,
    licenseId,
  })
  if (!opts.dryRun) {
    await Deno.writeTextFile(targetPath, content)
    logger.info(`Scaffolded ${targetPath}`)
  }
  return { configPath: targetPath, content, written: !opts.dryRun }
}
