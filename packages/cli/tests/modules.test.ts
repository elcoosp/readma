import { assertEquals, assertInstanceOf, assertRejects } from '@std/assert'
import { missingConfigFields, validateConfig } from '../src/config.ts'
import { buildMemberArgs, resolveInstallation } from '../src/gen.ts'
import { detectWorkspace, getFolderName } from '../src/detect.ts'
import { generateInitConfig, parseGitRemote, runInit } from '../src/init.ts'
import { log, logger, setLogLevel } from '../src/logger.ts'
import { configJsonSchema } from '../src/schema.ts'
import { runValidate } from '../src/validate.ts'
import { ReadmaError, type ReadmeTemplateArgs } from '@readma/core'

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

Deno.test('config validation', () => {
  const completeArgs = {
    language: 'ts',
    title: 'T',
    author: 'A',
    githubUsername: 'g',
    repoName: 'r',
    xHandle: 'x',
    domain: 'd',
    email: 'e',
    backToTop: false,
    images: { logo: 'l.png' },
    template: { bugReport: 'b.yml', featRequest: 'f.yml' },
    sections: {
      features: 'f',
      projectDescription: 'p',
      about: 'a',
      installation: 'i',
      acknowledgments: 'k',
      gettingStarted: 'g',
      roadmap: 'r',
      usage: 'u',
    },
  } as unknown as ReadmeTemplateArgs
  assertEquals(missingConfigFields(completeArgs), [])
  validateConfig(completeArgs)
  const missing = missingConfigFields({} as ReadmeTemplateArgs)
  assertEquals(missing.length > 10, true)
  const error = (() => {
    try {
      validateConfig({} as ReadmeTemplateArgs)
      return undefined
    } catch (error_) {
      return error_
    }
  })()
  assertInstanceOf(error, ReadmaError)
  assertEquals((error as Error).message.includes('Missing required'), true)
})

