import { paramCase } from '@wok/case'
import type { ReadmeTemplateArgs } from './types.ts'
/** Shield definition, see [shields.io](https://shields.io/) */
export type Shield = {
  name: string
  refName: string
  linkUrl: string
  shieldUrl: string
  lang?: string
}

/** Create a {@link Shield} */
export function shield(
  name: string,
  linkUrl: string,
  shieldUrl: string,
  lang?: string,
): Shield {
  const refName = paramCase(name)
  return { name, refName, linkUrl, shieldUrl, lang }
}
/** Util to create a {@link Shield.shieldUrl}, defaulting to [shields.io](https://shields.io/) */
export const shieldUrl = (path: string, style?: string) =>
  path.startsWith('https://')
    ? `${path}&style=${style}`
    : `https://img.shields.io/${path}.svg?${style ? `style=${style}` : ''}`
/** Dynamic list of shields, with some depending on args */
export const shields = (
  {
    githubUsername,
    repoUrl,
    repoName,
    badgeStyle,
    commitActivityInterval,
    linkedinUsername,
    branch,
    language,
    vcsName,
    workspaceMember,
    packageRegistry,
  }:
    & Pick<
      ReadmeTemplateArgs,
      | 'repoName'
      | 'githubUsername'
      | 'linkedinUsername'
      | 'badgeStyle'
      | 'language'
      | 'workspaceMember'
      | 'vcsName'
      | 'packageRegistry'
    >
    & {
      repoUrl: string
      commitActivityInterval: 'w'
      branch: string
    },
): Shield[] =>
  [
    ...(linkedinUsername
      ? [
        shield(
          'LinkedIn',
          `https://linkedin.com/in/${linkedinUsername}`,
          'badge/-LinkedIn-black',
        ),
      ]
      : []),
    ...(language === 'rs'
      ? [
        shield(
          'Crates MSRV',
          `https://crates.io/crates/${repoName}`,
          `crates/msrv/${repoName}`,
        ),
      ]
      : []),
    ...(language === 'ts' && workspaceMember && packageRegistry === 'jsr'
      ? [
        shield(
          'JSR version',
          `https://jsr.io/${workspaceMember.pkgName}`,
          `jsr/v/${workspaceMember.pkgName}`,
        ),
      ]
      : []),
    ...(language === 'ts' && workspaceMember && packageRegistry === 'npm'
      ? [
        shield(
          'NPM version',
          `https://www.npmjs.com/package/${workspaceMember.pkgName}`,
          `npm/v/${workspaceMember.pkgName}`,
        ),
      ]
      : []),
    ...(language === 'rs' && packageRegistry === 'crates.io'
      ? [
        shield(
          'Crates.io version',
          `https://crates.io/crates/${
            workspaceMember ? workspaceMember : repoName
          }`,
          `crates/v/${workspaceMember ? workspaceMember : repoName}`,
        ),
      ]
      : []),
    shield(
      'Codecov',
      `https://codecov.io/${vcsName}/${githubUsername}/${repoName}/tree/${branch}${
        workspaceMember ? `/${workspaceMember.path.replace('./', '')}` : ''
      }`,
      `codecov/c/${vcsName}/${githubUsername}/${repoName}/${branch}`,
    ),
    shield(
      'Contributors',
      `${repoUrl}/graphs/contributors`,
      `github/contributors/${githubUsername}/${repoName}`,
    ),
    shield(
      'Forks',
      `${repoUrl}/network/members`,
      `github/forks/${githubUsername}/${repoName}`,
    ),
    shield(
      'Stargazers',
      `${repoUrl}/stargazers`,
      `github/stars/${githubUsername}/${repoName}`,
    ),
    shield(
      'Commit activity',
      `${repoUrl}/commits`,
      `github/commit-activity/${commitActivityInterval}/${githubUsername}/${repoName}`,
    ),
    shield(
      'Branch action runs',
      `${repoUrl}/actions?query=${encodeURIComponent(`branch:${branch}`)}`,
      `github/check-runs/${githubUsername}/${repoName}/${branch}`,
    ),
    shield(
      'License',
      `${repoUrl}/blob/master/LICENSE.txt`,
      `github/license/${githubUsername}/${repoName}`,
    ),
  ].map((x) => ({ ...x, shieldUrl: shieldUrl(x.shieldUrl, badgeStyle) }))
/** Render {@link shields} as markdown, return markdown refs which declare urls and badges to put at the top of the document */
export const renderShields = (shields: Shield[]) => {
  const shieldsBadges = shields.map((s) =>
    `[![${s.name}][${s.refName}-shield]][${s.refName}-url]`
  ).join('\n')
  const shieldsRefs = shields.map((s) =>
    `[${s.refName}-shield]: ${s.shieldUrl}\n[${s.refName}-url]: ${s.linkUrl}`
  ).join('\n')
  return { shieldsBadges, shieldsRefs }
}
