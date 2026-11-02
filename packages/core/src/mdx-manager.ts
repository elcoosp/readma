import { compile, run } from '@mdx-js/mdx'
import { renderToStaticMarkup } from 'react-dom/server'
import * as runtime from 'react/jsx-runtime'
import { readOptionalFile } from './io.ts'
import { ReadmaError } from './utils.ts'
/**
 * Turn a mdx source string into an html string
 * @param source Mdx source string
 * @returns A rendered html string of react-dom/server
 */
export async function renderMdx(source: string): Promise<string> {
  const compiled = await compile(source, { outputFormat: 'function-body' })
  const { default: mdxContent } = await run(compiled, { ...runtime })
  return renderToStaticMarkup(mdxContent({}))
}
/**
 * Turn a mdx file path into an html string
 * @param path Path to a mdx file
 * @returns A rendered html string of react-dom/server or undefined in case of missing file
 */
export async function processFile(path: string): Promise<string | undefined> {
  const file = await readOptionalFile(path)
  if (file === undefined) return undefined
  try {
    return await renderMdx(file)
  } catch (error) {
    throw new ReadmaError(`Could not render the mdx file at ${path}`, {
      cause: error,
    })
  }
}
