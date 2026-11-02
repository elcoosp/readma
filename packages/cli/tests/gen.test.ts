import { assertEquals, assertRejects } from '@std/assert'
import { resetIo, setIo } from '@readma/core'
import { CHECK_EXIT_CODE, runCli, VALIDATE_EXIT_CODE } from '../src/cli.ts'
import { type GenOptions, runGen } from '../src/gen.ts'
import { detectGithubRemote, parseGitRemote } from '../src/init.ts'
import '../src/mod.ts'

/** Build a pnpm style workspace fixture with a full readma config */
async function makeWorkspace(): Promise<string> {
  const dir = await Deno.makeTempDir()
  const files: Record<string, string> = {
    'pnpm-workspace.yaml': 'packages:\n  - packages/**\n',
    'readma.config.ts': `export default {
  language: 'ts',
  title: 'Test Repo',
  author: 'octo',
  githubUsername: 'octo',
  repoName: 'test-repo',
  xHandle: 'octo',
  domain: 'gmail',
  email: 'octo',
  backToTop: false,
  images: { logo: 'logo.png' },
  template: { bugReport: 'bug.yml', featRequest: 'feat.yml' },
  license: 'MIT',
  sections: {
    features: 'Feature list',
    projectDescription: 'A test project',
    about: 'About body',
    installation: '',
    acknowledgments: 'Thanks',
    gettingStarted: 'Start here',
    roadmap: 'Roadmap body',
    usage: 'Usage body',
    '🧪 Custom': 'Custom body',
  },
}`,
    'logo.png': 'logo',
    'LICENSE.txt': 'MIT License',
    '.github/ISSUE_TEMPLATE/bug.yml':
      "title: Bug\nlabels: ['bug']\nassignees: []",
    '.github/ISSUE_TEMPLATE/feat.yml':
      "title: Feat\nlabels: ['feat']\nassignees: []",
    'packages/a/package.json': JSON.stringify({
      name: 'pkg-a',
      description: 'Package A',
    }),
    'packages/a/readma/sections/features.mdx': 'Custom **features** body',
    'packages/b/package.json': JSON.stringify({ name: 'pkg-b' }),
  }
  for (const [filePath, content] of Object.entries(files)) {
    const resolved = `${dir}/${filePath}`
    await Deno.mkdir(resolved.slice(0, resolved.lastIndexOf('/')), {
      recursive: true,
    })
    await Deno.writeTextFile(resolved, content)
  }
  return dir
}

const baseOpts: GenOptions = { rootPath: '.', verbose: true }

