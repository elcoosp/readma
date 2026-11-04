import * as path from '@std/path'
import {
  DEFAULT_CONTENT_DIR,
  findConfigFile,
  idFromFilename,
  parseFrontMatter,
  ReadmaError,
  readOptionalFile,
} from '@readma/core'
import { configIssues, loadConfigFile } from './config.ts'
import { logger } from './logger.ts'
/** Options of the `validate` command */
export type ValidateOptions = {
  /** Path to the config file, relative to the root path */
  configPath?: string
  /** Project root path, default to the current working directory */
  rootPath?: string
}
/** A single validation finding */
export type ValidationIssue = {
  level: 'error' | 'warn'
  message: string
}
/** Result of the `validate` command */
export type ValidationResult = {
  issues: ValidationIssue[]
  /** True when no error level issue was found */
  ok: boolean
}
/** Check that a file exists relative to the config root */
async function checkFile(
  issues: ValidationIssue[],
  rootPath: string,
  filePath: string | undefined,
  label: string,
): Promise<void> {
  if (filePath === undefined) return
  const resolved = path.join(rootPath, filePath)
  const content = await readOptionalFile(resolved)
  if (content === undefined) {
    issues.push({
      level: 'error',
      message: `${label} not found at ${resolved}`,
    })
  }
}
/**
 * Run the `validate` command: check the config data, every file it references
 * (images, issue templates, code of conduct, license) and the content
 * directory (front matter errors, empty sections, duplicate ids).
 */
export async function runValidate(
  opts: ValidateOptions = {},
): Promise<ValidationResult> {
  const rootPath = path.resolve(opts.rootPath ?? '.')
  const issues: ValidationIssue[] = []
  const configPath = opts.configPath
    ? path.resolve(rootPath, opts.configPath)
    : await findConfigFile(rootPath)
  if (!configPath) {
    return {
      issues: [{
        level: 'error',
        message:
          `Could not find a readma config file in ${rootPath}, expected one of readma.yaml, readma.yml, readma.toml, readma.json`,
      }],
      ok: false,
    }
  }
  let config
  try {
    config = await loadConfigFile(configPath)
  } catch (error) {
    return {
      issues: [{
        level: 'error',
        message: error instanceof ReadmaError
          ? error.message
          : `Could not load the config at ${configPath}: ${error}`,
      }],
      ok: false,
    }
  }
  for (const issue of configIssues(config)) {
    issues.push({
      level: 'error',
      message: `${issue.path}: ${issue.message}`,
    })
  }
  await checkFile(issues, rootPath, config.images?.logo, 'Logo image')
  await checkFile(
    issues,
    rootPath,
    config.images?.screenshot,
    'Screenshot image',
  )
  await checkFile(
    issues,
    rootPath,
    config.issueTemplates?.bug === undefined
      ? undefined
      : path.join('.github', 'ISSUE_TEMPLATE', config.issueTemplates.bug),
    'Bug report issue template',
  )
  await checkFile(
    issues,
    rootPath,
    config.issueTemplates?.feature === undefined
      ? undefined
      : path.join('.github', 'ISSUE_TEMPLATE', config.issueTemplates.feature),
    'Feature request issue template',
  )
  await checkFile(issues, rootPath, config.coc, 'Code of conduct file')
  await checkFile(issues, rootPath, config.license?.file, 'License file')
  if (config.license?.id && !config.license?.file) {
    const licenseContent = await readOptionalFile(
      path.join(rootPath, 'LICENSE.txt'),
    )
    if (licenseContent === undefined) {
      issues.push({
        level: 'warn',
        message:
          'No LICENSE.txt found next to the config, pass a license.file field if your license lives elsewhere',
      })
    }
  }
  await checkContentDir(issues, rootPath, config)
  if (issues.length === 0) {
    logger.info(`Config at ${configPath} is valid`)
  }
  return { issues, ok: !issues.some((issue) => issue.level === 'error') }
}
/** Validate the content directory of a config, content is optional */
async function checkContentDir(
  issues: ValidationIssue[],
  rootPath: string,
  config: Parameters<typeof configIssues>[0],
): Promise<void> {
  const explicitDir = config.content?.dir !== undefined
  const contentDir = path.join(
    rootPath,
    config.content?.dir ?? DEFAULT_CONTENT_DIR,
  )
  let entries: string[]
  try {
    entries = (await Array.fromAsync(Deno.readDir(contentDir))).map((entry) =>
      entry.name
    )
  } catch {
    if (explicitDir) {
      issues.push({
        level: 'error',
        message: `Content directory not found at ${contentDir}`,
      })
    }
    return
  }
  const seen = new Map<string, string>()
  for (const name of entries.toSorted()) {
    if (name.endsWith('.mdx')) {
      issues.push({
        level: 'warn',
        message:
          `${contentDir}/${name} is a legacy mdx file, readma v2 only reads .md content files`,
      })
    }
    const parsed = idFromFilename(name)
    if (!parsed) continue
    const already = seen.get(parsed.id)
    if (already !== undefined) {
      issues.push({
        level: 'warn',
        message:
          `Duplicate section id ${parsed.id} from ${name} and ${already}, only ${already} is rendered`,
      })
      continue
    }
    seen.set(parsed.id, name)
  }
  for (const [, name] of seen) {
    const filePath = path.join(contentDir, name)
    const content = await readOptionalFile(filePath)
    if (content === undefined) continue
    try {
      const { body } = parseFrontMatter(content, filePath)
      if (body.trim() === '') {
        issues.push({
          level: 'warn',
          message:
            `Content file ${filePath} is empty, its section will be omitted`,
        })
      }
    } catch (error) {
      issues.push({
        level: 'error',
        message: error instanceof Error ? error.message : String(error),
      })
    }
  }
}
