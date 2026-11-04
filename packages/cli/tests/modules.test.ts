import { assertEquals, assertInstanceOf, assertRejects } from '@std/assert'
import {
  configExtOf,
  loadConfig,
  loadConfigFile,
  validateConfig,
} from '../src/config.ts'
import { buildMemberConfig } from '../src/gen.ts'
import { detectWorkspace, getFolderName } from '../src/detect.ts'
import {
  generateInitConfig,
  parseGitRemote,
  runInit,
  STARTER_CONTENT_FILES,
} from '../src/init.ts'
import { log, logger, setLogLevel } from '../src/logger.ts'
import { configJsonSchema } from '../src/schema.ts'
import { runValidate } from '../src/validate.ts'
import { type ReadmaConfig, ReadmaError } from '@readma/core'

Deno.test('logger levels', () => {
  setLogLevel('warn')
  log('debug', 'hidden')
  log('warn', 'shown')
  setLogLevel('debug')
  logger.debug('debug message')
  logger.info('info message')
  logger.error('error message')
  setLogLevel('info')
})

Deno.test('getFolderName', () => {
  assertEquals(getFolderName('packages/core'), 'core')
  assertEquals(getFolderName('single'), 'single')
  assertEquals(getFolderName('a/b/'), 'b')
  assertEquals(getFolderName(''), '')
})

Deno.test('parseGitRemote', () => {
  assertEquals(parseGitRemote('git@github.com:elcoosp/readma.git'), {
    username: 'elcoosp',
    repoName: 'readma',
  })
  assertEquals(parseGitRemote('https://github.com/elcoosp/readma'), {
    username: 'elcoosp',
    repoName: 'readma',
  })
  assertEquals(parseGitRemote('http://github.com/elcoosp/readma.git'), {
    username: 'elcoosp',
    repoName: 'readma',
  })
  assertEquals(parseGitRemote('https://gitlab.com/elcoosp/readma.git'), {})
})

Deno.test('configExtOf', () => {
  assertEquals(configExtOf('/x/readma.yaml'), 'yaml')
  assertEquals(configExtOf('/x/readma.yml'), 'yml')
  assertEquals(configExtOf('/x/readma.toml'), 'toml')
  assertEquals(configExtOf('/x/readma.json'), 'json')
  const error = (() => {
    try {
      configExtOf('/x/readma.config.ts')
      return undefined
    } catch (error_) {
      return error_
    }
  })()
  assertInstanceOf(error, ReadmaError)
})

Deno.test('loadConfigFile parses every format', async () => {
  const dir = await Deno.makeTempDir()
  try {
    await Deno.writeTextFile(`${dir}/readma.yaml`, 'title: From Yaml\n')
    assertEquals(
      (await loadConfigFile(`${dir}/readma.yaml`)).title,
      'From Yaml',
    )
    await Deno.writeTextFile(`${dir}/readma.toml`, 'title = "From Toml"\n')
    assertEquals(
      (await loadConfigFile(`${dir}/readma.toml`)).title,
      'From Toml',
    )
    await Deno.writeTextFile(`${dir}/readma.json`, '{"title": "From Json"}')
    assertEquals(
      (await loadConfigFile(`${dir}/readma.json`)).title,
      'From Json',
    )
    await Deno.writeTextFile(`${dir}/broken.yaml`, 'title: [unclosed\n')
    const broken = await loadConfigFile(`${dir}/broken.yaml`).catch((e) => e)
    assertInstanceOf(broken, ReadmaError)
    await Deno.writeTextFile(`${dir}/readma.config.ts`, 'export default {}')
    const legacy = await loadConfigFile(`${dir}/readma.config.ts`).catch((e) =>
      e
    )
    assertInstanceOf(legacy, ReadmaError)
  } finally {
    await Deno.remove(dir, { recursive: true })
  }
})

