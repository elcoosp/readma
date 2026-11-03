/** Minimal typed subset of a package.json file */
export type PackageJson = {
  name?: string
  version?: string
  description?: string
  private?: boolean
  type?: string
  workspaces?: string[] | { packages: string[] }
  license?: string
}
/** Expected folder name of the package manifest */
export const PKG_JSON_FILENAME = 'package.json' as const
/** Read the raw package.json content of a package folder */
async function readPkgJsonFile(packageFolder: string): Promise<string> {
  try {
    return await Deno.readTextFile(`${packageFolder}/${PKG_JSON_FILENAME}`)
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      throw new TypeError(
        `Expected a ${PKG_JSON_FILENAME} file inside ${packageFolder}`,
        { cause: error },
      )
    }
    throw error
  }
}
/**
 * Return a typed package.json object if found for the given package folder
 * @param packageFolder Folder which should contain a `package.json` file
 * @throws {TypeError} When the folder does not contain a `package.json` file
 * @throws {Error} When the `package.json` file is not parsable
 */
export async function loadPkgJson(
  packageFolder: string,
): Promise<PackageJson> {
  const content = await readPkgJsonFile(packageFolder)
  try {
    return JSON.parse(content) as PackageJson
  } catch (error) {
    throw new Error(
      `Could not parse the ${PKG_JSON_FILENAME} file inside ${packageFolder}`,
      { cause: error },
    )
  }
}
