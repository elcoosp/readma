import * as path from '@std/path'
import { readOptionalFile } from '@readma/core'
import { loadConfig, missingConfigFields } from './config.ts'
import { logger } from './logger.ts'
/** Options of the `validate` command */
export type ValidateOptions = {
  /** Path to the config folder or file */
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
 * Run the `validate` command: check the config completeness and every file it
 * references (images, issue templates, code of conduct, license)
 */
export async function runValidate(
  opts: ValidateOptions = {},
): Promise<ValidationResult> {
  const rootPath = path.resolve(opts.rootPath ?? '.')
  const { args, path: configPath } = await loadConfig(
    opts.configPath ? path.resolve(rootPath, opts.configPath) : rootPath,
  )
  const issues: ValidationIssue[] = []
  const missing = missingConfigFields(args)
  for (const field of missing) {
    issues.push({
      level: 'error',
      message: `Missing required config field ${field}`,
    })
  }
  await checkFile(issues, rootPath, args.images?.logo, 'Logo image')
  await checkFile(issues, rootPath, args.images?.screenshot, 'Screenshot image')
  await checkFile(
    issues,
    rootPath,
    args.template?.bugReport === undefined
      ? undefined
      : path.join('.github', 'ISSUE_TEMPLATE', args.template.bugReport),
    'Bug report issue template',
  )
  await checkFile(
    issues,
    rootPath,
    args.template?.featRequest === undefined
      ? undefined
      : path.join('.github', 'ISSUE_TEMPLATE', args.template.featRequest),
    'Feature request issue template',
  )
  await checkFile(issues, rootPath, args.coc, 'Code of conduct file')
  await checkFile(issues, rootPath, args.licenseFile, 'License file')
  for (const [key, value] of Object.entries(args.sections ?? {})) {
    if (typeof value === 'string' && value.trim() === '') {
      issues.push({
        level: 'warn',
        message: `Section ${key} is empty, it will be omitted from the readme`,
      })
    }
  }
  if (args.license && !args.licenseFile) {
    const licenseContent = await readOptionalFile(
      path.join(rootPath, 'LICENSE.txt'),
    )
    if (licenseContent === undefined) {
      issues.push({
        level: 'warn',
        message:
          'No LICENSE.txt found next to the config, pass a licenseFile field if your license lives elsewhere',
      })
    }
  }
  if (issues.length === 0) {
    logger.info(`Config at ${configPath} is valid`)
  }
  return { issues, ok: !issues.some((issue) => issue.level === 'error') }
}