Deno.test('loadConfig discovers the config file', async () => {
  const dir = await Deno.makeTempDir()
  try {
    const missing = await loadConfig(dir).catch((error) => error)
    assertInstanceOf(missing, ReadmaError)
    await Deno.writeTextFile(`${dir}/readma.json`, '{"title": "Json"}')
    const fromJson = await loadConfig(dir)
    assertEquals(fromJson.config.title, 'Json')
    assertEquals(fromJson.path, `${dir}/readma.json`)
    await Deno.writeTextFile(`${dir}/readma.yaml`, 'title: Yaml\n')
    const fromYaml = await loadConfig(dir)
    assertEquals(fromYaml.config.title, 'Yaml')
    const explicit = await loadConfig(dir, 'readma.json')
    assertEquals(explicit.config.title, 'Json')
  } finally {
    await Deno.remove(dir, { recursive: true })
  }
})

Deno.test('validateConfig aggregates issues', () => {
  const valid: ReadmaConfig = { title: 'T', repo: 'owner/name' }
  validateConfig(valid)
  const error = (() => {
    try {
      validateConfig({ title: '' })
      return undefined
    } catch (error_) {
      return error_
    }
  })()
  assertInstanceOf(error, ReadmaError)
  assertEquals((error as Error).message.includes('title'), true)
  assertEquals((error as Error).message.includes('repo'), false)
  const multi = (() => {
    try {
      validateConfig({ title: 'T', repo: 'nope', language: 'go' as 'ts' })
      return undefined
    } catch (error_) {
      return error_
    }
  })()
  assertInstanceOf(multi, ReadmaError)
  assertEquals((multi as Error).message.includes('repo'), true)
  assertEquals((multi as Error).message.includes('language'), true)
})

