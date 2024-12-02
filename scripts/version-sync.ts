// import { Command } from '@cliffy/command'
import { writeJson } from './pre-version.ts'

/** @deprecated */
export async function versionSync(inputPath: string, outputPath: string) {
  const inputFile = JSON.parse(await Deno.readTextFile(inputPath))
  const inputVersion = inputFile.version as string

  await writeJson(
    outputPath,
    (outputFile: { version: string }) => {
      const outputVersion = outputFile.version as string | undefined
      if (!outputVersion) {
        throw new Error(
          'Expected output to already be defined, maybe you are running the script in the workspace root, which may not have a version if not published',
        )
      }
      console.log({ inputVersion, outputVersion })
      if (
        inputVersion ===
          outputVersion
      ) {
        console.log('Source and output version are the same, skipping')
        return
      }
      console.log(
        `Writing version to ${outputPath}: ${outputVersion} -> ${inputVersion}`,
      )
      return ({ ...outputFile, version: inputVersion })
    },
  )
}
// await new Command()
//   .arguments('<input:string> <output:string>')
//   .action(
//     async (_, inputPath, outputPath) => {
//       await versionSync(inputPath, outputPath)
//     },
//   ).parse(Deno.args)
