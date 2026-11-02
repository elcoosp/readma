import {
  BUILTIN_SECTION_KEYS,
  getReadmaConfig,
  ReadmaError,
  type ReadmeTemplateArgs,
} from '@readma/core'
/** Loaded readma config */
export type LoadedConfig = {
  args: ReadmeTemplateArgs
  /** Path of the loaded config file */
  path: string
}
/**
 * Load the readma config from the given root folder or file path
 * @param configPath Folder containing a `readma.config.ts` or a direct file path
 */
export async function loadConfig(configPath = '.'): Promise<LoadedConfig> {
  const path = configPath
  const args = await getReadmaConfig(path)
  return { args, path }
}
/** Required fields of {@link ReadmeTemplateArgs} checked by {@link validateConfig} */
export const REQUIRED_SECTION_KEYS = BUILTIN_SECTION_KEYS.filter(
  (sectionKey) => sectionKey !== 'contributing',
)
/** Check that every required config field is present, return the missing ones */
export function missingConfigFields(args: ReadmeTemplateArgs): string[] {
  const missing: string[] = []
  const check = (condition: boolean, name: string) => {
    if (!condition) missing.push(name)
  }
  check(args.language !== undefined, 'language')
  check(args.title !== undefined, 'title')
  check(args.author !== undefined, 'author')
  check(args.githubUsername !== undefined, 'githubUsername')
  check(args.repoName !== undefined, 'repoName')
  check(args.xHandle !== undefined, 'xHandle')
  check(args.domain !== undefined, 'domain')
  check(args.email !== undefined, 'email')
  check(args.backToTop !== undefined, 'backToTop')
  check(args.images?.logo !== undefined, 'images.logo')
  check(args.template?.bugReport !== undefined, 'template.bugReport')
  check(args.template?.featRequest !== undefined, 'template.featRequest')
  for (const sectionKey of REQUIRED_SECTION_KEYS) {
    check(
      typeof args.sections?.[sectionKey] === 'string',
      `sections.${sectionKey}`,
    )
  }
  return missing
}
/** Validate the config, throwing a detailed {@link ReadmaError} when incomplete */
export function validateConfig(args: ReadmeTemplateArgs): void {
  const missing = missingConfigFields(args)
  if (missing.length > 0) {
    throw new ReadmaError(
      `Missing required readma config fields: ${missing.join(', ')}`,
    )
  }
}
