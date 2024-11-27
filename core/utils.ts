import { createJiti } from 'jiti/native'
import * as path from '@std/path'
import type { MdSrc, ReadmeTemplateArgs } from './types.ts'
/** Quick utils to avoid ugly escaping everywhere */
export const md = {
  /** Return code between backticks with an optional lang */
  code: (c: MdSrc, lng = 'sh'): string => `\`\`\`${lng}\n${c.trim()}\n\`\`\``,
}

/** Import the `readma.config.ts` file via [`jiti`](https://github.com/unjs/jiti) */
export const getReadmaConfig = async (
  configPathRoot = './',
): Promise<ReadmeTemplateArgs> => {
  const configPath = path.join(Deno.cwd(), configPathRoot, 'readma.config.ts')
  const jiti = createJiti(import.meta.url)

  const config =
    (await jiti.import(configPath) as { default: ReadmeTemplateArgs }).default
  return config
}
