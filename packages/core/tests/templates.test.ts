import { assertEquals, assertRejects } from '@std/assert'
import { assertSnapshot } from '@std/testing/snapshot'
import { resetIo, setIo } from '../src/io.ts'
import { readme, writeReadme } from '../src/templates.ts'
import type { ReadmeTemplateArgs } from '../src/types.ts'

const baseArgs: ReadmeTemplateArgs = {
  language: 'ts',
  title: 'Readma',
  author: 'elcoosp',
  githubUsername: 'elcoosp',
  repoName: 'readma',
  xHandle: 'elcoosp',
  domain: 'gmail',
  email: 'elcoosp',
  urls: { doc: 'https://readma.vercel.app/' },
  repobeats: 'abc123',
  images: { screenshot: 'images/screenshot.gif', logo: 'images/logo.png' },
  sections: {
    features: `
- Workspace compatible
- Automatic shields`,
    projectDescription: 'Beautiful effortless README generator',
    about: 'Create README that rocks',
    installation: '```sh\ndeno install @readma/core\n```',
    acknowledgments: `
- [Best Readme](https://github.com/othneildrew/Best-README-Template)`,
    gettingStarted: 'See screenshot',
    usage: 'Refer to the docs',
    roadmap: `
- [x] CLI with config file`,
    '⛑️ Support': 'Still **very early**',
  },
  template: { bugReport: 'bug-report.yml', featRequest: 'feature-request.yml' },
  backToTop: false,
  license: 'MIT',
}

function stubBranchIo(): void {
  setIo({
    runCommand: () =>
      Promise.resolve({ success: true, stdout: 'test-branch\n', stderr: '' }),
  })
}

Deno.test('readme renders the full document', async (t) => {
  stubBranchIo()
  const dir = await Deno.makeTempDir()
  try {
    const out = await readme(baseArgs, { workspaceRootPath: dir })
    await t.step('contains the header blocks', () => {
      assertEquals(out.includes('<a id="readme-top"></a>'), true)
      assertEquals(out.includes('<h3 align="center">Readma</h3>'), true)
      assertEquals(
        out.includes('<strong>📖 Explore the docs »</strong>'),
        true,
      )
      assertEquals(out.includes('Report Bug'), true)
      assertEquals(out.includes('issues/new?template=bug-report.yml'), true)
      assertEquals(
        out.includes('issues/new?template=feature-request.yml'),
        true,
      )
    })
    await t.step('contains every section with anchors', () => {
      assertEquals(out.includes('#-about-the-project'), true)
      assertEquals(out.includes('#-features'), true)
      assertEquals(out.includes('## 📨 Contact'), true)
      assertEquals(out.includes('elcoosp@gmail.com'), true)
      assertEquals(out.includes('## ⛑️ Support'), true)
      assertEquals(out.includes('## 📄 License'), true)
      assertEquals(
        out.includes('blob/master/LICENSE.txt">MIT license'),
        true,
      )
    })
    await t.step('omits empty sections', () => {
      const withoutContributing = out
      assertEquals(withoutContributing.includes('## 💻 Contributing'), false)
    })
    await t.step('closes the markdown comments footer', () => {
      assertEquals(out.includes('<!--MARKDOWN LINKS & IMAGES-->'), true)
      assertEquals(
        out.includes('repobeats.axiom.co/api/embed/abc123.svg'),
        true,
      )
      assertEquals(out.endsWith('\n'), true)
    })
    await t.step('snapshot stays stable', async () => {
      await assertSnapshot(t, out)
    })
  } finally {
    await Deno.remove(dir, { recursive: true })
    resetIo()
  }
})