Deno.test('runGen writes member and root readmes', async (t) => {
  const dir = await makeWorkspace()
  try {
    await t.step('full generation', async () => {
      const result = await runGen({ ...baseOpts, rootPath: dir })
      assertEquals(result.written.length, 3)
      assertEquals(
        result.written.some((p) => p.endsWith('packages/a/README.md')),
        true,
      )
      assertEquals(
        result.written.some((p) => p.endsWith('packages/b/README.md')),
        true,
      )
      assertEquals(
        result.written.some((p) =>
          p.endsWith('/README.md') && !p.includes('packages/')
        ),
        true,
      )
      const memberA = result.rendered.find((r) =>
        r.path.endsWith('packages/a/README.md')
      )
      assertEquals(
        memberA?.content.includes('Custom <strong>features</strong> body'),
        true,
      )
      assertEquals(memberA?.content.includes('pkg-a'), true)
      assertEquals(memberA?.content.includes('pnpm add pkg-a'), true)
      const root = result.rendered.find((r) =>
        r.path.endsWith('/README.md') && !r.path.includes('packages/')
      )
      assertEquals(root?.content.includes('A test project'), true)
      assertEquals(root?.content.includes('## 🧪 Custom'), true)
      assertEquals(root?.content.includes('[pkg-a](packages/a)'), true)
      assertEquals(root?.content.includes('Package A'), true)
      assertEquals(root?.content.includes('MIT license'), true)
      const memberB = result.rendered.find((r) =>
        r.path.endsWith('packages/b/README.md')
      )
      assertEquals(memberB?.content.includes('pnpm add pkg-b'), true)
    })
    await t.step('check mode detects out of sync files', async () => {
      await Deno.writeTextFile(`${dir}/packages/a/README.md`, 'stale')
      const result = await runGen({ ...baseOpts, rootPath: dir, check: true })
      assertEquals(result.changed.length, 1)
      assertEquals(result.changed[0].endsWith('packages/a/README.md'), true)
      await runGen({ ...baseOpts, rootPath: dir })
      const clean = await runGen({ ...baseOpts, rootPath: dir, check: true })
      assertEquals(clean.changed.length, 0)
    })
    await t.step('dryRun does not write', async () => {
      await Deno.writeTextFile(`${dir}/packages/b/README.md`, 'untouched')
      const result = await runGen({ ...baseOpts, rootPath: dir, dryRun: true })
      assertEquals(result.written.length, 0)
      assertEquals(result.rendered.length, 3)
      assertEquals(
        await Deno.readTextFile(`${dir}/packages/b/README.md`),
        'untouched',
      )
    })
    await t.step('rootOnly and membersOnly', async () => {
      const rootOnly = await runGen({
        ...baseOpts,
        rootPath: dir,
        rootOnly: true,
      })
      assertEquals(rootOnly.rendered.length, 1)
      assertEquals(rootOnly.rendered[0].path.endsWith('/README.md'), true)
      const membersOnly = await runGen({
        ...baseOpts,
        rootPath: dir,
        membersOnly: true,
      })
      assertEquals(membersOnly.rendered.length, 2)
    })
    await t.step('member filter', async () => {
      const filtered = await runGen({
        ...baseOpts,
        rootPath: dir,
        member: 'packages/a',
        membersOnly: true,
      })
      assertEquals(filtered.rendered.length, 1)
      assertEquals(
        filtered.rendered[0].path.endsWith('packages/a/README.md'),
        true,
      )
      const absolute = await runGen({
        ...baseOpts,
        rootPath: dir,
        member: `${dir}/packages/b`,
        membersOnly: true,
      })
      assertEquals(absolute.rendered.length, 1)
      assertEquals(
        absolute.rendered[0].path.endsWith('packages/b/README.md'),
        true,
      )
      const error = await assertRejects(() =>
        runGen({ ...baseOpts, rootPath: dir, member: 'packages/unknown' })
      )
      assertEquals((error as Error).message.includes('packages/unknown'), true)
    })
    await t.step('stdout prints without writing', async () => {
      await Deno.writeTextFile(`${dir}/packages/b/README.md`, 'untouched')
      const result = await runGen({ ...baseOpts, rootPath: dir, stdout: true })
      assertEquals(result.written.length, 0)
      assertEquals(result.rendered.length, 3)
      assertEquals(
        await Deno.readTextFile(`${dir}/packages/b/README.md`),
        'untouched',
      )
    })
    await t.step('custom mdx section and installation override', async () => {
      await Deno.mkdir(`${dir}/packages/b/readma/sections`, { recursive: true })
      await Deno.writeTextFile(
        `${dir}/packages/b/readma/sections/installation.mdx`,
        'Custom install',
      )
      const result = await runGen({
        ...baseOpts,
        rootPath: dir,
        member: 'packages/b',
        membersOnly: true,
      })
      assertEquals(result.rendered[0].content.includes('Custom install'), true)
      await Deno.remove(`${dir}/packages/b/readma`, { recursive: true })
    })
    await t.step('broken mdx section falls back to config', async () => {
      await Deno.mkdir(`${dir}/packages/b/readma/sections`, { recursive: true })
      await Deno.writeTextFile(
        `${dir}/packages/b/readma/sections/features.mdx`,
        '<NotAComponent />',
      )
      const result = await runGen({
        ...baseOpts,
        rootPath: dir,
        member: 'packages/b',
        membersOnly: true,
      })
      assertEquals(result.rendered[0].content.includes('Feature list'), true)
      await Deno.remove(`${dir}/packages/b/readma`, { recursive: true })
    })
  } finally {
    await Deno.remove(dir, { recursive: true })
  }
})

Deno.test('runGen validates the config', async () => {
  const dir = await Deno.makeTempDir()
  try {
    await Deno.writeTextFile(
      `${dir}/package.json`,
      JSON.stringify({ name: 'pkg' }),
    )
    await Deno.writeTextFile(
      `${dir}/readma.config.ts`,
      'export default { language: "ts" }',
    )
    const error = await assertRejects(() => runGen({ rootPath: dir }))
    assertEquals((error as Error).message.includes('Missing required'), true)
  } finally {
    await Deno.remove(dir, { recursive: true })
  }
})

