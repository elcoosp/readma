import { assertEquals } from '@std/assert'
import {
  CONDITIONAL_BADGE_IDS,
  customBadgeToShield,
  renderShields,
  shield,
  shields,
  shieldUrl,
} from '../src/shields.ts'

const baseArgs = {
  githubUsername: 'elcoosp',
  repoUrl: 'https://github.com/elcoosp/readma',
  repoName: 'readma',
  badgeStyle: 'for-the-badge',
  commitActivityInterval: 'w',
  linkedinUsername: undefined,
  branch: 'main',
  language: 'ts',
  vcsName: 'github',
  workspaceMember: undefined,
  packageRegistry: 'npm',
} as const

Deno.test('shield and shieldUrl utils', () => {
  const s = shield('Codecov', 'https://codecov.io/gh', 'codecov/c/x', 'codecov')
  assertEquals(s.refName, 'codecov')
  assertEquals(shield('My Badge', 'a', 'b').refName, 'my-badge')
  assertEquals(
    shieldUrl('npm/v/pkg', 'flat', 'npm'),
    'https://img.shields.io/npm/v/pkg.svg?style=flat&logo=npm&logoColor=f5f5f5',
  )
  assertEquals(
    shieldUrl('npm/v/pkg'),
    'https://img.shields.io/npm/v/pkg.svg',
  )
  assertEquals(
    shieldUrl('npm/v/pkg', 'flat'),
    'https://img.shields.io/npm/v/pkg.svg?style=flat',
  )
  assertEquals(
    shieldUrl('https://custom.badge/x?color=blue', 'plastic'),
    'https://custom.badge/x?color=blue&style=plastic',
  )
  assertEquals(
    shieldUrl('https://custom.badge/x'),
    'https://custom.badge/x',
  )
})

Deno.test('shields - ts npm', () => {
  const list = shields(baseArgs)
  const nameSet = new Set(list.map((s) => s.name))
  assertEquals(nameSet.has('NPM version'), false)
  assertEquals(nameSet.has('LinkedIn'), false)
  assertEquals(nameSet.has('Codecov'), true)
  assertEquals(nameSet.has('Contributors'), true)
  assertEquals(nameSet.has('Forks'), true)
  assertEquals(nameSet.has('Stargazers'), true)
  assertEquals(nameSet.has('Commit activity'), true)
  assertEquals(nameSet.has('Branch action runs'), true)
  assertEquals(nameSet.has('Issues'), true)
  assertEquals(nameSet.has('Pull requests'), true)
  assertEquals(nameSet.has('Last commit'), true)
  assertEquals(nameSet.has('Release'), true)
  assertEquals(nameSet.has('License'), true)
  const npm = list.find((s) => s.name === 'NPM version')
  assertEquals(npm, undefined)
  for (const shieldItem of list) {
    assertEquals(shieldItem.shieldUrl.startsWith('https://'), true)
  }
})

Deno.test('shields - workspace member registry badges', () => {
  const member = {
    pkgName: '@readma/core',
    path: 'packages/core',
    description: '-',
  }
  const npm = shields({
    ...baseArgs,
    workspaceMember: member,
    packageRegistry: 'npm',
  })
  assertEquals(
    npm.find((s) => s.name === 'NPM version')?.shieldUrl,
    'https://img.shields.io/npm/v/@readma/core.svg?style=for-the-badge&logo=npm&logoColor=f5f5f5',
  )
  const jsr = shields({
    ...baseArgs,
    workspaceMember: member,
    packageRegistry: 'jsr',
  })
  assertEquals(
    jsr.find((s) => s.name === 'JSR version')?.shieldUrl,
    'https://img.shields.io/jsr/v/@readma/core.svg?style=for-the-badge&logo=jsr&logoColor=f5f5f5',
  )
})

Deno.test('shields - rust crates', () => {
  const rs = shields({
    ...baseArgs,
    language: 'rs',
    packageRegistry: 'crates.io',
  })
  assertEquals(
    rs.find((s) => s.name === 'Crates MSRV')?.shieldUrl.includes(
      'crates/msrv/readma',
    ),
    true,
  )
  assertEquals(
    rs.find((s) => s.name === 'Crates.io version')?.shieldUrl.includes(
      'crates/v/readma',
    ),
    true,
  )
  const rsMember = shields({
    ...baseArgs,
    language: 'rs',
    packageRegistry: 'crates.io',
    workspaceMember: {
      pkgName: 'my-crate',
      path: 'crates/my-crate',
      description: '-',
    },
  })
  assertEquals(
    rsMember.find((s) => s.name === 'Crates.io version')?.shieldUrl.includes(
      'crates/v/my-crate',
    ),
    true,
  )
})

Deno.test('shields - linkedin', () => {
  const withLinkedin = shields({ ...baseArgs, linkedinUsername: 'elcoosp' })
  assertEquals(
    withLinkedin.find((s) => s.name === 'LinkedIn')?.refName,
    'linked-in',
  )
  const withoutLinkedin = shields({ ...baseArgs, linkedinUsername: undefined })
  assertEquals(withoutLinkedin.find((s) => s.name === 'LinkedIn'), undefined)
})

Deno.test('shields - license link follows the branch and license file', () => {
  const licensed = shields({
    ...baseArgs,
    branch: 'dev',
    licenseFile: 'LICENSE.md',
  })
  assertEquals(
    licensed.find((s) => s.name === 'License')?.linkUrl,
    'https://github.com/elcoosp/readma/blob/dev/LICENSE.md',
  )
  const unlicensed = shields({ ...baseArgs })
  assertEquals(
    unlicensed.find((s) => s.name === 'License')?.linkUrl,
    'https://github.com/elcoosp/readma/blob/main/LICENSE.txt',
  )
})

Deno.test('shields - badges config', () => {
  const disabled = shields({
    ...baseArgs,
    badges: {
      disabled: ['issues', 'pullRequests', 'lastCommit', 'release', 'license'],
    },
  })
  const nameSet = new Set(disabled.map((s) => s.name))
  assertEquals(nameSet.has('Issues'), false)
  assertEquals(nameSet.has('Pull requests'), false)
  assertEquals(nameSet.has('Last commit'), false)
  assertEquals(nameSet.has('Release'), false)
  assertEquals(nameSet.has('License'), false)
  assertEquals(nameSet.has('Codecov'), true)
  const custom = shields({
    ...baseArgs,
    badges: {
      custom: [{
        name: 'Sponsor',
        image: 'https://img.shields.io/sponsor',
        link: 'https://sponsor',
      }],
    },
  })
  const sponsor = custom.find((s) => s.name === 'Sponsor')
  assertEquals(sponsor?.refName, 'sponsor')
  assertEquals(sponsor?.shieldUrl.includes('style=for-the-badge'), true)
  assertEquals(CONDITIONAL_BADGE_IDS, ['linkedin', 'msrv', 'registry'])
  const mapped = customBadgeToShield({
    name: 'Custom',
    image: 'https://image',
    link: 'https://link',
  })
  assertEquals(mapped, {
    name: 'Custom',
    refName: 'custom',
    linkUrl: 'https://link',
    shieldUrl: 'https://image',
  })
})

Deno.test('renderShields', () => {
  const { shieldsBadges, shieldsRefs } = renderShields([
    shield('Codecov', 'https://link', 'https://img', 'codecov'),
  ])
  assertEquals(shieldsBadges, '[![Codecov][codecov-shield]][codecov-url]')
  assertEquals(
    shieldsRefs,
    '[codecov-shield]: https://img\n[codecov-url]: https://link',
  )
})
