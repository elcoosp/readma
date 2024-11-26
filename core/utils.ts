import { $ } from '@david/dax'
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
  // Can not run if using Deno.makeTempFile
  const tempFilePath = './getReadmaConfig-tempFile.ts'
  const readmaConfigRelPath = `${configPathRoot}readma.config.ts`
  await Deno.writeTextFile(
    tempFilePath,
    `import config from '${readmaConfigRelPath}'; console.log(JSON.stringify(config));`,
  )
  try {
    const result = await $`${Deno.execPath()} run -A ${tempFilePath}`.json()
    return result as ReadmeTemplateArgs
  } catch (error) {
    throw error
  } finally {
    Deno.remove(tempFilePath)
  }
}
