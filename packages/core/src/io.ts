import * as path from '@std/path'
import { ReadmaError } from './utils.ts'
import type { ReadmeTemplateArgs } from './types.ts'

/** Minimal side effects surface, injectable for tests */
export type ReadmaIo = {
  readTextFile: (filePath: string) => Promise<string>
  cwd: () => string
  runCommand: (
    command: { cmd: string; args: string[]; cwd?: string },
  ) => Promise<{ success: boolean; stdout: string; stderr: string }>
  fetch: typeof fetch
}

/** Default {@link ReadmaIo} backed by Deno APIs */
export const defaultIo: ReadmaIo = {
  readTextFile: (filePath) => Deno.readTextFile(filePath),
  cwd: () => Deno.cwd(),
  runCommand: async ({ cmd, args, cwd }) => {
    const process = new Deno.Command(cmd, {
      args,
      cwd,
      stdout: 'piped',
      stderr: 'piped',
    })
    const { success, stdout, stderr } = await process.output()
    return {
      success,
      stdout: new TextDecoder().decode(stdout),
      stderr: new TextDecoder().decode(stderr),
    }
  },
  fetch: (input, init) => fetch(input, init),
}

/** Current side effects surface, override it with {@link setIo} for tests */
export let io: ReadmaIo = defaultIo

/** Override the side effects surface with a partial one, useful for tests */
export function setIo(overrides: Partial<ReadmaIo>): void {
  io = { ...defaultIo, ...overrides }
}

/** Restore the default side effects surface */
export function resetIo(): void {
  io = defaultIo
}

/** Read a file, return undefined if it does not exist */
export async function readOptionalFile(filePath: string): Promise<
  string | undefined
> {
  try {
    return await io.readTextFile(filePath)
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) return undefined
    throw error
  }
}

/** Candidate license filenames, in detection order */
export const LICENSE_FILENAMES = [
  'LICENSE.txt',
  'LICENSE.md',
  'LICENSE',
  'LICENCE.txt',
  'LICENCE.md',
  'LICENCE',
  'LICENSE-MIT',
] as const

/** Detected license informations */
export type LicenseInfo = {
  /** SPDX license identifier */
  id?: string
  /** License file path relative to the given root path */
  file?: string
}

/** Match a license file content to a SPDX license identifier */
export function matchLicense(content: string): string | undefined {
  const head = content.slice(0, 600).toLowerCase()
  if (head.includes('mit license')) return 'MIT'
  if (head.includes('apache license')) return 'Apache-2.0'
  if (head.includes('mozilla public license')) return 'MPL-2.0'
  if (head.includes('gnu general public license')) return 'GPL-3.0'
  if (head.includes('bsd')) return 'BSD-3-Clause'
  return undefined
}

/** Detect the license file and its SPDX identifier inside the given root path */
export async function detectLicense(rootPath = '.'): Promise<LicenseInfo> {
  for (const filename of LICENSE_FILENAMES) {
    const filePath = path.join(rootPath, filename)
    const content = await readOptionalFile(filePath)
    if (content !== undefined) {
      return { id: matchLicense(content), file: filename }
    }
  }
  return {}
}

/** Detect the current git branch, fallback to `main` */
export async function detectBranch(rootPath = '.'): Promise<string> {
  const envBranch = Deno.env.get('GITHUB_HEAD_REF') ??
    Deno.env.get('GITHUB_REF_NAME')
  if (envBranch) return envBranch
  const result = await io.runCommand({
    cmd: 'git',
    args: ['rev-parse', '--abbrev-ref', 'HEAD'],
    cwd: rootPath,
  })
  const branch = result.stdout.trim()
  return result.success && branch && branch !== 'HEAD' ? branch : 'main'
}

/** Load the `readma.config.ts` file at the given root folder or file path */
export async function getReadmaConfig(
  configPathRoot = '.',
): Promise<ReadmeTemplateArgs> {
  const isFile = configPathRoot.endsWith('.ts')
  const configPath = isFile
    ? path.resolve(io.cwd(), configPathRoot)
    : path.resolve(io.cwd(), configPathRoot, 'readma.config.ts')
  const mod = await import(path.toFileUrl(configPath).href)
  const config = (mod as { default?: ReadmeTemplateArgs }).default
  if (!config) {
    throw new ReadmaError(
      `Expected ${configPath} to default export a readma config`,
    )
  }
  return config
}
