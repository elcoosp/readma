import { $ } from "jsr:@david/dax";
export async function writeJson<T, O>(
  outputPath: string,
  content: (outputFile: O) => T,
) {
  const outputFile = JSON.parse(await Deno.readTextFile(outputPath));
  await Deno.writeTextFile(
    outputPath,
    JSON.stringify(content(outputFile), null, 2),
  );
}
export interface ChangesetStatusFile {
  changesets: Changeset[];
  releases: Release[];
}

export interface Changeset {
  releases: ChangesetRelease[];
  summary: string;
  id: string;
}

export interface ChangesetRelease {
  name: string;
  type: string;
}

export interface Release {
  name: string;
  type: string;
  oldVersion: string;
  changesets: string[];
  newVersion: string;
}

const STATUS_FILE = "changeset-status.json";
await $`changeset status -o ${STATUS_FILE}`;
const fileStr = await Deno.readTextFile(STATUS_FILE);
const changesetStatusFile = JSON.parse(fileStr) as ChangesetStatusFile;
console.log(changesetStatusFile);
for (const release of changesetStatusFile.releases) {
  const packageFolderName = release.name.split("/")[1];
  const packageFolderPath = `packages/${packageFolderName}`;
  try {
    await Deno.stat(packageFolderPath);
  } catch (error) {
    throw new Error(
      `Could not find required ${packageFolderPath} to sync version: ${error}`,
    );
  }
  let versionFile = "deno.json";
  try {
    await Deno.stat(`${packageFolderPath}/${versionFile}`);
  } catch (_e) {
    const defaultVersionFile = "package.json";
    console.warn(
      `Could not find required ${packageFolderPath} ${versionFile} to sync version defaulting to ${defaultVersionFile}`,
    );
    versionFile = defaultVersionFile;
  }
  const outputPath = `${packageFolderPath}/${versionFile}`;
  writeJson(outputPath, (outputFile: { version: string }) => {
    console.log(
      `${release.name}: ${outputFile.version} -> ${release.newVersion}`,
    );
    return { ...outputFile, version: release.newVersion };
  });
  await $`deno fmt ${outputPath}`;
}
await $`rm ${STATUS_FILE}`;
