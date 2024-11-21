import { utils } from "@readma/core"
import { Command } from "@cliffy/command"
import { exists } from "@std/fs"
import * as toml from "@std/toml"
import * as jsonc from "@std/jsonc"
import type { ReadmeTemplateArgs } from "../core/types.ts"
import denoConf from "./deno.json" with { type: "json" }

type Cli = {
  detectLanguage: () => Promise<{
    language: ReadmeTemplateArgs["language"]
    files: {
      ts: Record<string, unknown>
      rs: undefined
    }
    workspaceMembers?: string[]
  }>
  run: () => Promise<unknown>
}
const readReadmaConfig = async (configPathRoot = "./") => {
  // Can not run if using Deno.makeTempFile
  const tempFilePath = "./readReadmaConfig-tempFile.ts"
  const readmaConfigRelPath = `${configPathRoot}readma.config.ts`
  await Deno.writeTextFile(
    tempFilePath,
    `import config from '${readmaConfigRelPath}'; console.log(JSON.stringify(config));`,
  )
  console.log(tempFilePath)

  const cmd = new Deno.Command(Deno.execPath(), {
    args: [
      "run",
      `-A`,
      `${tempFilePath}`,
    ],
  })
  const { stdout, stderr, success } = cmd.outputSync()
  if (!success) {
    throw new Error(new TextDecoder().decode(stderr))
  }
  Deno.remove(tempFilePath)
  return JSON.parse(new TextDecoder().decode(stdout).trim())
}
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
      // Main command.
      .name("readma")
      .version(denoConf.version)
      .description("Command line utility for Readme")
      .globalOption("-d, --debug", "Enable debug output.")
      .action((_options, ..._args) => console.log("Main command called."))
      // Child command 1.
      .command("inspect", "Inspect git repo sub-command.")
      .option("-w, --write", "Write gathered config")
      .action(async (_options, ..._args) => {
        const { language, workspaceMembers } = await cli
          .detectLanguage()

        const wsOverride = workspaceMembers?.map((wm) => {
          const pkgName = language === "ts" ? `@${config.repoName}/${wm}` : wm
          const sections = {
            installation: language === "ts"
              ? utils.md.code(`deno install ${pkgName}`)
              : language === "rs"
              ? utils.md.code(`cargo add ${pkgName}`)
              : null,
          }
          return {
            pkgName,
            sections,
          }
        })

        console.log({
          wsOverride,
          config,
          language,
          workspaceMembers,
        })
      })
      .parse(Deno.args)
  },
} as const
export default cli
