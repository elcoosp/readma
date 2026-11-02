import * as path from '@std/path'
import { deepmerge } from 'deepmerge-ts'
import {
  installSnippet,
  mdx,
  readme,
  type ReadmeTemplateArgs,
  type WorkspaceMember,
  writeReadme,
} from '@readma/core'
import { loadConfig, validateConfig } from './config.ts'
import { logger, setLogLevel } from './logger.ts'
import { detectWorkspace } from './detect.ts'
/** Options of the `gen` command */
export type GenOptions = {
  /** Project root path, default to the current working directory */
  rootPath?: string
  /** Render but skip the file writes */
  dryRun?: boolean
  /** Print the rendered markdown to stdout instead of writing files */
  stdout?: boolean
  /** Compare the rendered output with the existing files, exit with code 2 when out of sync */
  check?: boolean
  /** Path to the config folder or file, relative to the root path */
  configPath?: string
  /** Only generate the workspace root readme */
  rootOnly?: boolean
  /** Only generate the workspace member readmes */
  membersOnly?: boolean
  /** Only generate the readme of a specific member path */
  member?: string
  /** Skip every network call */
  offline?: boolean
  /** Verbose logging */
  verbose?: boolean
}
/** Result of the `gen` command */
export type GenResult = {
  /** Files written (empty in dry run, stdout and check modes) */
  written: string[]
  /** Rendered contents with their target paths */
  rendered: { path: string; content: string }[]
  /** Paths out of sync in check mode */
  changed: string[]
  /** Whether the command ran in check mode */
  check: boolean
}
/** Custom mdx section overrides found inside a member folder, empty or broken files are skipped */
async function memberMdxSections(
  memberPath: string,
  sectionKeys: string[],
  verbose: boolean,
): Promise<Record<string, string>> {
  const entries = await Promise.all(
    sectionKeys.map(async (sectionName) => {
      const sectionPath = path.join(
        memberPath,
        'readma',
        'sections',
        `${sectionName}.mdx`,
      )
      try {
        const mdxProcessed = await mdx.processFile(sectionPath)
        if (mdxProcessed) {
          logger.debug(`Found custom mdx section at ${sectionPath}`)
          return [sectionName, mdxProcessed] as const
        }
        return undefined
      } catch (error) {
        if (verbose) {
          logger.warn(
            `Could not process ${sectionPath}, falling back to the config value: ${error}`,
          )
        }
        return undefined
      }
    }),
  )
  return Object.fromEntries(
    entries.filter((entry) => entry !== undefined),
  ) as Record<string, string>
}
/** Build the template args of a workspace member readme */
export async function buildMemberArgs(
  config: ReadmeTemplateArgs,
  member: WorkspaceMember,
  language: ReadmeTemplateArgs['language'],
  packageRegistry: ReadmeTemplateArgs['packageRegistry'],
  opts: { verbose?: boolean; absMemberPath?: string } = {},
): Promise<ReadmeTemplateArgs> {
  const mdxSections = await memberMdxSections(
    opts.absMemberPath ?? member.path,
    Object.keys(config.sections),
    opts.verbose ?? false,
  )
  const installation = mdxSections.installation ??
    installSnippet(member.pkgName, language, packageRegistry) ?? ''
  return deepmerge(config, {
    packageRegistry,
    sections: { ...config.sections, ...mdxSections, installation },
    workspaceMember: member,
  }) as ReadmeTemplateArgs
}
/** Installation snippet derived from the config value or the language and registry */
export function resolveInstallation(
  configInstallation: string | undefined,
  pkgName: string,
  language: ReadmeTemplateArgs['language'],
  packageRegistry: ReadmeTemplateArgs['packageRegistry'],
): string {
  return configInstallation ||
    installSnippet(pkgName, language, packageRegistry) ||
    ''
}
/** Root package name derived from the detection files, used for the root installation snippet */
function rootPkgName(
  files: Awaited<ReturnType<typeof detectWorkspace>>['files'],
): string | undefined {
  return files.deno?.name ?? files.rs?.package?.name ?? files.pkgJson?.name
}
/**
 * Run the `gen` command: detect the workspace, build the member and root
 * readme args, then render and optionally write the readmes
 */
export async function runGen(opts: GenOptions = {}): Promise<GenResult> {
  setLogLevel(opts.verbose ? 'debug' : 'info')
  const rootPath = path.resolve(opts.rootPath ?? '.')
  const { args: config } = await loadConfig(
    opts.configPath ? path.resolve(rootPath, opts.configPath) : rootPath,
  )
  validateConfig(config)
  logger.info('Starting readma generation')
  const detection = await detectWorkspace(rootPath, { offline: opts.offline })
  const { language, packageRegistry, members, files } = detection
  logger.debug(`Detected ${language} project with ${packageRegistry} registry`)
  const targets: { args: ReadmeTemplateArgs; absFolderPath: string }[] = []
  const selectedMembers = (members ?? []).filter((member) =>
    opts.member
      ? member.path === opts.member ||
        path.resolve(rootPath, member.path) === path.resolve(opts.member)
      : true
  )
  if (opts.member && selectedMembers.length === 0) {
    throw new Error(`Could not find a workspace member at path ${opts.member}`)
  }
  if (!opts.rootOnly) {
    for (const member of selectedMembers) {
      const absMemberPath = path.resolve(rootPath, member.path)
      const memberArgs = await buildMemberArgs(
        config,
        member,
        language,
        packageRegistry,
        { ...opts, absMemberPath },
      )
      targets.push({ args: memberArgs, absFolderPath: absMemberPath })
    }
  }
  const rootInstallation = resolveInstallation(
    config.sections.installation,
    rootPkgName(files) ?? config.repoName,
    language,
    packageRegistry,
  )
  if (!opts.membersOnly) {
    targets.push({
      args: deepmerge(config, {
        packageRegistry,
        sections: { ...config.sections, installation: rootInstallation },
        root: { members: selectedMembers },
      }) as ReadmeTemplateArgs,
      absFolderPath: rootPath,
    })
  }
  const result: GenResult = {
    written: [],
    rendered: [],
    changed: [],
    check: opts.check ?? false,
  }
  await Promise.all(
    targets.map(async (target) => {
      const readmePath = path.join(target.absFolderPath, 'README.md')
      logger.info(
        `Rendering "${
          target.args.workspaceMember?.pkgName ?? 'workspace root'
        }" readme`,
      )
      const render = () =>
        readme(target.args, { folderPath: target.absFolderPath })
      if (opts.check) {
        const rendered = await render()
        const existing = await Deno.readTextFile(readmePath).catch(() =>
          undefined
        )
        if (existing !== rendered) result.changed.push(readmePath)
        result.rendered.push({ path: readmePath, content: rendered })
        return
      }
      if (opts.stdout || opts.dryRun) {
        const rendered = await render()
        result.rendered.push({ path: readmePath, content: rendered })
        if (opts.stdout) console.log(rendered)
        return
      }
      const rendered = await writeReadme(target.args, {
        folderPath: target.absFolderPath,
      })
      result.written.push(readmePath)
      result.rendered.push({ path: readmePath, content: rendered })
    }),
  )
  if (opts.check && result.changed.length > 0) {
    logger.error(`Readmes out of sync: ${result.changed.join(', ')}`)
  }
  return result
}
