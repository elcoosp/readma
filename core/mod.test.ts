import { assertEquals } from '@std/assert'
import { readme } from './mod.ts'
import config from '../readma.config.ts'

Deno.test('readme', async () => {
  const current = await Deno.readTextFile('../README.md')
  if (Deno.env.get('GITHUB_REF')?.startsWith('refs/tags')) {
    assertEquals(true, true)
  } else {
    const out = await readme({ ...config, license: 'MIT' }, {
      folderPath: '../',
    })
    assertEquals(out, current)
  }
})
