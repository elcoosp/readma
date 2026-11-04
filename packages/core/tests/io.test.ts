import { assertEquals, assertRejects } from '@std/assert'
import {
  defaultIo,
  detectBranch,
  detectLicense,
  findConfigFile,
  io,
  LICENSE_FILENAMES,
  matchLicense,
  readOptionalFile,
  resetIo,
  setIo,
} from '../src/io.ts'

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

Deno.test('findConfigFile', async (t) => {
  const dir = await Deno.makeTempDir()
  try {
    await t.step('returns undefined without a config', async () => {
      assertEquals(await findConfigFile(dir), undefined)
    })
    await t.step('honours the detection order', async () => {
      await Deno.writeTextFile(`${dir}/readma.toml`, 'title = "Toml"')
      await Deno.writeTextFile(`${dir}/readma.json`, '{"title": "Json"}')
      const found = await findConfigFile(dir)
      assertEquals(found, `${dir}/readma.toml`)
      await Deno.remove(`${dir}/readma.toml`)
      await Deno.writeTextFile(`${dir}/readma.yaml`, 'title: Yaml')
      assertEquals(await findConfigFile(dir), `${dir}/readma.yaml`)
      assertEquals(
        await findConfigFile(dir, ['readma.json']),
        `${dir}/readma.json`,
      )
    })
    await t.step('survives unreadable candidates', async () => {
      const brokenDir = `${dir}/broken-${Date.now()}`
      await Deno.mkdir(`${brokenDir}/readma.yml`, { recursive: true })
      await Deno.writeTextFile(`${brokenDir}/readma.json`, '{"title": "J"}')
      assertEquals(
        await findConfigFile(brokenDir),
        `${brokenDir}/readma.json`,
      )
    })
  } finally {
    await Deno.remove(dir, { recursive: true })
  }
})

Deno.test('readOptionalFile honours NotFound named errors', async () => {
  setIo({
    readTextFile: () => {
      const error = new Error('missing')
      error.name = 'NotFound'
      return Promise.reject(error)
    },
  })
  try {
    assertEquals(await readOptionalFile('some-path'), undefined)
  } finally {
    resetIo()
  }
})
