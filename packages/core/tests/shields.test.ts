import { assertSnapshot } from '@std/testing/snapshot'
import { shields } from '../src/shields.ts'
const shieldsConfig = {
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
Deno.test('shields - ts', async (t) => {
  const actual = shields(shieldsConfig)
  await assertSnapshot(t, actual)
})

Deno.test('shields - rs', async (t) => {
  const actual = shields({ ...shieldsConfig, language: 'rs' })
  await assertSnapshot(t, actual)
})

Deno.test('shields - linkedinUsername', async (t) => {
  const actual = shields({ ...shieldsConfig, linkedinUsername: 'test' })
  await assertSnapshot(t, actual)
})

Deno.test('shields - packageRegistry', async (t) => {
  const jsr = shields({ ...shieldsConfig, packageRegistry: 'jsr' })
  await assertSnapshot(t, jsr)
  const cratesIo = shields({
    ...shieldsConfig,
    packageRegistry: 'crates.io',
    language: 'rs',
  })
  await assertSnapshot(t, cratesIo)
})
