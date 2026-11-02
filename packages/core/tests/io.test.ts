import { assertEquals, assertInstanceOf, assertRejects } from '@std/assert'
import {
  defaultIo,
  detectBranch,
  detectLicense,
  getReadmaConfig,
  io,
  LICENSE_FILENAMES,
  matchLicense,
  readOptionalFile,
  resetIo,
  setIo,
} from '../src/io.ts'
import { ReadmaError } from '../src/utils.ts'

Deno.test('md helpers and errors', async (t) => {
  await t.step('readOptionalFile returns undefined when missing', async () => {
    const missing = await readOptionalFile('/tmp/does-not-exist-readma-xyz')
    assertEquals(missing, undefined)
  })
  await t.step('readOptionalFile propagates non NotFound errors', async () => {
    setIo({
      readTextFile: () => Promise.reject(new Error('boom')),
    })
    try {
      await assertRejects(
        () => readOptionalFile('some-path'),
        Error,
        'boom',
      )
    } finally {
      resetIo()
    }
  })
  await t.step('matchLicense detects every supported license', () => {
    assertEquals(matchLicense('MIT License\n\nCopyright'), 'MIT')
    assertEquals(
      matchLicense('Apache License Version 2.0'),
      'Apache-2.0',
    )
    assertEquals(
      matchLicense('Mozilla Public License Version 2.0'),
      'MPL-2.0',
    )
    assertEquals(
      matchLicense('GNU GENERAL PUBLIC LICENSE Version 3'),
      'GPL-3.0',
    )
    assertEquals(
      matchLicense(' Redistribution and use in BSD 3-Clause '),
      'BSD-3-Clause',
    )
    assertEquals(matchLicense('something else entirely'), undefined)
  })
  await t.step('detectLicense finds the first matching file', async () => {
    const dir = await Deno.makeTempDir()
    try {
      assertEquals(await detectLicense(dir), {})
      await Deno.writeTextFile(`${dir}/LICENSE`, 'Apache License Version 2.0')
      const detected = await detectLicense(dir)
      assertEquals(detected.file, 'LICENSE')
      assertEquals(detected.id, 'Apache-2.0')
      await Deno.writeTextFile(`${dir}/LICENSE.txt`, 'MIT License')
      const withTxt = await detectLicense(dir)
      assertEquals(withTxt.file, 'LICENSE.txt')
      assertEquals(withTxt.id, 'MIT')
      assertEquals(LICENSE_FILENAMES[0], 'LICENSE.txt')
    } finally {
      await Deno.remove(dir, { recursive: true })
    }
  })
  await t.step('detectBranch reads the git branch', async () => {
    const result = await detectBranch('.')
    assertEquals(typeof result, 'string')
    assertEquals(result.length > 0, true)
  })
  await t.step('detectBranch falls back to main', async () => {
    setIo({
      runCommand: () =>
        Promise.resolve({ success: true, stdout: 'HEAD\n', stderr: '' }),
    })
    try {
      assertEquals(await detectBranch('.'), 'main')
    } finally {
      resetIo()
    }
    setIo({
      runCommand: () =>
        Promise.resolve({ success: false, stdout: '', stderr: 'err' }),
    })
    try {
      assertEquals(await detectBranch('.'), 'main')
    } finally {
      resetIo()
    }
  })
  await t.step('defaultIo.runCommand runs a real command', async () => {
    resetIo()
    const result = await io.runCommand({
      cmd: 'git',
      args: ['--version'],
    })
    assertEquals(result.success, true)
    assertEquals(result.stdout.includes('git version'), true)
  })
  await t.step('defaultIo.fetch wraps the global fetch', async () => {
    resetIo()
    const response = await defaultIo.fetch('data:text/plain,readma')
    assertEquals(await response.text(), 'readma')
  })
})

Deno.test('detectBranch reads github env', async (t) => {
  await t.step('GITHUB_HEAD_REF wins', async () => {
    Deno.env.set('GITHUB_HEAD_REF', 'feature-branch')
    try {
      assertEquals(await detectBranch('.'), 'feature-branch')
    } finally {
      Deno.env.delete('GITHUB_HEAD_REF')
    }
  })
  await t.step('GITHUB_REF_NAME is a fallback', async () => {
    Deno.env.set('GITHUB_REF_NAME', 'refs-tag')
    try {
      assertEquals(await detectBranch('.'), 'refs-tag')
    } finally {
      Deno.env.delete('GITHUB_REF_NAME')
    }
  })
})

Deno.test('getReadmaConfig', async (t) => {
  const dir = await Deno.makeTempDir()
  try {
    await t.step('loads from a root folder', async () => {
      await Deno.writeTextFile(
        `${dir}/readma.config.ts`,
        `const config = { language: 'ts', title: 'Folder' }
export default config`,
      )
      const config = await getReadmaConfig(dir)
      assertEquals(config.title, 'Folder')
    })
    await t.step('loads from a direct file path', async () => {
      const filePath = `${dir}/custom.config.ts`
      await Deno.writeTextFile(
        filePath,
        `const config = { language: 'rs', title: 'File' }
export default config`,
      )
      const config = await getReadmaConfig(filePath)
      assertEquals(config.title, 'File')
    })
    await t.step('throws when the default export is missing', async () => {
      await Deno.writeTextFile(
        `${dir}/invalid.config.ts`,
        `export const notDefault = 1`,
      )
      const error = await assertRejects(
        () => getReadmaConfig(`${dir}/invalid.config.ts`),
        ReadmaError,
      )
      assertInstanceOf(error, ReadmaError)
      assertEquals(error.name, 'ReadmaError')
    })
  } finally {
    await Deno.remove(dir, { recursive: true })
  }
})