Deno.test('runGen on a single npm package', async () => {
  const dir = await Deno.makeTempDir()
  try {
    await Deno.writeTextFile(
      `${dir}/package.json`,
      JSON.stringify({ name: 'npm-pkg', description: 'A single npm package' }),
    )
    await Deno.writeTextFile(
      `${dir}/readma.config.ts`,
      `export default {
  language: 'ts', title: 'Npm Pkg', author: 'octo', githubUsername: 'octo',
  repoName: 'npm-pkg', xHandle: 'octo', domain: 'gmail', email: 'octo',
  backToTop: false, images: { logo: 'logo.png' },
  template: { bugReport: 'bug.yml', featRequest: 'feat.yml' },
  license: 'MIT',
  sections: {
    features: 'f', projectDescription: 'p', about: 'a', installation: '',
    acknowledgments: 'k', gettingStarted: 'g', roadmap: 'r', usage: 'u',
  },
}`,
    )
    const result = await runGen({
      rootPath: dir,
      configPath: 'readma.config.ts',
      dryRun: true,
    })
    assertEquals(result.rendered.length, 1)
    assertEquals(result.rendered[0].path, `${dir}/README.md`)
    assertEquals(result.rendered[0].content.includes('pnpm add npm-pkg'), true)
    assertEquals(
      result.rendered[0].content.includes('A single npm package') === false,
      true,
    )
  } finally {
    await Deno.remove(dir, { recursive: true })
  }
})

Deno.test('runCli end to end', async (t) => {
  const dir = await makeWorkspace()
  try {
    await t.step('schema subcommand prints json', async () => {
      const logs: string[] = []
      const originalLog = console.log
      console.log = (message: string) => logs.push(message)
      try {
        await runCli(['schema'])
      } finally {
        console.log = originalLog
      }
      const printed = logs.join('\n')
      assertEquals(JSON.parse(printed).properties.sections !== undefined, true)
    })
    await t.step('main command warns', async () => {
      const logs: string[] = []
      const originalLog = console.log
      console.log = (message: string) => logs.push(message)
      try {
        await runCli([])
        await runCli(['--debug'])
      } finally {
        console.log = originalLog
      }
      assertEquals(logs.join('\n').includes('subcommands'), true)
    })
    await t.step('gen stdout through the command', async () => {
      const logs: string[] = []
      const originalLog = console.log
      console.log = (message: string) => logs.push(message)
      try {
        await runCli(['--root', dir, 'gen', '--stdout', '--debug'])
      } finally {
        console.log = originalLog
      }
      const printed = logs.join('\n')
      assertEquals(printed.includes('A test project'), true)
    })
    await t.step('gen check returns the check exit code', async () => {
      await Deno.writeTextFile(`${dir}/packages/b/README.md`, 'stale')
      const exitCode = await runCli(['--root', dir, 'gen', '--check'])
      assertEquals(exitCode, CHECK_EXIT_CODE)
      assertEquals(CHECK_EXIT_CODE, 2)
      await runCli(['--root', dir, 'gen'])
      const clean = await runCli(['--root', dir, 'gen', '--check'])
      assertEquals(clean, 0)
    })
    await t.step('init scaffolds through the command', async () => {
      const initDir = `${dir}/init-target`
      await Deno.mkdir(initDir)
      await Deno.writeTextFile(
        `${initDir}/package.json`,
        JSON.stringify({ name: 'init-pkg' }),
      )
      setIo({
        runCommand: ({ args }) =>
          Promise.resolve({
            success: true,
            stdout: args.includes('remote.origin.url')
              ? 'git@github.com:octocat/init-repo.git\n'
              : '',
            stderr: '',
          }),
      })
      try {
        const exitCode = await runCli([
          '--root',
          initDir,
          'init',
          '--dry-run',
          '--debug',
        ])
        assertEquals(exitCode, 0)
        const forced = await runCli([
          '--root',
          initDir,
          'init',
          '--force',
          '--config',
          'custom.config.ts',
        ])
        assertEquals(forced, 0)
      } finally {
        resetIo()
      }
      const written = await Deno.readTextFile(`${initDir}/custom.config.ts`)
      assertEquals(written.includes('octocat'), true)
      assertEquals(written.includes('init-repo'), true)
    })
    await t.step('validate returns the validate exit code', async () => {
      const exitCode = await runCli(['--root', dir, 'validate', '--debug'])
      assertEquals(exitCode, 0)
      const emptyDir = `${dir}/empty-target`
      await Deno.mkdir(emptyDir)
      await Deno.writeTextFile(
        `${emptyDir}/readma.config.ts`,
        'export default {}',
      )
      const failing = await runCli(['--root', emptyDir, 'validate'])
      assertEquals(failing, VALIDATE_EXIT_CODE)
      assertEquals(VALIDATE_EXIT_CODE, 1)
    })
  } finally {
    await Deno.remove(dir, { recursive: true })
  }
})

