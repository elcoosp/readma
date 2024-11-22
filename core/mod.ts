import * as templates from "../core/templates.ts"
import type { ReadmeTemplateArgs } from "../core/types.ts"
import { render } from "@deno/gfm"
export * as utils from "./utils.ts"
/** Template independent options */
export type GlobalOptions = {
  /** Specify folder where the file is output */
  folderPath: string
  // TODO: if using deno/gfm should not use tocer ?
  /** Wether tu use @deno/gfm for postprocessing, default to raw */
  renderer?: "gfm" | "raw"
}
/**
 * @param rt Readme arguments to feed the template
 * @param options Global options
 */
export async function readme(
  rt: ReadmeTemplateArgs,
  options?: Partial<GlobalOptions>,
): Promise<string> {
  return (await renderWriteTemplate(templates.readme, rt, "README", options))
}

/**
 * Render a template with it's args and options then write the file, this expect the templater to accept as first arg its template args and then global options
 * @param templater The templater function which should return correctly formatted markdown, see {@link readme}
 * @param templateArgs The templater first arg
 * @param filepath  Without extension, `.md` is hardcoded
 * @param options The templater second arg
 */
async function renderWriteTemplate<
  T extends // deno-lint-ignore no-explicit-any
  (...args: any) => Promise<any>,
>(
  templater: T,
  templateArgs: Parameters<T>[0],
  filepath: string,
  options?: Partial<GlobalOptions>,
) {
  const rendered = options?.renderer === "gfm"
    ? render(await templater(templateArgs))
    : await templater(templateArgs)
  const folderPath = options?.folderPath ?? ("./" + (
    // FIXME: not type safe
    templateArgs as ReadmeTemplateArgs
  ).title)
  try {
    await Deno.writeTextFile(`${folderPath}/${filepath}.md`, rendered)
  } catch (error) {
    throw new Error(
      `Expected ${folderPath} folder to exist, so that we can write the rendered markdown output inside, got error ${error}`,
    )
  }
  return rendered
}