Deno.test('readme workspace member and root members', async () => {
  stubBranchIo()
  const dir = await Deno.makeTempDir()
  try {
    const memberArgs: ReadmeTemplateArgs = {
      ...baseArgs,
      workspaceMember: {
        pkgName: '@readma/core',
        path: 'packages/core',
        description: '-',
      },
      packageRegistry: 'jsr',
    }
    const memberOut = await readme(memberArgs, { workspaceRootPath: dir })
    assertEquals(
      memberOut.includes('<h4 align="center">@readma/core</h4>'),
      true,
    )
    assertEquals(
      memberOut.includes('You are inside the **@readma/core**'),
      true,
    )
    assertEquals(memberOut.includes('not the repository entry point'), true)
    assertEquals(memberOut.includes('## 📋 Installation'), true)
    const rootArgs: ReadmeTemplateArgs = {
      ...baseArgs,
      root: {
        members: [
          {
            pkgName: '@readma/core',
            path: 'packages/core',
            description: 'Core',
          },
          { pkgName: '@readma/cli', path: 'packages/cli', description: 'CLI' },
        ],
      },
    }
    const rootOut = await readme(rootArgs, { workspaceRootPath: dir })
    assertEquals(rootOut.includes('[@readma/core](packages/core)'), true)
    assertEquals(rootOut.includes('| Core'), true)
    assertEquals(rootOut.includes('entry point of **readma** workspace'), true)
  } finally {
    await Deno.remove(dir, { recursive: true })
    resetIo()
  }
})

Deno.test('readme toc and badge options', async () => {
  stubBranchIo()
  const dir = await Deno.makeTempDir()
  try {
    const tocArgs: ReadmeTemplateArgs = {
      ...baseArgs,
      backToTop: true,
      toc: { title: 'Sommaire' },
    }
    const withToc = await readme(tocArgs, { workspaceRootPath: dir })
    assertEquals(withToc.includes('<summary>Sommaire</summary>'), true)
    assertEquals(withToc.includes('back to top'), true)
    const hiddenArgs: ReadmeTemplateArgs = {
      ...baseArgs,
      toc: { hide: true },
      badges: {
        disabled: ['issues', 'release'],
        custom: [
          {
            name: 'Sponsor',
            image: 'https://img.shields.io/sponsor',
            link: 'https://sponsor',
          },
        ],
      },
      repobeats: undefined,
    }
    const hidden = await readme(hiddenArgs, { workspaceRootPath: dir })
    assertEquals(hidden.includes('TABLE OF CONTENTS'), false)
    assertEquals(hidden.includes('Issues['), false)
    assertEquals(hidden.includes('Sponsor'), true)
    assertEquals(hidden.includes('repobeats'), false)
  } finally {
    await Deno.remove(dir, { recursive: true })
    resetIo()
  }
})

Deno.test('writeReadme writes and honours dryRun', async (t) => {
  stubBranchIo()
  const dir = await Deno.makeTempDir()
  try {
    await t.step('dryRun skips the write', async () => {
      const out = await writeReadme(baseArgs, {
        workspaceRootPath: dir,
        folderPath: dir,
        dryRun: true,
      })
      assertEquals(out.length > 0, true)
      const stat = await Deno.stat(`${dir}/README.md`).catch(() => undefined)
      assertEquals(stat, undefined)
    })
    await t.step('writes the README.md', async () => {
      await writeReadme(baseArgs, {
        workspaceRootPath: dir,
        folderPath: dir,
      })
      const written = await Deno.readTextFile(`${dir}/README.md`)
      assertEquals(written, await readme(baseArgs, { workspaceRootPath: dir }))
    })
    await t.step(
      'default folderPath follows the workspace member',
      async () => {
        await Deno.mkdir(`${dir}/packages/m`, { recursive: true })
        await writeReadme(
          {
            ...baseArgs,
            workspaceMember: {
              pkgName: '@s/m',
              path: 'packages/m',
              description: '-',
            },
          },
          { workspaceRootPath: dir, dryRun: false },
        )
        const memberWritten = await Deno.readTextFile(
          `${dir}/packages/m/README.md`,
        )
        assertEquals(memberWritten.includes('readme-top'), true)
        await writeReadme(baseArgs, { workspaceRootPath: dir, dryRun: false })
        const rootWritten = await Deno.readTextFile(`${dir}/README.md`)
        assertEquals(rootWritten.includes('readme-top'), true)
      },
    )
    await t.step('throws when the folder is missing', async () => {
      const error = await assertRejects(() =>
        writeReadme(baseArgs, {
          workspaceRootPath: dir,
          folderPath: `${dir}/nope/missing`,
        })
      )
      assertEquals((error as Error).message.includes('folder to exist'), true)
    })
  } finally {
    await Deno.remove(dir, { recursive: true })
    resetIo()
  }
})
