import { loadPkgJson } from "@readma/pkg-json"
import { glob } from "glob"
import type { PartialDeep } from "type-fest"
import { deepMerge } from "@cross/deepmerge"
import { readme, type types, utils } from "@readma/core"
import { Command } from "@cliffy/command"
import { exists } from "@std/fs"
import * as toml from "@std/toml"
import * as jsonc from "@std/jsonc"
import denoConf from "./deno.json" with { type: "json" }
import { Logger } from "@deno-library/logger"
import {
  readWorkspaceManifest,
  type WorkspaceManifest,
} from "@pnpm/workspace.read-manifest"
const log = new Logger()
type DenoFile = { workspace: string[] }
type CargoFile = { workspace: { members: string[] } }
/**
 * Readma cli
 */
export type Cli = {
  /** Utility to detect language and get workspace members */
  detectLanguage: (config: Partial<types.ReadmeTemplateArgs>) => Promise<{
    language: types.ReadmeTemplateArgs["language"]
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
    const pnpmWorkspaceManifest = await readWorkspaceManifest(".")
    const denoFilenames = ["deno.jsonc", "deno.json"]
    const rsFilenames = ["Cargo.toml"]
    const getParsedFiles = async <T>(filenames: string[]) =>
      await Promise.all(
        filenames.map(async (filename) => {
          if (await exists(filename)) {
            const parserMap = {
              toml,
              json: JSON,
              jsonc: jsonc,
            } as const
            const ext = filename.split(
              ".",
            )[1] as keyof typeof parserMap
            const parser = parserMap[ext].parse
            const file = await Deno.readTextFile(filename)
            return parser(file) as T
          } else return null
        }),
      )
    const denoFiles = await getParsedFiles<DenoFile>(
      denoFilenames,
    )
    const rsFiles = await getParsedFiles<CargoFile>(
      rsFilenames,
    )
    const hasRsFiles = rsFiles.some((x) => x !== null)
    const hasDenoFiles = denoFiles.some((x) => x !== null)
    if (
      hasRsFiles &&
      hasDenoFiles
    ) {
      throw new Error(
        "Found both a deno and rust configuration file, not supported yet",
      )
    }
    const language = hasDenoFiles || pnpmWorkspaceManifest !== undefined
      ? "ts" as const
      : hasRsFiles
      ? "rs" as const
      : null
    if (language === null) throw new Error("Could not detect language")
    const files = {
      deno: denoFiles.find((x) => x !== null),
      rs: rsFiles.find((x) => x !== null),
      pnpm: pnpmWorkspaceManifest,
    }

    const packageRegistry: types.PackageRegistry | undefined = hasDenoFiles
      ? "jsr"
      : pnpmWorkspaceManifest
      ? "npm"
      : hasRsFiles
      ? "crates.io"
      : undefined
    const workspaceMembers: types.WorkspaceMember[] | undefined =
      packageRegistry === "crates.io"
        ? files.rs?.workspace?.members?.map((path) => ({
          path,
          pkgName: getFolderName(path),
        }))
        : packageRegistry === "jsr"
        ? files.deno?.workspace?.map((path) => ({
          path,
          // TODO should double check that this match with package deno.json[name]
          pkgName: `@${config.repoName}/${getFolderName(path)}`,
        }))
        : packageRegistry === "npm"
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
    const licenseFile = await Deno.readTextFile("LICENSE.txt")
    const license = licenseFile.startsWith("MIT License") ? "MIT" : undefined
    const config = deepMerge<
      PartialDeep<types.ReadmeTemplateArgs>
    >(await utils.getReadmaConfig(), {
      license,
    }) as types.ReadmeTemplateArgs

    await new Command()
      .name("readma")
      .version(denoConf.version)
      .description("Command line utility for Readma")
      .globalOption("-d, --debug", "Enable debug output.")
      .action((_options, ..._args) =>
        log.warn(
          "Main command called. Nothing will happen, use `gen` subcommand",
        )
      )
      .command("gen", "Generate readme(s)")
      .action(async (_options, ..._args) => {
        log.info("Starting readma generation")
        log.info({ license })
        const { language, workspaceMembers, packageRegistry } = await cli
          .detectLanguage(config)

        const wsOverride = workspaceMembers?.map((
          wm,
        ) => {
          const sections = {
            installation: language === "ts" && packageRegistry == "jsr"
              ? utils.md.code(`deno install ${wm.pkgName}`)
              : language === "ts" && packageRegistry == "npm"
              ? [
                utils.md.code(`npm add ${wm.pkgName}`),
                utils.md.code(`pnpm add ${wm.pkgName}`),
                utils.md.code(`yarn add ${wm.pkgName}`),
              ].join("\n")
              : language === "rs"
              ? utils.md.code(`cargo add ${wm.pkgName}`)
              : undefined,
          }
          return deepMerge<
            PartialDeep<types.ReadmeTemplateArgs>
          >(config, {
            packageRegistry,
            sections,
            workspaceMember: wm,
          })
        })
        await Promise.all((wsOverride || []).map((wsConfig) => {
          log.info(
            `Writing "${wsConfig.workspaceMember?.pkgName}" workspace member README`,
          )
          return readme(wsConfig as types.ReadmeTemplateArgs, {
            folderPath: `./${wsConfig.workspaceMember?.path}`,
          })
        }))
        log.info(`Writing main workspace member README`)
        await readme(config, { folderPath: "./" })
      })
      .parse(Deno.args)
  },
} as const
export default cli

async function getPackagesFromManifest(
  pnpmWorkspaceManifest: WorkspaceManifest | undefined,
): Promise<types.WorkspaceMember[]> {
  if (!pnpmWorkspaceManifest) {
    throw new Error("pnpmWorkspaceManifest should be defined")
  }
  const packages = []
  for (const pkgsGlob of pnpmWorkspaceManifest.packages) {
    packages.push(
      ...await Promise.all((
        await glob(`${pkgsGlob}/package.json`, { ignore: "**/node_modules/**" })
      ).map(async (path) => {
        const memberPath = path.replace("/package.json", "")
        const pkg = await loadPkgJson(memberPath)
        return ({ path: memberPath, pkgName: pkg.name as string })
      })),
    )
  }
  return packages
}
const getFolderName = (x: string) => x.split("/").pop() as string
