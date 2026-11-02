import { paramCase } from '@wok/case'
import type {
  BuiltinBadgeId,
  CustomBadge,
  ReadmeTemplateArgs,
} from './types.ts'
/** Shield definition, see [shields.io](https://shields.io/) */
export type Shield = {
  name: string
  refName: string
  linkUrl: string
  shieldUrl: string
  logo?: string
}
/** Create a {@link Shield} */
export function shield(
  name: string,
  linkUrl: string,
  shieldUrl: string,
  logo?: string,
): Shield {
  const refName = paramCase(name)
  return { name, refName, linkUrl, shieldUrl, logo }
}
/** Util to create a {@link Shield['shieldUrl']}, defaulting to [shields.io](https://shields.io/) */
export const shieldUrl = (
  path: string,
  style?: string,
  logo?: string,
): string =>
  path.startsWith('https://')
    ? appendParams(path, { style })
    : appendParams(`https://img.shields.io/${path}.svg`, {
      style,
      logo,
      logoColor: logo ? LOGO_COLOR : undefined,
    })
/** Default logoColor of the shields.io badges */
const LOGO_COLOR = 'f5f5f5'
/** Append url search params without empty values */
const appendParams = (
  url: string,
  params: Record<string, string | undefined>,
): string => {
  const searchParams = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value) searchParams.set(key, value)
  }
  const query = searchParams.toString()
  if (!query) return url
  return `${url}${url.includes('?') ? '&' : '?'}${query}`
}
/** Arguments needed to derive the builtin shields */
export type ShieldsArgs =
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
    | 'badges'
  >
  & {
    repoUrl: string
    commitActivityInterval: 'w'
    branch: string
  }
