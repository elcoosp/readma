import { join } from '@std/path'
import * as templates from '../core/templates.ts'
import type {
  GlobalOptions,
  ReadmeTemplateArgs,
  TemplateFn,
} from '../core/types.ts'
// import { render } from "@deno/gfm"
export * as utils from './utils.ts'
export * as types from './types.ts'
export * as mdx from './mdx-manager.ts'

/**
 * @param rt Readme arguments to feed the template
 * @param options Global options
 */
export async function readme(
  rt: ReadmeTemplateArgs,
  options?: Partial<GlobalOptions>,
): Promise<string> {
  return (await renderWriteTemplate(templates.readme, rt, 'README', options))
}

/**
 * Render a template with it's args and options then write the file, this expect the templater to accept as first arg its template args and then global options
 * @param templater The templater function which should return correctly formatted markdown, see {@link readme}
 * @param templateArgs The templater first arg
 * @param filepath  Without extension, `.md` is hardcoded
 * @param options The templater second arg
 */
async function renderWriteTemplate<
  T extends TemplateFn,
>(
  templater: T,
  templateArgs: ReadmeTemplateArgs,
  filepath: string,
  options?: Partial<GlobalOptions>,
) {
  const defaultedOptions = {
    folderPath: join(
      '.',
      // FIXME Should not be title but have a path
      templateArgs.title,
    ),
    ...options || {},
  }
  const rendered = await templater(templateArgs, defaultedOptions)
  try {
    await Deno.writeTextFile(
      `${defaultedOptions.folderPath}/${filepath}.md`,
      rendered,
    )
  } catch (error) {
    throw new Error(
      `Expected ${defaultedOptions.folderPath} folder to exist, so that we can write the rendered markdown output inside, got error ${error}`,
    )
  }
  return rendered
}
