import {
  readWorkspaceManifest,
  type WorkspaceManifest,
} from '@pnpm/workspace.read-manifest'
import { expandGlob } from '@std/fs'
import * as jsonc from '@std/jsonc'
import * as path from '@std/path'
import * as toml from '@std/toml'
import {
  fetchJsonDescription,
  type PackageRegistry,
  ReadmaError,
  readOptionalFile,
  type SourceLanguage,
  type WorkspaceMember,
} from '@readma/core'
import { loadPkgJson } from '@readma/pkg-json'
/** Subset of a deno config file used for workspace detection */
export type DenoFile = {
  workspace?: string[]
  name?: string
  description?: string
}
/** Subset of a cargo manifest used for workspace detection */
export type CargoFile = {
  workspace?: { members?: string[] }
  package?: { description?: string; name?: string }
}
/** Workspace detection options */
export type DetectOptions = {
  /** Skip every network call, descriptions default to `-` */
  offline?: boolean
  /** Injected fetch, default to globalThis fetch */
  fetchFn?: typeof fetch
  /** Scope used to fallback jsr package names, default to `readma` */
  repoScope?: string
}
/** Result of the workspace detection */
export type WorkspaceDetection = {
  language: SourceLanguage
  packageRegistry: PackageRegistry
  files: {
    deno?: DenoFile
    rs?: CargoFile
    pnpm?: WorkspaceManifest
    pkgJson?: PackageJsonLike
  }
  members?: WorkspaceMember[]
}
/** Minimal package.json like type, see {@link PackageJson} */
export type PackageJsonLike = {
  name?: string
  description?: string
  private?: boolean
}
const DENO_FILENAMES = ['deno.jsonc', 'deno.json'] as const
/** Parse the first matching configuration file among the given filenames */
async function parseFirstFile<T>(
  rootPath: string,
  filenames: readonly string[],
): Promise<T | undefined> {
  for (const filename of filenames) {
    const fileContent = await readOptionalFile(path.join(rootPath, filename))
    if (fileContent !== undefined) {
      const ext = path.extname(filename).slice(1)
      const parserMap = {
        json: JSON.parse,
        jsonc: jsonc.parse,
        toml: toml.parse,
      } as const
      const parser = parserMap[ext as keyof typeof parserMap]
      return parser(fileContent) as T
    }
  }
  return undefined
}
/** Derive the folder name of a given path */
export const getFolderName = (x: string): string =>
  x.split('/').findLast(Boolean) ?? x
/** Detect the workspace members of a deno workspace */
export async function denoMembers(
  rootPath: string,
  denoFile: DenoFile,
  repoScope: string,
  options: DetectOptions = {},
): Promise<WorkspaceMember[]> {
  const pathByKey = new Map<string, string>()
  for (const entry of denoFile.workspace ?? []) {
    if (entry.includes('*')) {
      for await (
        const file of expandGlob(
          path.join(rootPath, entry, 'deno.{json,jsonc}'),
          { exclude: ['**/node_modules/**'] },
        )
      ) {
        const resolved = path.resolve(path.dirname(file.path))
        if (!pathByKey.has(resolved)) {
          pathByKey.set(resolved, path.relative(rootPath, resolved))
        }
      }
    } else {
      const resolved = path.resolve(path.join(rootPath, entry))
      if (!pathByKey.has(resolved)) {
        pathByKey.set(resolved, path.relative(rootPath, resolved))
      }
    }
  }
  return await Promise.all(
    [...pathByKey.entries()].map(async ([resolved, relativePath]) => {
      const memberFile = await parseFirstFile<DenoFile>(
        resolved,
        DENO_FILENAMES,
      )
      const pkgName = memberFile?.name ??
        `@${repoScope}/${getFolderName(relativePath)}`
      const localDescription = memberFile?.description
      const description = localDescription ??
        (await fetchJsonDescription(
          `https://npm.jsr.io/@jsr/${
            pkgName.replace(/^@/u, '').replace('/', '__')
          }`,
          options.offline ?? false,
          options.fetchFn,
        )) ?? '-'
      return { path: relativePath, pkgName, description }
    }),
  )
}
/** Detect the workspace members of a pnpm (or npm) workspace */
export async function pnpmMembers(
  rootPath: string,
  manifest: WorkspaceManifest,
): Promise<WorkspaceMember[]> {
  const members: WorkspaceMember[] = []
  for (const pkgsGlob of manifest.packages) {
    for await (
      const file of expandGlob(path.join(rootPath, pkgsGlob, 'package.json'), {
        exclude: ['**/node_modules/**'],
      })
    ) {
      const memberPath = path.relative(
        rootPath,
        path.resolve(path.dirname(file.path)),
      )
      const pkg = await loadPkgJson(path.join(rootPath, memberPath))
      members.push({
        path: memberPath,
        pkgName: pkg.name ?? getFolderName(memberPath),
        description: pkg.description ?? '-',
      })
    }
  }
  return members
}
/** Detect the workspace members of a cargo workspace */
export async function cargoMembers(
  rootPath: string,
  cargoFile: CargoFile,
): Promise<WorkspaceMember[]> {
  const members = cargoFile.workspace?.members ?? []
  return await Promise.all(
    members.map(async (memberRelativePath) => {
      const memberPath = path.join(rootPath, memberRelativePath)
      const memberFile = await parseFirstFile<CargoFile>(
        memberPath,
        ['Cargo.toml'],
      )
      return {
        path: memberPath,
        pkgName: memberFile?.package?.name ??
          getFolderName(memberRelativePath),
        description: memberFile?.package?.description ?? '-',
      }
    }),
  )
}