/** Builtin badge ids which are conditionally derived from the args */
export const CONDITIONAL_BADGE_IDS = [
  'linkedin',
  'msrv',
  'registry',
] as const
/** Registry derived version shield, undefined when the language/registry combination is not published */
function registryShield(
  language: ReadmeTemplateArgs['language'],
  workspaceMember: ReadmeTemplateArgs['workspaceMember'],
  packageRegistry: ReadmeTemplateArgs['packageRegistry'],
  memberName: string,
): Shield | undefined {
  if (language === 'ts' && workspaceMember && packageRegistry === 'jsr') {
    return shield(
      'JSR version',
      `https://jsr.io/${workspaceMember.pkgName}`,
      `jsr/v/${workspaceMember.pkgName}`,
      'jsr',
    )
  }
  if (language === 'ts' && workspaceMember && packageRegistry === 'npm') {
    return shield(
      'NPM version',
      `https://www.npmjs.com/package/${workspaceMember.pkgName}`,
      `npm/v/${workspaceMember.pkgName}`,
      'npm',
    )
  }
  if (language === 'rs' && packageRegistry === 'crates.io') {
    return shield(
      'Crates.io version',
      `https://crates.io/crates/${memberName}`,
      `crates/v/${memberName}`,
      'rust',
    )
  }
  return undefined
}
/** Dynamic list of shields, with some depending on args */
export const shields = (args: ShieldsArgs): Shield[] => {
  const {
    githubUsername,
    repoUrl,
    repoName,
    badgeStyle,
    commitActivityInterval,
    linkedinUsername,
    branch,
    language,
    vcsName = 'github',
    workspaceMember,
    packageRegistry,
    badges,
  } = args
  const disabled = new Set(badges?.disabled)
  const memberName = workspaceMember?.pkgName ?? repoName
  const memberPath = workspaceMember?.path.replace(/^\.\//u, '') ?? ''
  const conditionalShields: {
    id: BuiltinBadgeId
    shield: Shield | undefined
  }[] = [
    {
      id: 'linkedin',
      shield: linkedinUsername
        ? shield(
          'LinkedIn',
          `https://linkedin.com/in/${linkedinUsername}`,
          'badge/-LinkedIn-black',
          'linkedin',
        )
        : undefined,
    },
    {
      id: 'msrv',
      shield: language === 'rs'
        ? shield(
          'Crates MSRV',
          `https://crates.io/crates/${repoName}`,
          `crates/msrv/${repoName}`,
          'rust',
        )
        : undefined,
    },
    {
      id: 'registry',
      shield: registryShield(
        language,
        workspaceMember,
        packageRegistry,
        memberName,
      ),
    },
  ]
  const unconditionalShields: { id: BuiltinBadgeId; shield: Shield }[] = [
    {
      id: 'codecov',
      shield: shield(
        'Codecov',
        `https://codecov.io/${vcsName}/${githubUsername}/${repoName}/tree/${branch}${
          memberPath ? `/${memberPath}` : ''
        }`,
        `codecov/c/${vcsName}/${githubUsername}/${repoName}/${branch}`,
        'codecov',
      ),
    },
    {
      id: 'contributors',
      shield: shield(
        'Contributors',
        `${repoUrl}/graphs/contributors`,
        `github/contributors/${githubUsername}/${repoName}`,
      ),
    },
    {
      id: 'forks',
      shield: shield(
        'Forks',
        `${repoUrl}/network/members`,
        `github/forks/${githubUsername}/${repoName}`,
      ),
    },
    {
      id: 'stars',
      shield: shield(
        'Stargazers',
        `${repoUrl}/stargazers`,
        `github/stars/${githubUsername}/${repoName}`,
      ),
    },
    {
      id: 'commitActivity',
      shield: shield(
        'Commit activity',
        `${repoUrl}/commits`,
        `github/commit-activity/${commitActivityInterval}/${githubUsername}/${repoName}`,
      ),
    },
    {
      id: 'actions',
      shield: shield(
        'Branch action runs',
        `${repoUrl}/actions?query=${encodeURIComponent(`branch:${branch}`)}`,
        `github/check-runs/${githubUsername}/${repoName}/${branch}`,
        'githubactions',
      ),
    },
    {
      id: 'issues',
      shield: shield(
        'Issues',
        `${repoUrl}/issues`,
        `github/issues/${githubUsername}/${repoName}`,
      ),
    },
    {
      id: 'pullRequests',
      shield: shield(
        'Pull requests',
        `${repoUrl}/pulls`,
        `github/issues-pr/${githubUsername}/${repoName}`,
      ),
    },
    {
      id: 'lastCommit',
      shield: shield(
        'Last commit',
        `${repoUrl}/commits`,
        `github/last-commit/${githubUsername}/${repoName}/${branch}`,
      ),
    },
    {
      id: 'release',
      shield: shield(
        'Release',
        `${repoUrl}/releases`,
        `github/v/release/${githubUsername}/${repoName}`,
      ),
    },
    {
      id: 'license',
      shield: shield(
        'License',
        `${repoUrl}/blob/master/LICENSE.txt`,
        `github/license/${githubUsername}/${repoName}`,
      ),
    },
  ]
  const builtinShields = [
    ...conditionalShields,
    ...unconditionalShields,
  ]
    .filter(({ id, shield: s }) => !disabled.has(id) && s !== undefined)
    .map(({ shield: s }) => s as Shield)
  const customShields: Shield[] = (badges?.custom ?? []).map((custom) =>
    customBadgeToShield(custom)
  )
  return [...builtinShields, ...customShields].map((x) => ({
    ...x,
    shieldUrl: shieldUrl(x.shieldUrl, badgeStyle, x.logo),
  }))
}
/** Convert a user provided {@link CustomBadge} into a {@link Shield} */
export const customBadgeToShield = (custom: CustomBadge): Shield => ({
  name: custom.name,
  refName: paramCase(custom.name),
  linkUrl: custom.link,
  shieldUrl: custom.image,
})
/** Rendered markdown badges and their reference links */
export type RenderedShields = { shieldsBadges: string; shieldsRefs: string }
/** Render a shield list as markdown, return markdown refs which declare urls and badges to put at the top of the document */
export const renderShields = (shieldList: Shield[]): RenderedShields => {
  const shieldsBadges = shieldList.map((s) =>
    `[![${s.name}][${s.refName}-shield]][${s.refName}-url]`
  ).join('\n')
  const shieldsRefs = shieldList.map((s) =>
    `[${s.refName}-shield]: ${s.shieldUrl}\n[${s.refName}-url]: ${s.linkUrl}`
  ).join('\n')
  return { shieldsBadges, shieldsRefs }
}
