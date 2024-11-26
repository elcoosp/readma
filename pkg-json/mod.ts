import type { PackageJson } from "types-package-json"

/** Return a typed package.json object if found for the given package folder */
export async function loadPkgJson(packageFolder: string): Promise<PackageJson> {
    return JSON.parse(
        await Deno.readTextFile(`${packageFolder}/package.json`),
    ) as PackageJson
}