/** Derive the package registry from the detected ecosystem files */
function registryFor(
  hasDenoFiles: boolean,
  pnpmManifest: WorkspaceManifest | undefined,
  rootPkgJson: PackageJsonLike | undefined,
): PackageRegistry {
  if (hasDenoFiles) return 'jsr'
  if (pnpmManifest !== undefined || rootPkgJson !== undefined) return 'npm'
  return 'crates.io'
}

/** Detect the workspace members matching the detected registry */
async function detectMembers(detection: {
  packageRegistry: PackageRegistry
  rootPath: string
  rsFile?: CargoFile
  denoFile?: DenoFile
  pnpmManifest?: WorkspaceManifest
  options: DetectOptions
}): Promise<WorkspaceMember[] | undefined> {
  if (detection.packageRegistry === 'crates.io') {
    return await cargoMembers(detection.rootPath, detection.rsFile as CargoFile)
  }
  if (detection.packageRegistry === 'jsr') {
    return await denoMembers(
      detection.rootPath,
      detection.denoFile as DenoFile,
      detection.options.repoScope ?? 'readma',
      detection.options,
    )
  }
  if (detection.pnpmManifest) {
    return await pnpmMembers(detection.rootPath, detection.pnpmManifest)
  }
  return undefined
}

/**
 * Detect the language, package registry and workspace members of the project
 * found at the given root path
 */
export async function detectWorkspace(
  rootPath = '.',
  options: DetectOptions = {},
): Promise<WorkspaceDetection> {
  const [denoFile, rsFile, pnpmManifest] = await Promise.all([
    parseFirstFile<DenoFile>(rootPath, DENO_FILENAMES),
    parseFirstFile<CargoFile>(rootPath, ['Cargo.toml']),
    readWorkspaceManifest(rootPath),
  ])
  const hasDenoFiles = denoFile !== undefined
  const hasRsFiles = rsFile !== undefined
  if (hasRsFiles && hasDenoFiles) {
    throw new ReadmaError(
      'Found both a deno and rust configuration file, not supported yet',
    )
  }
  const rootPkgJson = await parseFirstFile<PackageJsonLike>(rootPath, [
    'package.json',
  ])
  const isTs = hasDenoFiles || pnpmManifest !== undefined ||
    rootPkgJson !== undefined
  if (!isTs && !hasRsFiles) {
    throw new ReadmaError('Could not detect language')
  }
  const language: SourceLanguage = isTs ? 'ts' : 'rs'
  const packageRegistry: PackageRegistry = registryFor(
    hasDenoFiles,
    pnpmManifest,
    rootPkgJson,
  )
  const members = await detectMembers({
    packageRegistry,
    rootPath,
    rsFile,
    denoFile,
    pnpmManifest,
    options,
  })
  return {
    packageRegistry,
    language,
    files: {
      deno: denoFile,
      rs: rsFile,
      pnpm: pnpmManifest,
      pkgJson: rootPkgJson,
    },
    members,
  }
}