Deno.test('detectWorkspace', async (t) => {
  const mk = async (files: Record<string, string>): Promise<string> => {
    const dir = await Deno.makeTempDir()
    for (const [filePath, content] of Object.entries(files)) {
      const resolved = `${dir}/${filePath}`
      await Deno.mkdir(resolved.slice(0, resolved.lastIndexOf('/')), {
        recursive: true,
      })
      await Deno.writeTextFile(resolved, content)
    }
    return dir
  }
  const rm = (dir: string) => Deno.remove(dir, { recursive: true })

  await t.step('deno workspace with member configs', async () => {
    const dir = await mk({
      'deno.json': JSON.stringify({
        name: '@scope/root',
        description: 'Root',
        workspace: ['packages/core', 'packages/*'],
      }),
      'packages/core/deno.json': JSON.stringify({
        name: '@scope/core',
        description: 'Core package',
      }),
      'packages/cli/deno.json': JSON.stringify({ name: '@scope/cli' }),
    })
    try {
      const detection = await detectWorkspace(dir, {
        offline: true,
        repoScope: 'scope',
      })
      assertEquals(detection.language, 'ts')
      assertEquals(detection.packageRegistry, 'jsr')
      assertEquals(detection.members?.length, 2)
      const core = detection.members?.find((m) => m.path.endsWith('core'))
      assertEquals(core?.pkgName, '@scope/core')
      assertEquals(core?.description, 'Core package')
      const cli = detection.members?.find((m) => m.path.endsWith('cli'))
      assertEquals(cli?.pkgName, '@scope/cli')
      assertEquals(cli?.description, '-')
      assertEquals(detection.files.deno?.name, '@scope/root')
    } finally {
      await rm(dir)
    }
  })

  await t.step('deno workspace fetches missing descriptions', async () => {
    const dir = await mk({
      'deno.json': JSON.stringify({ workspace: ['packages/core'] }),
      'packages/core/deno.json': JSON.stringify({ name: '@scope/core' }),
    })
    try {
      let fetchCalls = 0
      const detection = await detectWorkspace(dir, {
        repoScope: 'scope',
        fetchFn: ((input: string | URL) => {
          fetchCalls++
          assertEquals(String(input).includes('jsr.io'), true)
          return Promise.resolve(
            Response.json({ description: 'Fetched desc' }, { status: 200 }),
          )
        }) as typeof fetch,
      })
      assertEquals(fetchCalls, 1)
      assertEquals(detection.members?.[0]?.description, 'Fetched desc')
    } finally {
      await rm(dir)
    }
  })

  await t.step('pnpm workspace members', async () => {
    const dir = await mk({
      'pnpm-workspace.yaml': 'packages:\n  - packages/**\n',
      'packages/a/package.json': JSON.stringify({
        name: 'pkg-a',
        description: 'Package A',
      }),
      'packages/b/package.json': JSON.stringify({ name: 'pkg-b' }),
      'packages/b/node_modules/ignore/package.json': '{}',
    })
    try {
      const detection = await detectWorkspace(dir)
      assertEquals(detection.packageRegistry, 'npm')
      assertEquals(detection.language, 'ts')
      const names = detection.members?.map((m) => m.pkgName).toSorted()
      assertEquals(names, ['pkg-a', 'pkg-b'])
      assertEquals(
        detection.members?.find((m) => m.pkgName === 'pkg-b')?.description,
        '-',
      )
    } finally {
      await rm(dir)
    }
  })

  await t.step('plain npm repo has no members', async () => {
    const dir = await mk({
      'package.json': JSON.stringify({ name: 'single-pkg' }),
    })
    try {
      const detection = await detectWorkspace(dir)
      assertEquals(detection.packageRegistry, 'npm')
      assertEquals(detection.language, 'ts')
      assertEquals(detection.members, undefined)
      assertEquals(detection.files.pkgJson?.name, 'single-pkg')
    } finally {
      await rm(dir)
    }
  })

  await t.step('deno and pnpm members fall back to folder names', async () => {
    const dir = await mk({
      'deno.json': JSON.stringify({ workspace: ['packages/noname'] }),
      'packages/noname/deno.json': '{}',
    })
    try {
      const detection = await detectWorkspace(dir, {
        offline: true,
        repoScope: 'scope',
      })
      assertEquals(detection.members?.[0]?.pkgName, '@scope/noname')
      assertEquals(detection.members?.[0]?.description, '-')
    } finally {
      await rm(dir)
    }
    const pnpmDir = await mk({
      'pnpm-workspace.yaml': 'packages:\n  - packages/**\n',
      'packages/nn/package.json': '{}',
    })
    try {
      const detection = await detectWorkspace(pnpmDir)
      assertEquals(detection.members?.[0]?.pkgName, 'nn')
      assertEquals(detection.members?.[0]?.description, '-')
    } finally {
      await rm(pnpmDir)
    }
  })
  await t.step(
    'cargo root without a workspace section has no members',
    async () => {
      const dir = await mk({
        'Cargo.toml': '[package]\nname = "solo"',
      })
      try {
        const detection = await detectWorkspace(dir)
        assertEquals(detection.members, [])
      } finally {
        await rm(dir)
      }
    },
  )
  await t.step('cargo members fall back to folder names', async () => {
    const dir = await mk({
      'Cargo.toml': '[workspace]\nmembers = ["crates/empty", "crates/named"]',
      'crates/empty/Cargo.toml': '',
      'crates/named/Cargo.toml':
        '[package]\nname = "named"\ndescription = "Named crate"',
    })
    try {
      const detection = await detectWorkspace(dir)
      assertEquals(detection.language, 'rs')
      assertEquals(detection.packageRegistry, 'crates.io')
      const empty = detection.members?.find((m) => m.pkgName === 'empty')
      assertEquals(empty?.description, '-')
      const named = detection.members?.find((m) => m.pkgName === 'named')
      assertEquals(named?.description, 'Named crate')
    } finally {
      await rm(dir)
    }
  })

  await t.step('root cargo package metadata is kept', async () => {
    const dir = await mk({
      'Cargo.toml': `[workspace]
members = ["crates/one", "crates/two"]

[package]
name = "root-crate"
description = "Root crate"`,
      'crates/one/Cargo.toml': `[package]
name = "crate-one"
description = "First crate"`,
      'crates/two/Cargo.toml': `[package]
name = "crate-two"`,
    })
    try {
      const detection = await detectWorkspace(dir)
      assertEquals(detection.language, 'rs')
      assertEquals(detection.packageRegistry, 'crates.io')
      assertEquals(detection.members?.length, 2)
      const one = detection.members?.find((m) => m.pkgName === 'crate-one')
      assertEquals(one?.description, 'First crate')
      const two = detection.members?.find((m) => m.pkgName === 'crate-two')
      assertEquals(two?.description, '-')
      assertEquals(detection.files.rs?.package?.name, 'root-crate')
    } finally {
      await rm(dir)
    }
  })

  await t.step(
    'deno workspace without workspace key has no members',
    async () => {
      const dir = await mk({
        'deno.json': JSON.stringify({ name: '@scope/single' }),
      })
      try {
        const detection = await detectWorkspace(dir, { offline: true })
        assertEquals(detection.packageRegistry, 'jsr')
        assertEquals(detection.members, [])
      } finally {
        await rm(dir)
      }
    },
  )

  await t.step('deno.jsonc and memberless deno config', async () => {
    const dir = await mk({
      'deno.jsonc': `{
  // comment
  "name": "@scope/jsonc-root",
  "workspace": ["packages/core"]
}`,
      'packages/core/deno.jsonc': `{ "name": "@scope/core" }`,
    })
    try {
      const detection = await detectWorkspace(dir, { offline: true })
      assertEquals(detection.packageRegistry, 'jsr')
      assertEquals(detection.files.deno?.name, '@scope/jsonc-root')
      assertEquals(detection.members?.[0]?.pkgName, '@scope/core')
    } finally {
      await rm(dir)
    }
  })
  await t.step('unreadable config file surfaces the error', async () => {
    const dir = await Deno.makeTempDir()
    try {
      await Deno.mkdir(`${dir}/deno.json`, { recursive: true })
      await assertRejects(() => detectWorkspace(dir))
    } finally {
      await rm(dir)
    }
  })
  await t.step('deno and cargo together is an error', async () => {
    const dir = await mk({
      'deno.json': '{}',
      'Cargo.toml': '[workspace]\nmembers = []',
    })
    try {
      const error = await assertRejects(() => detectWorkspace(dir))
      assertInstanceOf(error, ReadmaError)
      assertEquals(error.message.includes('both'), true)
    } finally {
      await rm(dir)
    }
  })

  await t.step('no known config is an error', async () => {
    const dir = await Deno.makeTempDir()
    try {
      await assertRejects(() => detectWorkspace(dir), ReadmaError)
    } finally {
      await rm(dir)
    }
  })
})

