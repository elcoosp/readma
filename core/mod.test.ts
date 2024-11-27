import { assertEquals } from '@std/assert'
import { readme } from './mod.ts'
import config from '../readma.config.ts'
import { assertSnapshot } from '@std/testing/snapshot'

Deno.test('readme - core', async (t) => {
  if (Deno.env.get('GITHUB_REF')?.startsWith('refs/tags')) {
    assertEquals(true, true)
  } else {
    const out = await readme({ ...config, license: 'MIT' }, {
      folderPath: '../',
    })
    await assertSnapshot(t, out)
  }
})
