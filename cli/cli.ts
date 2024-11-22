import type { PartialDeep } from "type-fest"
import { deepMerge } from "@cross/deepmerge"
import { readme, utils } from "@readma/core"
import { Command } from "@cliffy/command"
import { exists } from "@std/fs"
import * as toml from "@std/toml"
import * as jsonc from "@std/jsonc"
import type { ReadmeTemplateArgs } from "../core/types.ts"
import denoConf from "./deno.json" with { type: "json" }
import { readReadmaConfig } from "../core/utils.ts"

/**
 * Readma cli
 */
export type Cli = {
  /** Utility to detect language and get workspace members */
  detectLanguage: () => Promise<{
    language: ReadmeTemplateArgs["language"]
    files: {
      ts: Record<string, unknown>
      rs: undefined
    }
    workspaceMembers?: string[]
  }>
  /** Run the cli */
  run: () => Promise<unknown>
}
/** {@link Cli} instance */
export const cli: Cli = {
  async detectLanguage() {
    const tsFilenames = ["deno.jsonc", "deno.json"]
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
    const tsFiles = await hasFiles(tsFilenames)
    const rsFiles = await hasFiles(rsFilenames)
    const hasRsFiles = rsFiles.some((x) => x !== null)
    const hasTsFiles = tsFiles.some((x) => x !== null)
    if (
      hasRsFiles &&
      hasTsFiles
    ) {
      throw new Error(
        "Found both a typescript and rust configuration file, not supported yet",
      )
    }
    const language = hasTsFiles
      ? "ts" as const
      : hasRsFiles
      ? "rs" as const
      : null
    if (language === null) throw new Error("Could not detect language")
    const files = {
      ts: tsFiles.find((x) => x !== null),
      rs: rsFiles.find((x) => x !== null),
    }
    const workspaceMembers = language === "rs"
      ? files.rs.workspace.members
      : files.ts.workspace
    return {
      language,
      files,
      workspaceMembers,
    }
  },
  async run() {
    const config = await readReadmaConfig()

    await new Command()
      .name("readma")
      .version(denoConf.version)
      .description("Command line utility for Readma")
      .globalOption("-d, --debug", "Enable debug output.")
      .action((_options, ..._args) =>
        console.log(
          "Main command called. Nothing will happen, use `gen` subcommand",
        )
      )
      .command("gen", "Generate readme(s)")
      .action(async (_options, ..._args) => {
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
            PartialDeep<ReadmeTemplateArgs>
          >(config, {
            sections,
            workspaceMember: wmFolderName,
          })
        })
        await Promise.all((wsOverride || []).map((wsConfig) => {
          return readme(wsConfig as ReadmeTemplateArgs, {
            folderPath: `./${wsConfig.workspaceMember}`,
          })
        }))
        await readme(config, { folderPath: "./" })
      })
      .parse(Deno.args)
  },
} as const
export default cli
