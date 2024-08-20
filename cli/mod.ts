import { utils } from "@readma/core";
import { Command } from "@cliffy/command";
import { exists } from "@std/fs";
export const cli = {
  async detectLanguage() {
    const tsFilenames = ["deno.jsonc", "deno.json"];
    const rsFilenames = ["Cargo.toml"];
    const hasFiles = async (files: string[]) =>
      await Promise.all(
        files.map(async (file) => {
          if (await exists(file)) {
            return (await Deno.readFile(file));
          } else return null;
        }),
      );
    const tsFiles = await hasFiles(tsFilenames);
    const rsFiles = await hasFiles(rsFilenames);
    const hasRsFiles = rsFiles.some((x) => x !== null);
    const hasTsFiles = tsFiles.some((x) => x !== null);
    if (
      hasRsFiles &&
      hasTsFiles
    ) {
      throw new Error(
        "Found both a typescript and rust configuration file, not supported yet",
      );
    }
    const language = hasTsFiles
      ? "ts" as const
      : hasRsFiles
      ? "rs" as const
      : null;

    return {
      language,
      files: {
        ts: tsFiles,
        rs: rsFiles,
      },
    };
  },
  async run() {
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
        const { language, files } = await cli.detectLanguage();
        // Deduce from workspace members of files
        const name = "TODO";
        const sections = {
          installation: language === "ts"
            ? utils.md.code(`deno install ${name}`)
            : language === "rs"
            ? utils.md.code(`cargo add ${name}`)
            : null,
        };
        console.log({
          language,
          sections,
        });
      })
      .parse(Deno.args);
  },
};
await cli.run();
