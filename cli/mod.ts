import { utils } from "@readma/core"
import { Command } from "@cliffy/command"
import { exists } from "@std/fs"
import * as toml from "@std/toml"
import * as jsonc from "@std/jsonc"

type Cli = {
  detectLanguage: () => Promise<{
    language: "ts" | "rs"
    files: {
      ts: Record<string, unknown>
      rs: undefined
    }
    workspaceMembers?: string[]
  }>
  run: () => Promise<unknown>
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
            const ext = filename.split(".")[1] as keyof typeof parserMap
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
    // TODO
    const config = {}
    await new Command()
      // Main command.
      .name("readma")
      .version("0.1.0")
      .description("Command line utility for Readme")
      .globalOption("-d, --debug", "Enable debug output.")
      .action((_options, ..._args) => console.log("Main command called."))
      // Child command 1.
      .command("inspect", "Inspect git repo sub-command.")
      .option("-w, --write", "Write gathered config")
      .action(async (_options, ..._args) => {
        const { language, files, workspaceMembers } = await cli
          .detectLanguage()

        /**
         * TODO: One readme for each {@link workspaceMembers}
         */
        const name = "TODO"
        const sections = {
          installation: language === "ts"
            ? utils.md.code(`deno install ${name}`)
            : language === "rs"
            ? utils.md.code(`cargo add ${name}`)
            : null,
        }

        console.log({
          files,
          config,
          language,
          sections,
          workspaceMembers,
        })
      })
      .parse(Deno.args)
  },
} as const
await cli.run()