Deno.test('detectGithubRemote', async (t) => {
  await t.step('parses the local remote', async () => {
    const { username, repoName } = await detectGithubRemote('.')
    assertEquals(typeof username === 'string' || username === undefined, true)
    assertEquals(typeof repoName === 'string' || repoName === undefined, true)
  })
  await t.step('falls back to empty outside a git repo', async () => {
    const dir = await Deno.makeTempDir()
    try {
      assertEquals(await detectGithubRemote(dir), {})
    } finally {
      await Deno.remove(dir, { recursive: true })
    }
  })
  await t.step('survives a failing git command', async () => {
    setIo({
      runCommand: () => Promise.reject(new Error('git missing')),
    })
    try {
      assertEquals(await detectGithubRemote('.'), {})
    } finally {
      resetIo()
    }
  })
  await t.step('parseGitRemote edge cases', () => {
    assertEquals(parseGitRemote(''), {})
    assertEquals(parseGitRemote('git@github.com:octo/repo'), {
      username: 'octo',
      repoName: 'repo',
    })
  })
})

Deno.test('runGen on deno and cargo workspaces', async (t) => {
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
  const config = `export default {
  language: 'ts', title: 'Ws', author: 'octo', githubUsername: 'octo',
  repoName: 'ws', xHandle: 'octo', domain: 'gmail', email: 'octo',
  backToTop: false, images: { logo: 'logo.png' },
  template: { bugReport: 'bug.yml', featRequest: 'feat.yml' },
  sections: {
    features: 'f', projectDescription: 'p', about: 'a', installation: '',
    acknowledgments: 'k', gettingStarted: 'g', roadmap: 'r', usage: 'u',
  },
}`
  await t.step('deno workspace uses the root deno name', async () => {
    const dir = await mk({
      'deno.json': JSON.stringify({
        name: '@scope/root',
        workspace: ['packages/core'],
      }),
      'packages/core/deno.json': JSON.stringify({ name: '@scope/core' }),
      'readma.config.ts': config,
    })
    try {
      const result = await runGen({
        rootPath: dir,
        dryRun: true,
        offline: true,
      })
      const root = result.rendered.find((r) => r.path === `${dir}/README.md`)
      assertEquals(root?.content.includes('deno add @scope/root'), true)
      const member = result.rendered.find((r) =>
        r.path === `${dir}/packages/core/README.md`
      )
      assertEquals(member?.content.includes('deno add @scope/core'), true)
    } finally {
      await Deno.remove(dir, { recursive: true })
    }
  })
  await t.step('cargo workspace uses the root crate name', async () => {
    const cargoConfig = config.replace("language: 'ts'", "language: 'rs'")
    const dir = await mk({
      'Cargo.toml':
        '[workspace]\nmembers = ["crates/one"]\n\n[package]\nname = "root-crate"',
      'crates/one/Cargo.toml':
        '[package]\nname = "crate-one"\ndescription = "One"',
      'readma.config.ts': cargoConfig,
    })
    try {
      const result = await runGen({ rootPath: dir, dryRun: true })
      const root = result.rendered.find((r) => r.path === `${dir}/README.md`)
      assertEquals(root?.content.includes('cargo add root-crate'), true)
      const member = result.rendered.find((r) =>
        r.path === `${dir}/crates/one/README.md`
      )
      assertEquals(member?.content.includes('cargo add crate-one'), true)
    } finally {
      await Deno.remove(dir, { recursive: true })
    }
  })
})

Deno.test('cli entry point runs as main module', async () => {
  const modPath = new URL('../src/mod.ts', import.meta.url).pathname
  const command = new Deno.Command(Deno.execPath(), {
    args: ['run', '-A', modPath, 'schema'],
    stdout: 'null',
    stderr: 'null',
    env: {
      ...Deno.env.toObject(),
      DENO_COVERAGE_DIR: 'cov',
    },
  })
  const { success } = await command.output()
  assertEquals(success, true)
})
