import { createJiti } from 'jiti/native'
import * as path from '@std/path'
import type { MdSrc, ReadmeTemplateArgs } from './types.ts'
// TODO: fix lines of markdown inside template lit lead to incorrectly formatted md, use an md template lit & a linter
/** Quick utils to avoid ugly escaping everywhere */
export const md = {
  /** Return code between backticks with an optional lang */
  code: (c: MdSrc, lng = 'sh'): string =>
    '```' + lng + `\n${c.trim()}\n` + '```',
}

/** Create a temp file to log the imported config into the deno runtime, not juste a file read, this is interpreted */
export const getReadmaConfig = async (
  configPathRoot = './',
): Promise<ReadmeTemplateArgs> => {
  const configPath = path.join(Deno.cwd(), configPathRoot, 'readma.config.ts')
  const jiti = createJiti(import.meta.url)

  const config =
    (await jiti.import(configPath) as { default: ReadmeTemplateArgs }).default
  return config
}
