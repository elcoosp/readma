import { assertSnapshot } from '@std/testing/snapshot'
import { loadPkgJson } from '../src/mod.ts'
Deno.test('mod', async (t) => {
  await assertSnapshot(t, await loadPkgJson('.'))
})
