import * as path from '@std/path'
import {
  CONFIG_FILENAMES,
  type ConfigExt,
  configIssues,
  findConfigFile,
  normalizeConfig,
  parseConfigText,
  type ReadmaConfig,
  ReadmaError,
  readOptionalFile,
} from '@readma/core'

export { configIssues } from '@readma/core'
/** Loaded readma config */
export type LoadedConfig = {
  config: ReadmaConfig
  /** Path of the loaded config file */
  path: string
}
/** Extract the config extension of a file path */
export function configExtOf(filePath: string): ConfigExt {
  const ext = path.extname(filePath).slice(1)
  if (ext === 'yaml' || ext === 'yml' || ext === 'toml' || ext === 'json') {
    return ext
  }
  throw new ReadmaError(
    `Unsupported config file ${filePath}, expected one of ${
      CONFIG_FILENAMES.join(', ')
    }`,
  )
}
/** Parse and normalize the config file at the given path */
export async function loadConfigFile(
  filePath: string,
): Promise<ReadmaConfig> {
  const text = await readOptionalFile(filePath)
  if (text === undefined) {
    throw new ReadmaError(`Config file not found at ${filePath}`)
  }
  const raw = parseConfigText(text, configExtOf(filePath))
  return normalizeConfig(raw)
}
/**
 * Load the readma config from the given root folder or file path.
 *
 * Without an explicit `configPath` the config is discovered among
 * `readma.yaml`, `readma.yml`, `readma.toml` and `readma.json`.
 *
 * @param rootPath Project root folder
 * @param configPath Optional config file path, relative to the root path
 */
export async function loadConfig(
  rootPath = '.',
  configPath?: string,
): Promise<LoadedConfig> {
  const resolved = configPath
    ? path.resolve(rootPath, configPath)
    : await findConfigFile(rootPath)
  if (!resolved) {
    throw new ReadmaError(
      `Could not find a readma config file in ${rootPath}, expected one of ${
        CONFIG_FILENAMES.join(', ')
      }`,
    )
  }
  const config = await loadConfigFile(resolved)
  return { config, path: resolved }
}
/** Validate the config, throwing a detailed {@link ReadmaError} when invalid */
export function validateConfig(config: ReadmaConfig): void {
  const issues = configIssues(config)
  if (issues.length > 0) {
    throw new ReadmaError(
      `Invalid readma config:\n${
        issues.map((issue) => `  - ${issue.path}: ${issue.message}`).join('\n')
      }`,
    )
  }
}
