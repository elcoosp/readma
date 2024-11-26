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
type PackageRegistry = "jsr" | "npm" | "crates.io" | undefined
/**
 * Readma cli
 */
export type Cli = {
  /** Utility to detect language and get workspace members */
  detectLanguage: () => Promise<{
    language: types.ReadmeTemplateArgs["language"]
    files: {
      deno: Record<string, unknown>
      rs: undefined
      pnpm: undefined | Readonly<[WorkspaceManifest]>
    }
    // TODO should have a package name & path
    workspaceMembers?: string[]
    packageRegistry: PackageRegistry
  }>
  /** Run the cli */
  run: () => Promise<unknown>
}
/** {@link Cli} instance */
export const cli: Cli = {
  async detectLanguage() {
    const pnpmWorkspaceManifest = await readWorkspaceManifest(".")
    const denoFilenames = ["deno.jsonc", "deno.json"]
    const rsFilenames = ["Cargo.toml"]
    const hasFiles = async (filenames: string[]) =>
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
            return parser(file)
          } else return null
        }),
      )
    const denoFiles = await hasFiles(denoFilenames)
    const rsFiles = await hasFiles(rsFilenames)
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
      pnpm: pnpmWorkspaceManifest
        ? [pnpmWorkspaceManifest] as const
        : undefined,
    }

    const packageRegistry: PackageRegistry = hasDenoFiles
      ? "jsr"
      : pnpmWorkspaceManifest
      ? "npm"
      : hasRsFiles
      ? "crates.io"
      : undefined
    const workspaceMembers = packageRegistry === "crates.io"
      ? files.rs.workspace?.members
      : packageRegistry === "jsr"
      ? files.deno.workspace
      : packageRegistry === "npm"
      ? await getPackagesFromManifest(pnpmWorkspaceManifest)
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
        const { language, workspaceMembers } = await cli
          .detectLanguage()

        const wsOverride = workspaceMembers?.map((
          wm,
        ) => {
          // TODO pick last segment from path, more generic
          const wmFolderName = wm.replace("./", "")
          const pkgName = language === "ts"
            ? `@${config.repoName}/${wmFolderName}`
            : wmFolderName
          const sections = {
            installation: language === "ts"
              ? utils.md.code(`deno install ${pkgName}`)
              : language === "rs"
              ? utils.md.code(`cargo add ${pkgName}`)
              : undefined,
          }
          return deepMerge<
            PartialDeep<types.ReadmeTemplateArgs>
          >(config, {
            sections,
            workspaceMember: wmFolderName,
          })
        })
        await Promise.all((wsOverride || []).map((wsConfig) => {
          log.info(
            `Writing "${wsConfig.workspaceMember}" workspace member README`,
          )
          return readme(wsConfig as types.ReadmeTemplateArgs, {
            folderPath: `./${wsConfig.workspaceMember}`,
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
) {
  if (!pnpmWorkspaceManifest) {
    throw new Error("pnpmWorkspaceManifest should be defined")
  }
  const packages = []
  for (const pkgsGlob of pnpmWorkspaceManifest.packages) {
    packages.push(
      ...(
        await glob(`${pkgsGlob}/package.json`, { ignore: "**/node_modules/**" })
      ).map((path) => path.replace("/package.json", "")),
    )
  }
  return packages
}
