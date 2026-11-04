import * as path from '@std/path'
import {
  DEFAULT_CONTENT_DIR,
  detectLicense,
  io,
  ReadmaError,
} from '@readma/core'
import { detectWorkspace, type WorkspaceDetection } from './detect.ts'
import { logger } from './logger.ts'
/** Options of the `init` command */
export type InitOptions = {
  /** Overwrite an existing config file */
  force?: boolean
  /** Target config file path, default to `readma.yaml` inside the root path */
  configPath?: string
  /** Return the scaffold result without writing it */
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
  /** Content starter files: path and body, only written when missing */
  files: { path: string; body: string }[]
  /** Whether the config file was actually written */
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
/** Starter content files scaffolded next to the config */
export const STARTER_CONTENT_FILES: readonly { name: string; body: string }[] =
  [
    {
      name: 'about.md',
      body:
        'A longer introduction to your project, what it does and why it exists.\n',
    },
    {
      name: 'features.md',
      body: '- Feature one\n- Feature two\n- Feature three\n',
    },
    {
      name: 'usage.md',
      body:
        'Run the project with your usual commands, document the main entry points here.\n',
    },
    {
      name: 'roadmap.md',
      body: '- [ ] Roadmap item\n',
    },
  ]
/** Generate the content of a `readma.yaml` file */
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
  const licenseId = detected.licenseId ?? 'MIT'
  return `# Readma configuration, see https://readma.vercel.app for the full reference.
# Every field except title is optional: drop what you do not need.
title: ${repoName}
description: A short description of your project
repo: ${username}/${repoName}
language: ${detection.language}
packageRegistry: ${detection.packageRegistry}
license:
  id: ${licenseId}
`
}
/**
 * Run the `init` command: scaffold a `readma.yaml` pre filled with the
 * locally detected git remote, language, registry and license, plus a
 * `readma/` content directory holding starter markdown files.
 */
export async function runInit(
  opts: InitOptions = {},
): Promise<InitResult> {
  const rootPath = path.resolve(opts.rootPath ?? '.')
  const targetPath = opts.configPath
    ? path.resolve(rootPath, opts.configPath)
    : path.join(rootPath, 'readma.yaml')
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
  const content = generateInitConfig(detection, {
    username: gitRemote.username,
    repoName: gitRemote.repoName,
    licenseId: license.id,
  })
  const contentDir = path.join(rootPath, DEFAULT_CONTENT_DIR)
  const files: InitResult['files'] = []
  for (const starter of STARTER_CONTENT_FILES) {
    const filePath = path.join(contentDir, starter.name)
    const alreadyThere = await Deno.readTextFile(filePath).then(
      () => true,
      () => false,
    )
    if (!alreadyThere) files.push({ path: filePath, body: starter.body })
  }
  if (!opts.dryRun) {
    await Deno.writeTextFile(targetPath, content)
    await Deno.mkdir(contentDir, { recursive: true })
    for (const file of files) await Deno.writeTextFile(file.path, file.body)
    logger.info(`Scaffolded ${targetPath}`)
  }
  return { configPath: targetPath, content, files, written: !opts.dryRun }
}