Deno.test('configJsonSchema', () => {
  const schema = configJsonSchema()
  assertEquals(typeof schema, 'object')
  assertEquals(schema.$schema, 'https://json-schema.org/draft/2020-12/schema')
  const properties = schema.properties as Record<string, unknown>
  assertEquals(typeof properties.title, 'object')
  assertEquals(typeof properties.sections, 'object')
  const badges = properties.badges as {
    properties: { disabled: { items: { enum: string[] } } }
  }
  assertEquals(
    badges.properties.disabled.items.enum.includes('registry'),
    true,
  )
})

Deno.test('generateInitConfig', async (t) => {
  const detection = {
    language: 'ts' as const,
    packageRegistry: 'jsr' as const,
    files: {},
  }
  await t.step('embeds detected values', () => {
    const content = generateInitConfig(detection, {
      username: 'octo',
      repoName: 'repo',
      licenseId: 'MIT',
    })
    assertEquals(content.includes('language: ts'), true)
    assertEquals(content.includes('repo: octo/repo'), true)
    assertEquals(content.includes('id: MIT'), true)
    assertEquals(content.includes('packageRegistry: jsr'), true)
    assertEquals(content.includes('title: repo'), true)
  })
  await t.step('falls back to placeholders', () => {
    const content = generateInitConfig(detection, {})
    assertEquals(content.includes('your-github-username'), true)
    assertEquals(content.includes('id: MIT'), true)
  })
})

