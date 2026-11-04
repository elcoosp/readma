import * as path from '@std/path'
import {
  DEFAULT_CONTENT_DIR,
  loadContentDir,
  mergeContent,
  type ReadmaConfig,
  readme,
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
  /** Path to the config file, relative to the root path */
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
/** A generation target: a config variant, its content and its output folder */
type GenTarget = {
  config: ReadmaConfig
  content: Awaited<ReturnType<typeof loadContentDir>>
  absFolderPath: string
}
/** Content directory of a package folder, honoring the config override */
function contentDirFor(
  packagePath: string,
  config: ReadmaConfig,
): string {
  return path.join(packagePath, config.content?.dir ?? DEFAULT_CONTENT_DIR)
}
/** Root package name derived from the detection files, used for the root install snippet */
export function rootPkgName(
  files: Awaited<ReturnType<typeof detectWorkspace>>['files'],
): string | undefined {
  return files.deno?.name ?? files.rs?.package?.name ?? files.pkgJson?.name
}
/**
 * Build the config of a workspace member readme: detection values drive the
 * language and registry fields (the cli detection is authoritative) and the
 * member content overrides the root content on id collisions.
 */
export function buildMemberConfig(
  config: ReadmaConfig,
  member: WorkspaceMember,
  language: ReadmaConfig['language'],
  packageRegistry: ReadmaConfig['packageRegistry'],
): ReadmaConfig {
  return {
    ...config,
    language: language ?? config.language,
    packageRegistry: packageRegistry ?? config.packageRegistry,
    workspaceMember: member,
  }
}
/**
 * Run the `gen` command: detect the workspace, load the root and member
 * content directories, then render and optionally write the readmes
 */
export async function runGen(opts: GenOptions = {}): Promise<GenResult> {
  setLogLevel(opts.verbose ? 'debug' : 'info')
  const rootPath = path.resolve(opts.rootPath ?? '.')
  const { config } = await loadConfig(rootPath, opts.configPath)
  validateConfig(config)
  logger.info('Starting readma generation')
  const detection = await detectWorkspace(rootPath, { offline: opts.offline })
  const { language, packageRegistry, members } = detection
  logger.debug(`Detected ${language} project with ${packageRegistry} registry`)
  const rootContent = await loadContentDir(contentDirFor(rootPath, config))
  const targets: GenTarget[] = []
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
      const memberContent = await loadContentDir(
        contentDirFor(absMemberPath, config),
      ).catch((error: unknown) => {
        logger.warn(
          `Could not load the member content of ${member.path}, falling back to the root content: ${error}`,
        )
        return []
      })
      // Installation is package specific: the root installation.md stays on
      // the root readme, members get their own file or the auto snippet.
      const inherited = rootContent.filter((file) => file.id !== 'installation')
      targets.push({
        config: buildMemberConfig(config, member, language, packageRegistry),
        content: mergeContent(inherited, memberContent),
        absFolderPath: absMemberPath,
      })
    }
  }
  if (!opts.membersOnly) {
    targets.push({
      config: {
        ...config,
        language: language ?? config.language,
        packageRegistry: packageRegistry ?? config.packageRegistry,
        pkgName: rootPkgName(detection.files) ?? config.pkgName,
        root: { members: selectedMembers },
      },
      content: rootContent,
      absFolderPath: rootPath,
    })
  }
  const result: GenResult = {
    written: [],
    rendered: [],
    changed: [],
    check: opts.check ?? false,
  }
  for (const target of targets) {
    const readmePath = path.join(target.absFolderPath, 'README.md')
    logger.info(
      `Rendering "${
        target.config.workspaceMember?.pkgName ?? 'workspace root'
      }" readme`,
    )
    const render = () =>
      readme(target.config, {
        folderPath: target.absFolderPath,
        content: target.content,
        workspaceRootPath: rootPath,
      })
    if (opts.check) {
      const rendered = await render()
      const existing = await Deno.readTextFile(readmePath).catch(() =>
        undefined
      )
      if (existing !== rendered) result.changed.push(readmePath)
      result.rendered.push({ path: readmePath, content: rendered })
      continue
    }
    if (opts.stdout || opts.dryRun) {
      const rendered = await render()
      result.rendered.push({ path: readmePath, content: rendered })
      if (opts.stdout) console.log(rendered)
      continue
    }
    const rendered = await writeReadme(target.config, {
      folderPath: target.absFolderPath,
      content: target.content,
      workspaceRootPath: rootPath,
    })
    result.written.push(readmePath)
    result.rendered.push({ path: readmePath, content: rendered })
  }
  if (opts.check && result.changed.length > 0) {
    logger.error(`Readmes out of sync: ${result.changed.join(', ')}`)
  }
  return result
}
