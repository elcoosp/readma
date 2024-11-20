export type Shield = {
  name: string
  refName: string
  linkUrl: string
  shieldUrl: string
  lang?: string
}

export function shield(
  name: string,
  linkUrl: string,
  shieldUrl: string,
  lang?: string,
): Shield {
  const refName = name
  return { name, refName, linkUrl, shieldUrl, lang }
}
// export const shields = ({ repoUrl }: { repoUrl }): Shield[] => [
//     shield("Contributors"),
//     shield("Forks"),
//     shield("Stargazers"),
//     shield("Commit activity"),
//     shield("Branch action runs"),
//     shield("Issues"),
//     shield("MIT License"),
// ]