Deno.test('STARTER_CONTENT_FILES', () => {
  const names = STARTER_CONTENT_FILES.map((file) => file.name)
  assertEquals(names, ['about.md', 'features.md', 'usage.md', 'roadmap.md'])
  for (const file of STARTER_CONTENT_FILES) {
    assertEquals(file.body.length > 0, true)
    assertEquals(
      /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(file.body),
      false,
    )
  }
})

Deno.test('runInit', async (t) => {
  const mk = async (files: Record<string, string>): Promise<string> => {
    const dir = await Deno.makeTempDir()
    for (const [filePath, content] of Object.entries(files)) {
      await Deno.writeTextFile(`${dir}/${filePath}`, content)
    }
    return dir
  }
  const rm = (dir: string) => Deno.remove(dir, { recursive: true })
  await t.step('scaffolds a config and content files', async () => {
    const dir = await mk({
      'package.json': JSON.stringify({ name: 'some-pkg' }),
      'LICENSE.txt': 'MIT License',
    })
    try {
      const result = await runInit({ rootPath: dir })
      assertEquals(result.written, true)
      assertEquals(result.configPath, `${dir}/readma.yaml`)
      const written = await Deno.readTextFile(result.configPath)
      assertEquals(written, result.content)
      assertEquals(written.includes('id: MIT'), true)
      assertEquals(result.files.length, STARTER_CONTENT_FILES.length)
      const about = await Deno.readTextFile(`${dir}/readma/about.md`)
      assertEquals(about.length > 0, true)
    } finally {
      await rm(dir)
    }
  })
  await t.step('refuses to overwrite without force', async () => {
    const dir = await mk({
      'package.json': '{}',
      'readma.yaml': 'title: Existing\n',
    })
    try {
      const error = await assertRejects(() => runInit({ rootPath: dir }))
      assertInstanceOf(error, ReadmaError)
      assertEquals(error.message.includes('--force'), true)
      const forced = await runInit({ rootPath: dir, force: true })
      assertEquals(forced.written, true)
      const overwritten = await Deno.readTextFile(`${dir}/readma.yaml`)
      assertEquals(overwritten !== 'title: Existing\n', true)
    } finally {
      await rm(dir)
    }
  })
  await t.step('keeps existing content files', async () => {
    const dir = await Deno.makeTempDir()
    try {
      await Deno.writeTextFile(`${dir}/package.json`, '{}')
      await Deno.mkdir(`${dir}/readma`, { recursive: true })
      await Deno.writeTextFile(`${dir}/readma/about.md`, 'Custom about\n')
      await runInit({ rootPath: dir, force: true })
      const about = await Deno.readTextFile(`${dir}/readma/about.md`)
      assertEquals(about, 'Custom about\n')
    } finally {
      await Deno.remove(dir, { recursive: true })
    }
  })
  await t.step('dryRun skips the write', async () => {
    const dir = await mk({ 'package.json': '{}' })
    try {
      const result = await runInit({ rootPath: dir, dryRun: true })
      assertEquals(result.written, false)
      const stat = await Deno.stat(`${dir}/readma.yaml`).catch(() => undefined)
      assertEquals(stat, undefined)
      const contentDir = await Deno.stat(`${dir}/readma`).catch(() => undefined)
      assertEquals(contentDir, undefined)
    } finally {
      await rm(dir)
    }
  })
  await t.step('custom config path', async () => {
    const dir = await mk({ 'package.json': '{}' })
    try {
      const result = await runInit({
        rootPath: dir,
        configPath: 'custom.yaml',
      })
      assertEquals(result.configPath, `${dir}/custom.yaml`)
    } finally {
      await rm(dir)
    }
  })
})

