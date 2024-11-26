import { compile, run } from '@mdx-js/mdx'
import { renderToStaticMarkup } from 'react-dom/server'
import * as runtime from 'react/jsx-runtime'
/**
 * Turn a mdx file path into an html string
 * @param path Path to a mdx file
 * @returns A rendered html string of react-dom/server or undefined in case of error (except file not found)
 */
export async function processFile(path: string): Promise<string | undefined> {
  try {
    const file = await Deno.readTextFile(path)
    console.log(`Rendering ${path}`)
    const compiled = await compile(file, { outputFormat: 'function-body' })
    const { default: MDXContent } = await run(compiled, { ...runtime })
    const html = renderToStaticMarkup(MDXContent({}))
    return html
  } catch (error) {
    if (!(error instanceof Deno.errors.NotFound)) {
      throw error
    }

    return undefined
  }
}
