import { assertEquals, assertRejects } from '@std/assert'
import { assertSnapshot } from '@std/testing/snapshot'
import { resetIo, setIo } from '../src/io.ts'
import { readme, writeReadme } from '../src/templates.ts'
import type { ContentFile, ReadmaConfig } from '../src/types.ts'

/** Emoji and pictograph ranges, the generated readme must never contain them */
const EMOJI_RE =
  /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}]/u

const baseConfig: ReadmaConfig = {
  title: 'Readma',
  description: 'Beautiful effortless README generator',
  repo: 'elcoosp/readma',
  author: 'elcoosp',
  contact: { email: 'elcoosp@gmail.com', x: 'elcoosp' },
  links: { doc: 'https://readma.vercel.app/', demo: 'https://demo.readma.dev' },
  language: 'ts',
  packageRegistry: 'jsr',
  images: { logo: 'images/logo.png', screenshot: 'images/shot.gif' },
  repobeats: 'abc123',
  license: { id: 'MIT' },
  issueTemplates: { bug: 'bug-report.yml', feature: 'feature-request.yml' },
  toc: { backToTop: false },
  content: { dir: 'readma' },
}

const baseContent: ContentFile[] = [
  { id: 'about', file: 'about.md', body: 'Create README that rocks' },
  {
    id: 'features',
    file: 'features.md',
    body: '- Workspace compatible\n- Automatic shields',
  },
  { id: 'usage', file: 'usage.md', body: 'Refer to the docs' },
  { id: 'roadmap', file: 'roadmap.md', body: '- [x] CLI with config file' },
  {
    id: 'acknowledgments',
    file: 'acknowledgments.md',
    body:
      '- [Best Readme](https://github.com/othneildrew/Best-README-Template)',
  },
  {
    id: 'support',
    file: 'support.md',
    title: 'Support',
    body: 'Still **very early**',
  },
]

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
    const out = await readme(baseConfig, {
      workspaceRootPath: dir,
      content: baseContent,
    })
    await t.step('contains the header blocks', () => {
      assertEquals(out.includes('<a id="readme-top"></a>'), true)
      assertEquals(out.includes('<h3 align="center">Readma</h3>'), true)
      assertEquals(
        out.includes(
          '<img src="https://raw.githubusercontent.com/elcoosp/readma/HEAD/images/logo.png"',
        ),
        true,
      )
      assertEquals(
        out.includes(
          '<a href="https://readma.vercel.app/"><strong>Explore the docs »</strong></a>',
        ),
        true,
      )
      assertEquals(out.includes('View Demo'), true)
      assertEquals(out.includes('Report Bug'), true)
      assertEquals(out.includes('Request Feature'), true)
      assertEquals(
        out.includes('issues/new?template=bug-report.yml'),
        true,
      )
      assertEquals(out.includes('Beautiful effortless README generator'), true)
    })
    await t.step('contains every section with clean anchors', () => {
      assertEquals(out.includes('#about'), true)
      assertEquals(out.includes('## About'), true)
      assertEquals(out.includes('## Features'), true)
      assertEquals(out.includes('## Usage'), true)
      assertEquals(out.includes('## Support'), true)
      assertEquals(out.includes('## Contact'), true)
      assertEquals(out.includes('elcoosp@gmail.com'), true)
      assertEquals(out.includes('## License'), true)
      assertEquals(out.includes('test-branch/LICENSE.txt">MIT license'), true)
      assertEquals(EMOJI_RE.test(out), false)
    })
    await t.step('omits absent sections', () => {
      assertEquals(out.includes('## Contributing'), false)
      assertEquals(out.includes('## Getting started'), false)
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

Deno.test('readme renders a minimal config with no repo and no content', async () => {
  stubBranchIo()
  const dir = await Deno.makeTempDir()
  try {
    const out = await readme({ title: 'Tiny' }, { workspaceRootPath: dir })
    assertEquals(out.includes('<h3 align="center">Tiny</h3>'), true)
    assertEquals(out.includes('img'), false)
    assertEquals(out.includes('shields.io'), false)
    assertEquals(out.includes('View Demo'), false)
    assertEquals(EMOJI_RE.test(out), false)
  } finally {
    await Deno.remove(dir, { recursive: true })
    resetIo()
  }
})

Deno.test('readme loads content from the content directory', async () => {
  stubBranchIo()
  const dir = await Deno.makeTempDir()
  try {
    await Deno.mkdir(`${dir}/readma`)
    await Deno.writeTextFile(`${dir}/readma/about.md`, 'Loaded from disk')
    const out = await readme({ title: 'Disk' }, { workspaceRootPath: dir })
    assertEquals(out.includes('Loaded from disk'), true)
    assertEquals(out.includes('## About'), true)
  } finally {
    await Deno.remove(dir, { recursive: true })
    resetIo()
  }
})

Deno.test('readme renders custom header and footer files', async () => {
  stubBranchIo()
  const dir = await Deno.makeTempDir()
  try {
    const out = await readme(baseConfig, {
      workspaceRootPath: dir,
      content: [
        ...baseContent,
        {
          id: 'header',
          file: 'header.md',
          body: 'Custom header banner',
          special: 'header',
        },
        {
          id: 'footer',
          file: 'footer.md',
          body: 'Custom footer note',
          special: 'footer',
        },
      ],
    })
    assertEquals(out.includes('Custom header banner'), true)
    assertEquals(out.includes('Custom footer note'), true)
    assertEquals(
      out.indexOf('Custom header banner') < out.indexOf('## About'),
      true,
    )
    assertEquals(
      out.indexOf('Custom footer note') > out.indexOf('## Usage'),
      true,
    )
  } finally {
    await Deno.remove(dir, { recursive: true })
    resetIo()
  }
})

Deno.test('readme workspace member and root members', async () => {
  stubBranchIo()
  const dir = await Deno.makeTempDir()
  try {
    const memberConfig: ReadmaConfig = {
      ...baseConfig,
      workspaceMember: {
        pkgName: '@readma/core',
        path: 'packages/core',
        description: '-',
      },
    }
    const memberOut = await readme(memberConfig, {
      workspaceRootPath: dir,
      content: baseContent,
    })
    assertEquals(
      memberOut.includes('<h4 align="center">@readma/core</h4>'),
      true,
    )
    assertEquals(
      memberOut.includes('You are inside the **@readma/core**'),
      true,
    )
    assertEquals(memberOut.includes('not the repository entry point'), true)
    assertEquals(memberOut.includes('## Installation'), true)
    assertEquals(
      memberOut.includes('```sh\ndeno add @readma/core\n```'),
      true,
    )
    const rootConfig: ReadmaConfig = {
      ...baseConfig,
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
    const rootOut = await readme(rootConfig, {
      workspaceRootPath: dir,
      content: baseContent,
    })
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
    const tocConfig: ReadmaConfig = {
      ...baseConfig,
      toc: { title: 'Sommaire', backToTop: true },
    }
    const withToc = await readme(tocConfig, {
      workspaceRootPath: dir,
      content: baseContent,
    })
    assertEquals(withToc.includes('<summary>Sommaire</summary>'), true)
    assertEquals(withToc.includes('back to top'), true)
    const hiddenConfig: ReadmaConfig = {
      ...baseConfig,
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
    const hidden = await readme(hiddenConfig, {
      workspaceRootPath: dir,
      content: baseContent,
    })
    assertEquals(hidden.includes('TABLE OF CONTENTS'), false)
    assertEquals(hidden.includes('Issues['), false)
    assertEquals(hidden.includes('Sponsor'), true)
    assertEquals(hidden.includes('repobeats'), false)
    assertEquals(hidden.includes('flat-square'), false)
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
      const out = await writeReadme(baseConfig, {
        workspaceRootPath: dir,
        folderPath: dir,
        dryRun: true,
        content: baseContent,
      })
      assertEquals(out.length > 0, true)
      const stat = await Deno.stat(`${dir}/README.md`).catch(() => undefined)
      assertEquals(stat, undefined)
    })
    await t.step('writes the README.md', async () => {
      await writeReadme(baseConfig, {
        workspaceRootPath: dir,
        folderPath: dir,
        content: baseContent,
      })
      const written = await Deno.readTextFile(`${dir}/README.md`)
      assertEquals(
        written,
        await readme(baseConfig, {
          workspaceRootPath: dir,
          content: baseContent,
        }),
      )
    })
    await t.step(
      'default folderPath follows the workspace member',
      async () => {
        await Deno.mkdir(`${dir}/packages/m`, { recursive: true })
        await writeReadme(
          {
            ...baseConfig,
            workspaceMember: {
              pkgName: '@s/m',
              path: 'packages/m',
              description: '-',
            },
          },
          { workspaceRootPath: dir, content: baseContent },
        )
        const memberWritten = await Deno.readTextFile(
          `${dir}/packages/m/README.md`,
        )
        assertEquals(memberWritten.includes('readme-top'), true)
        await writeReadme(baseConfig, {
          workspaceRootPath: dir,
          content: baseContent,
        })
        const rootWritten = await Deno.readTextFile(`${dir}/README.md`)
        assertEquals(rootWritten.includes('readme-top'), true)
      },
    )
    await t.step('throws when the folder is missing', async () => {
      const error = await assertRejects(() =>
        writeReadme(baseConfig, {
          workspaceRootPath: dir,
          folderPath: `${dir}/nope/missing`,
          content: baseContent,
        })
      )
      assertEquals((error as Error).message.includes('folder to exist'), true)
    })
  } finally {
    await Deno.remove(dir, { recursive: true })
    resetIo()
  }
})