Deno.test('configJsonSchema', () => {
  const schema = configJsonSchema()
  assertEquals(typeof schema, 'object')
  assertEquals(schema.$schema, 'https://json-schema.org/draft/2020-12/schema')
  const parsed = structuredClone(schema) as {
    properties: {
      sections: Record<string, unknown>
      badges: { properties: { disabled: { items: { enum: string[] } } } }
    }
  }
  assertEquals(typeof parsed.properties.sections, 'object')
  assertEquals(
    parsed.properties.badges.properties.disabled.items.enum.includes(
      'registry',
    ),
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
    assertEquals(content.includes("language: 'ts'"), true)
    assertEquals(content.includes("githubUsername: 'octo'"), true)
    assertEquals(content.includes("license: 'MIT'"), true)
    assertEquals(content.includes("packageRegistry: 'jsr'"), true)
  })
  await t.step('falls back to placeholders', () => {
    const content = generateInitConfig(detection, {})
    assertEquals(content.includes('your-github-username'), true)
    assertEquals(content.includes("license: 'MIT'"), true)
  })
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
  await t.step('scaffolds a config from the detected project', async () => {
    const dir = await mk({
      'package.json': JSON.stringify({ name: 'some-pkg' }),
      'LICENSE.txt': 'MIT License',
    })
    try {
      const result = await runInit({ rootPath: dir })
      assertEquals(result.written, true)
      assertEquals(result.configPath, `${dir}/readma.config.ts`)
      const written = await Deno.readTextFile(result.configPath)
      assertEquals(written, result.content)
      assertEquals(written.includes("license: 'MIT'"), true)
    } finally {
      await rm(dir)
    }
  })
  await t.step('refuses to overwrite without force', async () => {
    const dir = await mk({
      'package.json': '{}',
      'readma.config.ts': 'export default {}',
    })
    try {
      const error = await assertRejects(() => runInit({ rootPath: dir }))
      assertInstanceOf(error, ReadmaError)
      assertEquals(error.message.includes('--force'), true)
      const forced = await runInit({ rootPath: dir, force: true })
      assertEquals(forced.written, true)
    } finally {
      await rm(dir)
    }
  })
  await t.step('dryRun skips the write', async () => {
    const dir = await mk({ 'package.json': '{}' })
    try {
      const result = await runInit({ rootPath: dir, dryRun: true })
      assertEquals(result.written, false)
      const stat = await Deno.stat(`${dir}/readma.config.ts`).catch(() =>
        undefined
      )
      assertEquals(stat, undefined)
    } finally {
      await rm(dir)
    }
  })
  await t.step('custom config path', async () => {
    const dir = await mk({ 'package.json': '{}' })
    try {
      const result = await runInit({
        rootPath: dir,
        configPath: 'custom.config.ts',
      })
      assertEquals(result.configPath, `${dir}/custom.config.ts`)
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
  const validConfig = `export default {
  language: 'ts',
  title: 'T',
  author: 'A',
  githubUsername: 'g',
  repoName: 'r',
  xHandle: 'x',
  domain: 'd',
  email: 'e',
  backToTop: false,
  images: { logo: 'logo.png', screenshot: 'shot.png' },
  template: { bugReport: 'bug.yml', featRequest: 'feat.yml' },
  coc: '.github/CODE_OF_CONDUCT.md',
  licenseFile: 'LICENSE.txt',
  sections: {
    features: 'f', projectDescription: 'p', about: 'a', installation: 'i',
    acknowledgments: 'k', gettingStarted: 'g', roadmap: 'r', usage: 'u',
    emptySection: '',
  },
}`
  const fullFixture = {
    'readma.config.ts': validConfig,
    'logo.png': 'logo',
    'shot.png': 'shot',
    'LICENSE.txt': 'MIT License',
    '.github/CODE_OF_CONDUCT.md': '# coc',
    '.github/ISSUE_TEMPLATE/bug.yml':
      "title: Bug\nlabels: ['bug']\nassignees: []",
    '.github/ISSUE_TEMPLATE/feat.yml':
      "title: Feat\nlabels: ['feat']\nassignees: []",
  }
  await t.step('valid project reports only warnings', async () => {
    const dir = await mk(fullFixture)
    try {
      const result = await runValidate({ rootPath: dir })
      assertEquals(result.ok, true)
      assertEquals(result.issues.length, 1)
      assertEquals(result.issues[0].level, 'warn')
      assertEquals(result.issues[0].message.includes('emptySection'), true)
    } finally {
      await rm(dir)
    }
  })
  await t.step('missing fields and files are errors', async () => {
    const dir = await mk({
      'readma.config.ts': `export default {
  language: 'ts', title: 'T', author: 'A', githubUsername: 'g', repoName: 'r',
  xHandle: 'x', domain: 'd', email: 'e', backToTop: false,
  images: { logo: 'missing-logo.png' },
  template: { bugReport: 'nope.yml', featRequest: 'nope2.yml' },
  coc: 'missing-coc.md',
  license: 'MIT',
  sections: { features: 'f', projectDescription: 'p', about: 'a', installation: 'i', acknowledgments: 'k', gettingStarted: 'g', roadmap: 'r', usage: 'u' },
}`,
    })
    try {
      const result = await runValidate({ rootPath: dir })
      assertEquals(result.ok, false)
      const messages = result.issues.map((issue) => issue.message).join('\n')
      assertEquals(messages.includes('logo'), true)
      assertEquals(messages.includes('nope.yml'), true)
      assertEquals(messages.includes('nope2.yml'), true)
      assertEquals(messages.includes('missing-coc.md'), true)
      assertEquals(messages.includes('LICENSE.txt found'), true)
    } finally {
      await rm(dir)
    }
  })
  await t.step('missing licenseFile is an error', async () => {
    const dir = await mk({
      'readma.config.ts': `export default {
  language: 'ts', title: 'T', author: 'A', githubUsername: 'g', repoName: 'r',
  xHandle: 'x', domain: 'd', email: 'e', backToTop: false,
  images: { logo: 'l.png' },
  template: { bugReport: 'b.yml', featRequest: 'f.yml' },
  licenseFile: 'gone.txt',
  sections: { features: 'f', projectDescription: 'p', about: 'a', installation: 'i', acknowledgments: 'k', gettingStarted: 'g', roadmap: 'r', usage: 'u' },
}`,
    })
    try {
      const result = await runValidate({ rootPath: dir })
      assertEquals(
        result.issues.some((issue) => issue.message.includes('gone.txt')),
        true,
      )
    } finally {
      await rm(dir)
    }
  })
  await t.step('a fully valid project has no issues at all', async () => {
    const dir = await mk({
      ...fullFixture,
      'readma.config.ts': validConfig.replace("emptySection: '',", ''),
    })
    try {
      const result = await runValidate({ rootPath: dir })
      assertEquals(result.issues, [])
      assertEquals(result.ok, true)
    } finally {
      await rm(dir)
    }
  })
  await t.step('missing required fields are listed', async () => {
    const dir = await mk({ 'readma.config.ts': 'export default {}' })
    try {
      const result = await runValidate({ rootPath: dir })
      assertEquals(result.ok, false)
      assertEquals(result.issues.length > 10, true)
    } finally {
      await rm(dir)
    }
  })
})

Deno.test('buildMemberArgs and resolveInstallation units', async () => {
  const config = {
    language: 'ts',
    sections: { features: 'f', installation: '' },
  } as unknown as ReadmeTemplateArgs
  const member = { pkgName: 'pkg-x', path: 'packages/x', description: '-' }
  const withoutRegistry = await buildMemberArgs(config, member, 'ts', undefined)
  assertEquals(
    withoutRegistry.sections.installation,
    '',
  )
  assertEquals(withoutRegistry.workspaceMember, member)
  const withRegistry = await buildMemberArgs(config, member, 'ts', 'npm', {
    verbose: true,
  })
  assertEquals(
    withRegistry.sections.installation.includes('pnpm add pkg-x'),
    true,
  )
  assertEquals(
    resolveInstallation(undefined, 'p', 'ts', undefined),
    '',
  )
  assertEquals(
    resolveInstallation('Config install', 'p', 'ts', 'npm'),
    'Config install',
  )
  assertEquals(
    resolveInstallation(undefined, 'p', 'rs', 'crates.io'),
    '```sh\ncargo add p\n```',
  )
})

Deno.test('runValidate with a relative configPath', async () => {
  const validConfig = `export default {
  language: 'ts', title: 'T', author: 'A', githubUsername: 'g', repoName: 'r',
  xHandle: 'x', domain: 'd', email: 'e', backToTop: false,
  images: { logo: 'logo.png' },
  template: { bugReport: 'bug.yml', featRequest: 'feat.yml' },
  sections: {
    features: 'f', projectDescription: 'p', about: 'a', installation: 'i',
    acknowledgments: 'k', gettingStarted: 'g', roadmap: 'r', usage: 'u',
    numeric: 42,
  },
}`
  const dir = await Deno.makeTempDir()
  try {
    await Deno.writeTextFile(`${dir}/logo.png`, 'logo')
    await Deno.writeTextFile(`${dir}/readma.config.ts`, validConfig)
    await Deno.mkdir(`${dir}/.github/ISSUE_TEMPLATE`, { recursive: true })
    await Deno.writeTextFile(
      `${dir}/.github/ISSUE_TEMPLATE/bug.yml`,
      'title: Bug',
    )
    await Deno.writeTextFile(
      `${dir}/.github/ISSUE_TEMPLATE/feat.yml`,
      'title: Feat',
    )
    const result = await runValidate({
      rootPath: dir,
      configPath: 'readma.config.ts',
    })
    assertEquals(result.ok, true)
    assertEquals(result.issues, [])
  } finally {
    await Deno.remove(dir, { recursive: true })
  }
})