Deno.test('runValidate', async (t) => {
  const mk = async (files: Record<string, string>): Promise<string> => {
    const dir = await Deno.makeTempDir()
    for (const [filePath, content] of Object.entries(files)) {
      const resolved = `${dir}/${filePath}`
      await Deno.mkdir(resolved.slice(0, resolved.lastIndexOf('/')), {
        recursive: true,
      })
      await Deno.writeTextFile(resolved, content)
    }
    return dir
  }
  const rm = (dir: string) => Deno.remove(dir, { recursive: true })
  const validConfig = `title: T
repo: octo/repo
contact:
  email: me@gmail.com
images:
  logo: logo.png
  screenshot: shot.png
issueTemplates:
  bug: bug.yml
  feature: feat.yml
coc: .github/CODE_OF_CONDUCT.md
license:
  id: MIT
  file: LICENSE.txt
`
  const fullFixture = {
    'readma.yaml': validConfig,
    'logo.png': 'logo',
    'shot.png': 'shot',
    'LICENSE.txt': 'MIT License',
    'readma/about.md': 'About body\n',
    'readma/empty.md': '\n',
    '.github/CODE_OF_CONDUCT.md': '# coc',
    '.github/ISSUE_TEMPLATE/bug.yml': "title: Bug\nlabels: ['bug']",
    '.github/ISSUE_TEMPLATE/feat.yml': "title: Feat\nlabels: ['feat']",
  }
  await t.step('valid project reports only warnings', async () => {
    const dir = await mk(fullFixture)
    try {
      const result = await runValidate({ rootPath: dir })
      assertEquals(result.ok, true)
      assertEquals(result.issues.length, 1)
      assertEquals(result.issues[0].level, 'warn')
      assertEquals(result.issues[0].message.includes('empty.md'), true)
    } finally {
      await rm(dir)
    }
  })
  await t.step('missing fields and files are errors', async () => {
    const dir = await mk({
      'readma.yaml': `title: T
repo: octo/repo
language: go
images:
  logo: missing-logo.png
issueTemplates:
  bug: nope.yml
  feature: nope2.yml
coc: missing-coc.md
`,
    })
    try {
      const result = await runValidate({ rootPath: dir })
      assertEquals(result.ok, false)
      const messages = result.issues.map((issue) => issue.message).join('\n')
      assertEquals(messages.includes('logo'), true)
      assertEquals(messages.includes('nope.yml'), true)
      assertEquals(messages.includes('nope2.yml'), true)
      assertEquals(messages.includes('missing-coc.md'), true)
      assertEquals(messages.includes('language'), true)
    } finally {
      await rm(dir)
    }
  })
  await t.step('a broken config file is an error', async () => {
    const dir = await mk({ 'readma.yaml': 'title: [unclosed\n' })
    try {
      const result = await runValidate({ rootPath: dir })
      assertEquals(result.ok, false)
      assertEquals(result.issues[0].level, 'error')
    } finally {
      await rm(dir)
    }
  })
  await t.step('a missing config file is an error', async () => {
    const dir = await Deno.makeTempDir()
    try {
      const result = await runValidate({ rootPath: dir })
      assertEquals(result.ok, false)
      assertEquals(result.issues[0].message.includes('Could not find'), true)
    } finally {
      await rm(dir)
    }
  })
  await t.step('broken front matter is an error', async () => {
    const dir = await mk({
      'readma.yaml': validConfig,
      'logo.png': 'logo',
      'shot.png': 'shot',
      'LICENSE.txt': 'MIT License',
      'readma/about.md': '---\ntitle: [broken\n---\nbody\n',
      '.github/CODE_OF_CONDUCT.md': '# coc',
      '.github/ISSUE_TEMPLATE/bug.yml': "title: Bug\nlabels: ['bug']",
      '.github/ISSUE_TEMPLATE/feat.yml': "title: Feat\nlabels: ['feat']",
    })
    try {
      const result = await runValidate({ rootPath: dir })
      assertEquals(result.ok, false)
      const messages = result.issues.map((issue) => issue.message).join('\n')
      assertEquals(messages.includes('front matter'), true)
    } finally {
      await rm(dir)
    }
  })
  await t.step('a legacy mdx file is a warning', async () => {
    const dir = await mk({
      'readma.yaml': validConfig,
      'logo.png': 'logo',
      'shot.png': 'shot',
      'LICENSE.txt': 'MIT License',
      'readma/about.md': 'About\n',
      'readma/legacy.mdx': 'Legacy\n',
      '.github/CODE_OF_CONDUCT.md': '# coc',
      '.github/ISSUE_TEMPLATE/bug.yml': "title: Bug\nlabels: ['bug']",
      '.github/ISSUE_TEMPLATE/feat.yml': "title: Feat\nlabels: ['feat']",
    })
    try {
      const result = await runValidate({ rootPath: dir })
      assertEquals(result.ok, true)
      const warnings = result.issues.filter((issue) => issue.level === 'warn')
      assertEquals(
        warnings.some((issue) => issue.message.includes('legacy.mdx')),
        true,
      )
    } finally {
      await rm(dir)
    }
  })
  await t.step('a fully valid project has no issues at all', async () => {
    const dir = await mk({
      ...fullFixture,
      'readma/empty.md': 'Not empty anymore\n',
    })
    try {
      const result = await runValidate({ rootPath: dir })
      assertEquals(result.issues, [])
      assertEquals(result.ok, true)
    } finally {
      await rm(dir)
    }
  })
  await t.step('an explicit missing content dir is an error', async () => {
    const dir = await mk({
      'readma.yaml': 'title: T\ncontent:\n  dir: gone\n',
    })
    try {
      const result = await runValidate({ rootPath: dir })
      assertEquals(result.ok, false)
      assertEquals(
        result.issues.some((issue) => issue.message.includes('gone')),
        true,
      )
    } finally {
      await rm(dir)
    }
  })
})

