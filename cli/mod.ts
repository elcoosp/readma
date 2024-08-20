import { utils } from "@readma/core";
import { Command } from "@cliffy/command";
import { exists } from "@std/fs";
export const cli = {
    async run() {
        await new Command()
            // Main command.
            .name("readma")
            .version("0.1.0")
            .description("Command line utility for Readme")
            .globalOption("-d, --debug", "Enable debug output.")
            .action((options, ...args) => console.log("Main command called."))
            // Child command 1.
            .command("inspect", "Inspect git repo sub-command.")
            .option("-w, --write", "Write gathered config")
            .action(async (options, ...args) => {
                // Detect language
                const tsFiles = ["deno.jsonc", "deno.json", "package.json"];
                const rsFiles = ["Cargo.toml"];
                const hasFiles = async (files: string[]) =>
                    await Promise.all(
                        files.map(async (file) => {
                            if (await exists(file)) {
                                return true;
                            } else return false;
                        }),
                    );
                const hasTsFiles = await hasFiles(tsFiles);
                const hasRsFiles = await hasFiles(rsFiles);
                // TODO: should warn ambiguous if both
                const language = hasTsFiles.some((x) => x === true)
                    ? "ts" as const
                    : hasRsFiles.some((x) => x === true)
                    ? "rs" as const
                    : null;
                // Deduce from workspace members
                const name = "TODO";
                const sections = {
                    installation: language === "ts"
                        // TODO: should check npm vs deno
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
