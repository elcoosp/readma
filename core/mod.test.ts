import { assertEquals } from '@std/assert'
import { assertSnapshot } from '@std/testing/snapshot'
import config from '../readma.config.ts'
import { readme } from './mod.ts'

Deno.test('readme - core', async (t) => {
  if (Deno.env.get('GITHUB_REF')?.startsWith('refs/tags')) {
    assertEquals(true, true)
  } else {
    const out = await readme({ ...config, license: 'MIT' }, {
      dryRun: true,
      workspaceRootPath: '../',
    })
    await assertSnapshot(t, out)
  }
})