Deno.test('buildMemberConfig', () => {
  const config: ReadmaConfig = { title: 'T', language: undefined }
  const member = { pkgName: 'pkg-x', path: 'packages/x', description: '-' }
  const memberConfig = buildMemberConfig(config, member, 'ts', 'npm')
  assertEquals(memberConfig.workspaceMember, member)
  assertEquals(memberConfig.language, 'ts')
  assertEquals(memberConfig.packageRegistry, 'npm')
  const keepsDetection = buildMemberConfig(
    { title: 'T', language: 'rs' },
    member,
    'ts',
    'npm',
  )
  assertEquals(keepsDetection.language, 'ts')
  assertEquals(keepsDetection.packageRegistry, 'npm')
  const fallsBackToConfig = buildMemberConfig(
    { title: 'T', packageRegistry: 'jsr' },
    member,
    undefined,
    undefined,
  )
  assertEquals(fallsBackToConfig.packageRegistry, 'jsr')
})

Deno.test('runValidate with a relative configPath', async () => {
  const dir = await Deno.makeTempDir()
  try {
    await Deno.writeTextFile(
      `${dir}/readma.yaml`,
      'title: T\nrepo: octo/repo\nimages:\n  logo: logo.png\n',
    )
    await Deno.writeTextFile(`${dir}/logo.png`, 'logo')
    const result = await runValidate({
      rootPath: dir,
      configPath: 'readma.yaml',
    })
    assertEquals(result.issues, [])
    assertEquals(result.ok, true)
  } finally {
    await Deno.remove(dir, { recursive: true })
  }
})

Deno.test('runValidate with an unreadable config path', async () => {
  const dir = await Deno.makeTempDir()
  try {
    await Deno.mkdir(`${dir}/readma.yaml`)
    const result = await runValidate({ rootPath: dir })
    assertEquals(result.ok, false)
    assertEquals(result.issues.length, 1)
    assertEquals(result.issues[0].level, 'error')
  } finally {
    await Deno.remove(dir, { recursive: true })
  }
})
