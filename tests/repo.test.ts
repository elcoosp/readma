/**
 * Root level tests which dogfood the readma repository itself.
 * They only run from the repository root because they rely on the repo config.
 */
import { assertEquals } from '@std/assert'
import { loadConfig } from '../packages/cli/src/config.ts'
import { runInit } from '../packages/cli/src/init.ts'
import { runValidate } from '../packages/cli/src/validate.ts'

Deno.test('loadConfig without a path reads the repo config', async () => {
  const { config } = await loadConfig()
  assertEquals(config.title, 'Readma')
  assertEquals(config.repo, 'elcoosp/readma')
})

Deno.test('runValidate on the readma repo itself', async () => {
  const result = await runValidate()
  assertEquals(result.ok, true)
  assertEquals(result.issues, [])
})

Deno.test('runInit with an absolute config path', async () => {
  const dir = await Deno.makeTempDir()
  try {
    await Deno.writeTextFile(
      `${dir}/package.json`,
      JSON.stringify({ name: 'abs-pkg' }),
    )
    const result = await runInit({
      configPath: `${dir}/abs.config.yaml`,
    })
    assertEquals(result.configPath, `${dir}/abs.config.yaml`)
    assertEquals(result.written, true)
  } finally {
    await Deno.remove(dir, { recursive: true })
  }
})

Deno.test('runGen defaults to the repository root', async () => {
  const { runGen } = await import('../packages/cli/src/gen.ts')
  const result = await runGen({ dryRun: true, offline: true, rootOnly: true })
  assertEquals(result.rendered.length, 1)
  assertEquals(result.rendered[0].content.includes('Readma'), true)
})
