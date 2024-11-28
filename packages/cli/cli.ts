import { Command } from '@cliffy/command'
import { deepMerge } from '@cross/deepmerge'
import { Logger } from '@deno-library/logger'
import {
  readWorkspaceManifest,
  type WorkspaceManifest,
} from '@pnpm/workspace.read-manifest'
import { exists } from '@std/fs'
import * as jsonc from '@std/jsonc'
import * as path from '@std/path'
import * as toml from '@std/toml'
import { glob } from 'glob'
import type { PartialDeep } from 'type-fest'
import { mdx, readme, types, utils } from '../core/mod.ts'
import { loadPkgJson } from '../pkg-json/mod.ts'
import denoConf from './deno.json' with { type: 'json' }
const log = new Logger()
type DenoFile = { workspace: string[] }
type CargoFile = {
  workspace: { members: string[] }
  package?: { description?: string; name?: string }
}
/**
 * Readma cli
 */
export type Cli = {
  /** Utility to detect language and get workspace members */
  detectLanguage: (config: Partial<types.ReadmeTemplateArgs>) => Promise<{
    language: types.ReadmeTemplateArgs['language']
    files: {
      deno?: DenoFile
      rs?: CargoFile
      pnpm?: WorkspaceManifest
    }
    workspaceMembers?: types.WorkspaceMember[]
    packageRegistry?: types.PackageRegistry
  }>
  /** Run the cli */
  run: () => Promise<unknown>
}
/** {@link Cli} instance */
export const cli: Cli = {
  async detectLanguage(config) {
    const pnpmWorkspaceManifest = await readWorkspaceManifest('.')
    const denoFilenames = ['deno.jsonc', 'deno.json']
    const rsFilenames = ['Cargo.toml']
    const getParsedFiles = async <T>(filenames: string[]) =>
      await Promise.all(
        filenames.map(async (filename) => {
          if (await exists(filename)) {
            const parserMap = {
              toml,
              json: JSON,
              jsonc: jsonc,
            } as const
            const ext = filename.split('.')[1] as keyof typeof parserMap
            const parser = parserMap[ext].parse
            const file = await Deno.readTextFile(filename)
            return parser(file) as T
            // biome-ignore lint/style/noUselessElse: <explanation>
          } else return null
        }),
      )
    const denoFiles = await getParsedFiles<DenoFile>(denoFilenames)
    const rsFiles = await getParsedFiles<CargoFile>(rsFilenames)
    const hasRsFiles = rsFiles.some((x) => x !== null)
    const hasDenoFiles = denoFiles.some((x) => x !== null)
    if (hasRsFiles && hasDenoFiles) {
      throw new Error(
        'Found both a deno and rust configuration file, not supported yet',
      )
    }
    const language = hasDenoFiles || pnpmWorkspaceManifest !== undefined
      ? ('ts' as const)
      : hasRsFiles
      ? ('rs' as const)
      : null
    if (language === null) throw new Error('Could not detect language')
    const files = {
      deno: denoFiles.find((x) => x !== null),
      rs: rsFiles.find((x) => x !== null),
      pnpm: pnpmWorkspaceManifest,
    }

    const packageRegistry: types.PackageRegistry | undefined = hasDenoFiles
      ? 'jsr'
      : pnpmWorkspaceManifest
      ? 'npm'
      : hasRsFiles
      ? 'crates.io'
      : undefined
    const workspaceMembers: types.WorkspaceMember[] | undefined =
      packageRegistry === 'crates.io'
        ? files.rs?.workspace?.members?.map((path) => ({
          path,
          description: files.rs?.package?.description ?? '-',
          pkgName: getFolderName(path),
        }))
        : packageRegistry === 'jsr'
        ? await Promise.all(
          (files.deno?.workspace ?? []).map(async (path) => {
            // TODO should double check that this match with package deno.json[name]
            const pkgName = `@${config.repoName}/${getFolderName(path)}`

            const jsrMeta = await fetch(
              `https://npm.jsr.io/@jsr/${
                pkgName
                  .replace('/', '__')
                  .replace('@', '')
              }`,
              {
                headers: {
                  Accept: 'application/json',
                },
              },
            ).then((x) => x.json())

            return {
              path,
              description: jsrMeta?.description ?? '-',
              pkgName,
            }
          }),
        )
        : packageRegistry === 'npm'
        ? await getPackagesFromManifest(files.pnpm)
        : undefined
    log.info({ packageRegistry })
    log.info({ workspaceMembers })
    return {
      packageRegistry,
      language,
      files,
      workspaceMembers,
    }
  },
  async run() {
    const licenseFile = await Deno.readTextFile('LICENSE.txt')
    let cocFile: string | undefined = undefined
    try {
      cocFile = await Deno.readTextFile(types.COC_FILE_PATH)
    } catch (error) {
      if (!(error instanceof Deno.errors.NotFound)) {
        throw error
      }
    }
    const license = licenseFile.startsWith('MIT License') ? 'MIT' : undefined
    const config = deepMerge<PartialDeep<types.ReadmeTemplateArgs>>(
      await utils.getReadmaConfig(),
      {
        license,
        coc: cocFile ? types.COC_FILE_PATH : undefined,
      },
    ) as types.ReadmeTemplateArgs

    await new Command()
      .name('readma')
      .version(denoConf.version)
      .description('Command line utility for Readma')
      .globalOption('-d, --debug', 'Enable debug output.')
      .action((_options, ..._args) =>
        log.warn(
          'Main command called. Nothing will happen, use `gen` subcommand',
        )
      )
      .command('gen', 'Generate readme(s)')
      .action(async (_options, ..._args) => {
        log.info('Starting readma generation')
        log.info({ license })
        const { language, workspaceMembers, packageRegistry, files } = await cli
          .detectLanguage(config)

        const wsOverride = await Promise.all(
          (workspaceMembers || [])?.map(async (wm) => {
            const packageSpecificSections = Object.fromEntries(
              (
                await Promise.all(
                  Object.entries(config.sections).map(
                    async ([sectionName, v]) => {
                      const sectionPath = path.join(
                        wm.path,
                        'readma',
                        'sections',
                        `${sectionName}.mdx`,
                      )
                      try {
                        const mdxProcessed = await mdx.processFile(sectionPath)
                        return [sectionName, mdxProcessed]
                      } catch (error) {
                        console.log(error)
                        return [sectionName, v]
                      }
                    },
                  ),
                )
              ).filter(([_, v]) => typeof v === 'string'),
            )

            const sections = {
              installation: language === 'ts' && packageRegistry === 'jsr'
                ? utils.md.code(`deno add ${wm.pkgName}`)
                : language === 'ts' && packageRegistry === 'npm'
                ? [
                  utils.md.code(`pnpm add ${wm.pkgName}`),
                  utils.md.code(`npm add ${wm.pkgName}`),
                  utils.md.code(`yarn add ${wm.pkgName}`),
                  utils.md.code(`deno add npm:${wm.pkgName}`),
                  utils.md.code(`bun add ${wm.pkgName}`),
                ].join('\n')
                : language === 'rs'
                ? utils.md.code(`cargo add ${wm.pkgName}`)
                : undefined,
              ...packageSpecificSections,
            }
            return deepMerge<PartialDeep<types.ReadmeTemplateArgs>>(config, {
              packageRegistry,
              sections,
              workspaceMember: wm,
            })
          }),
        )
        await Promise.all(
          (wsOverride || []).map((wsConfig) => {
            log.info(
              `Writing "${wsConfig.workspaceMember?.pkgName}" workspace member README`,
            )
            return readme(wsConfig as types.ReadmeTemplateArgs)
          }),
        )
        log.info('Writing workspace root README')

        await readme(
          deepMerge<PartialDeep<types.ReadmeTemplateArgs>>(config, {
            sections: {
              installation: config.sections?.installation ??
                (language === 'rs'
                  ? utils.md.code(`cargo add ${files.rs?.package?.name}`)
                  : 'Not specified'),
            },
            packageRegistry,
            root: {
              members: (wsOverride || []).map(
                (x) => x.workspaceMember as types.WorkspaceMember,
              ),
            },
          }) as types.ReadmeTemplateArgs,
          { workspaceRootPath: '.' },
        )
      })
      .parse(Deno.args)
  },
} as const
export default cli

async function getPackagesFromManifest(
  pnpmWorkspaceManifest: WorkspaceManifest | undefined,
): Promise<types.WorkspaceMember[]> {
  if (!pnpmWorkspaceManifest) {
    throw new Error('pnpmWorkspaceManifest should be defined')
  }
  const packages: types.WorkspaceMember[] = []
  for (const pkgsGlob of pnpmWorkspaceManifest.packages) {
    packages.push(
      ...(await Promise.all(
        (
          await glob(`${pkgsGlob}/package.json`, {
            ignore: '**/node_modules/**',
            // FIXME Workaround nested package json (which is not a real one but a template)
            maxDepth: 3,
          })
        ).map(async (path) => {
          const memberPath = path.replace('/package.json', '')
          const pkg = await loadPkgJson(memberPath)
          return {
            path: memberPath,
            pkgName: pkg.name as string,
            description: pkg.description ?? '-',
          }
        }),
      )),
    )
  }
  return packages
}
const getFolderName = (x: string) => x.split('/').pop() as string
