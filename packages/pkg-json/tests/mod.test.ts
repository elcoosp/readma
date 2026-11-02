import { assertEquals, assertRejects } from '@std/assert'
import { loadPkgJson } from '../src/mod.ts'

Deno.test('loadPkgJson', async (t) => {
  const dir = await Deno.makeTempDir()
  try {
    await t.step('loads a valid package.json', async () => {
      await Deno.writeTextFile(
        `${dir}/package.json`,
        JSON.stringify({
          name: '@scope/pkg',
          version: '1.0.0',
          description: 'A package',
        }),
      )
      const pkg = await loadPkgJson(dir)
      assertEquals(pkg.name, '@scope/pkg')
      assertEquals(pkg.version, '1.0.0')
      assertEquals(pkg.description, 'A package')
    })
    await t.step('throws when the file is missing', async () => {
      const error = await assertRejects(() =>
        loadPkgJson(`${dir}/nope`)
      ) as Error
      assertEquals(error.message.includes('package.json'), true)
    })
    await t.step('throws on invalid json', async () => {
      await Deno.mkdir(`${dir}/broken`, { recursive: true })
      await Deno.writeTextFile(`${dir}/broken/package.json`, '{invalid')
      const error = await assertRejects(() =>
        loadPkgJson(`${dir}/broken`)
      ) as Error
      assertEquals(error.message.includes('parse'), true)
    })
    await t.step('rethrows non NotFound errors', async () => {
      await Deno.mkdir(`${dir}/isdir/package.json`, { recursive: true })
      await assertRejects(() => loadPkgJson(`${dir}/isdir`))
    })
  } finally {
    await Deno.remove(dir, { recursive: true })
  }
})
