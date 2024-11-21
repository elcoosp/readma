import { paramCase } from "@wok/case"

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
  const refName = paramCase(name)
  return { name, refName, linkUrl, shieldUrl, lang }
}
const shieldUrl = (path: string, style: string) =>
  `https://img.shields.io/${path}.svg?style=${style}`
export const shields = (
  { repoUrl, githubUsername, repoName, style, commitActivityInterval, branch }:
    {
      repoUrl: string
      repoName: string
      githubUsername: string
      style: string
      commitActivityInterval: "w"
      branch: string
    },
): Shield[] =>
  [
    shield(
      "Contributors",
      `${repoUrl}/graphs/contributors`,
      `github/contributors/${githubUsername}/${repoName}`,
    ),
    shield(
      "Forks",
      `${repoUrl}/network/members`,
      `github/forks/${githubUsername}/${repoName}`,
    ),
    shield(
      "Stargazers",
      `${repoUrl}/stargazers`,
      `github/stars/${githubUsername}/${repoName}`,
    ),
    shield(
      "Commit activity",
      `${repoUrl}/commits`,
      `github/commit-activity/${commitActivityInterval}/${githubUsername}/${repoName}`,
    ),
    shield(
      "Branch action runs",
      `${repoUrl}/actions?query=${encodeURIComponent(`branch:${branch}`)}`,
      `github/check-runs/${githubUsername}/${repoName}/${branch}`,
    ),
    shield(
      "Issues",
      `${repoUrl}/issues`,
      `github/license/${githubUsername}/${repoName}`,
    ),
    shield(
      "License",
      `${repoUrl}/blob/master/LICENSE.txt`,
      `github/license/${githubUsername}/${repoName}`,
    ),
  ].map((x) => ({ ...x, shieldUrl: shieldUrl(x.shieldUrl, style) }))
export const renderShields = (shields: Shield[]) => {
  const shieldsBadges = shields.map((s) =>
    `[![${s.name}][${s.refName}-shield]][${s.refName}-url]`
  ).join("\n")
  const shieldsRefs = shields.map((s) =>
    `[${s.refName}-shield]: ${s.shieldUrl}\n[${s.refName}-url]: ${s.linkUrl}`
  ).join("\n")
  return { shieldsBadges, shieldsRefs }
}
