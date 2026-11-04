import { assertEquals } from '@std/assert'
import type { ReadmaContext } from '../src/context.ts'
import {
  assembleSections,
  installSnippet,
  markdownMembersTable,
  markdownTable,
  renderSections,
  sectionOrderFor,
  sectionTitleFor,
} from '../src/sections.ts'
import type { ContentFile, ReadmaConfig } from '../src/types.ts'

const baseConfig: ReadmaConfig = {
  title: 'Test',
  repo: 'me/test-repo',
  description: 'A description',
  author: 'me',
  contact: { email: 'me@gmail.com', x: 'me' },
  images: { logo: 'images/logo.png', screenshot: 'images/shot.png' },
  license: { id: 'MIT', file: 'LICENSE.txt' },
  language: 'ts',
  packageRegistry: 'jsr',
  issueTemplates: { bug: 'bug.yml', feature: 'feat.yml' },
  toc: { backToTop: false },
  content: { dir: 'readma' },
}

function file(partial: Partial<ContentFile> & { id: string }): ContentFile {
  return {
    file: `${partial.id}.md`,
    body: `${partial.id} body`,
    ...partial,
  }
}

function fakeCtx(
  overrides: {
    config?: Partial<ReadmaConfig>
    content?: ContentFile[]
  } & Omit<Partial<ReadmaContext>, 'config' | 'content'> = {},
): ReadmaContext {
  const { config: configOverride, content: contentOverride, ...rest } =
    overrides
  const config = { ...baseConfig, ...(configOverride ?? {}) } as ReadmaConfig
  return {
    config,
    options: {
      workspaceRootPath: '.',
      dryRun: false,
      folderPath: undefined,
      content: undefined,
    },
    content: contentOverride ?? [],
    repoUrl: 'https://github.com/me/test-repo',
    docUrl: 'https://github.com/me/test-repo',
    demoUrl: 'https://github.com/me/test-repo',
    branch: 'dev',
    logoSrc: 'https://logo',
    screenshotSrc: 'https://shot',
    license: { id: 'MIT', file: 'LICENSE.txt' },
    cocPath: undefined,
    badgeList: [],
    issueUrls: { bug: 'https://bug', feat: 'https://feat' },
    pkgName: 'test-repo',
    ...rest,
  }
}

Deno.test('installSnippet', () => {
  assertEquals(
    installSnippet('@scope/pkg', 'ts', 'jsr'),
    '```sh\ndeno add @scope/pkg\n```',
  )
  const npmSnippet = installSnippet('@scope/pkg', 'ts', 'npm')
  assertEquals(npmSnippet?.includes('```sh\npnpm add @scope/pkg\n```'), true)
  assertEquals(npmSnippet?.includes('```sh\nnpm add @scope/pkg\n```'), true)
  assertEquals(npmSnippet?.includes('```sh\nyarn add @scope/pkg\n```'), true)
  assertEquals(
    npmSnippet?.includes('```sh\ndeno add npm:@scope/pkg\n```'),
    true,
  )
  assertEquals(npmSnippet?.includes('```sh\nbun add @scope/pkg\n```'), true)
  assertEquals(
    installSnippet('my-crate', 'rs', 'crates.io'),
    '```sh\ncargo add my-crate\n```',
  )
  assertEquals(installSnippet('pkg', 'ts', undefined), undefined)
})

Deno.test('markdownTable', () => {
  assertEquals(markdownTable([]), '')
  const single = markdownTable([['A', 'B']])
  assertEquals(single, '| A | B |\n| - | - |')
  const full = markdownTable([
    ['Package', 'Description'],
    ['[a](a)', 'first'],
  ])
  assertEquals(
    full,
    '| Package | Description |\n| ------- | ----------- |\n| [a](a)  | first       |',
  )
  const ragged = markdownTable([
    ['A', 'B'],
    ['longer-cell'],
  ])
  assertEquals(ragged.includes('longer-cell'), true)
})

Deno.test('markdownMembersTable', () => {
  const table = markdownMembersTable([
    { pkgName: '@readma/core', path: 'packages/core', description: 'Core' },
  ])
  assertEquals(
    table,
    '| Package                       | Description |\n| ----------------------------- | ----------- |\n| [@readma/core](packages/core) | Core        |',
  )
})

Deno.test('sectionTitleFor falls back from config to front matter to defaults', () => {
  const overrideCtx = fakeCtx({
    config: { sections: { usage: { title: 'Config title' } } },
  })
  assertEquals(
    sectionTitleFor(
      overrideCtx,
      file({ id: 'usage', title: 'Front matter title' }),
    ),
    'Config title',
  )
  const plainCtx = fakeCtx()
  assertEquals(
    sectionTitleFor(
      plainCtx,
      file({ id: 'usage', title: 'Front matter title' }),
    ),
    'Front matter title',
  )
  assertEquals(sectionTitleFor(plainCtx, file({ id: 'usage' })), 'Usage')
  assertEquals(
    sectionTitleFor(plainCtx, file({ id: 'getting-started' })),
    'Getting started',
  )
  assertEquals(
    sectionTitleFor(plainCtx, file({ id: 'my_cool_section' })),
    'My cool section',
  )
})

Deno.test('sectionOrderFor uses front matter, then prefix defaults', () => {
  assertEquals(sectionOrderFor(file({ id: 'about' })), 10)
  assertEquals(sectionOrderFor(file({ id: 'faq' })), 100)
  assertEquals(sectionOrderFor(file({ id: 'faq', order: 25 })), 25)
})

Deno.test('assembleSections orders files and generated sections', () => {
  const ctx = fakeCtx({
    content: [
      file({ id: 'about' }),
      file({ id: 'usage' }),
      file({ id: 'faq', file: '25-faq.md', order: 25 }),
      file({ id: 'support' }),
      file({ id: 'header', special: 'header' }),
      file({ id: 'footer', special: 'footer' }),
    ],
  })
  const defs = assembleSections(ctx)
  assertEquals(
    defs.map((def) => def.id),
    ['about', 'faq', 'installation', 'usage', 'support', 'contact', 'license'],
  )
})

Deno.test('assembleSections skips missing generated sections', () => {
  const ctx = fakeCtx({
    license: {},
    config: {
      contact: undefined,
      license: undefined,
      packageRegistry: undefined,
    },
  })
  const out = renderSections(ctx, assembleSections(ctx), (title) => title)
  assertEquals(out, '')
})

Deno.test('assembleSections hides sections from front matter and config', () => {
  const ctx = fakeCtx({
    license: {},
    config: {
      sections: { usage: { hide: true } },
      packageRegistry: undefined,
      contact: undefined,
      license: undefined,
    },
    content: [
      file({ id: 'about', hide: true }),
      file({ id: 'usage' }),
    ],
  })
  const out = renderSections(ctx, assembleSections(ctx), (title) => title)
  assertEquals(out, '')
})

Deno.test('assembleSections synthesizes the installation snippet', () => {
  const ctx = fakeCtx()
  const defs = assembleSections(ctx)
  const installation = defs.find((def) => def.id === 'installation')
  assertEquals(
    installation?.render(ctx),
    '```sh\ndeno add test-repo\n```',
  )
  const withFile = fakeCtx({ content: [file({ id: 'installation' })] })
  const fileDefs = assembleSections(withFile)
  assertEquals(
    fileDefs.find((def) => def.id === 'installation')?.render(withFile),
    'installation body',
  )
  const noRegistry = fakeCtx({ config: { packageRegistry: undefined } })
  assertEquals(
    assembleSections(noRegistry).some((def) => def.id === 'installation'),
    false,
  )
})

Deno.test('about body embeds the screenshot and the members table', () => {
  const ctx = fakeCtx({
    config: {
      root: {
        members: [
          { pkgName: '@s/core', path: 'packages/core', description: 'Core' },
        ],
      },
    },
    content: [file({ id: 'about', body: 'About text' })],
  })
  const about = assembleSections(ctx).find((def) => def.id === 'about')
  const body = about?.render(ctx) ?? ''
  assertEquals(body.includes('About text'), true)
  assertEquals(body.includes('<img src="https://shot"'), true)
  assertEquals(body.includes('[@s/core](packages/core)'), true)
  assertEquals(body.includes('entry point of **test-repo** workspace'), true)
  const noMembers = fakeCtx({
    config: { root: { members: [] } },
    content: [file({ id: 'about', body: 'About text' })],
  })
  assertEquals(
    assembleSections(noMembers).find((def) => def.id === 'about')?.render(
      noMembers,
    )?.includes('available packages'),
    false,
  )
  const noScreenshot = fakeCtx({
    screenshotSrc: undefined,
    content: [file({ id: 'about', body: 'About text' })],
  })
  assertEquals(
    assembleSections(noScreenshot).find((def) => def.id === 'about')?.render(
      noScreenshot,
    )?.includes('<img'),
    false,
  )
})

Deno.test('roadmap appends the open issues link', () => {
  const ctx = fakeCtx({ content: [file({ id: 'roadmap' })] })
  const roadmap = assembleSections(ctx).find((def) => def.id === 'roadmap')
  assertEquals(roadmap?.render(ctx)?.includes('open issues'), true)
})

Deno.test('contributing renders the code of conduct note', () => {
  const withCoc = fakeCtx({
    cocPath: '.github/CODE_OF_CONDUCT.md',
  })
  const defs = assembleSections(withCoc)
  const contributing = defs.find((def) => def.id === 'contributing')
  assertEquals(
    contributing?.render(withCoc)?.includes('code of conduct'),
    true,
  )
  assertEquals(
    contributing?.render(withCoc)?.includes('greatly appreciated'),
    true,
  )
  const withBody = fakeCtx({
    cocPath: '.github/CODE_OF_CONDUCT.md',
    content: [file({ id: 'contributing', body: 'PRs welcome' })],
  })
  const body = assembleSections(withBody).find((def) =>
    def.id === 'contributing'
  )?.render(withBody)
  assertEquals(body?.includes('PRs welcome'), true)
  assertEquals(body?.includes('greatly appreciated'), false)
  const withoutCoc = fakeCtx({})
  assertEquals(
    assembleSections(withoutCoc).find((def) => def.id === 'contributing'),
    undefined,
  )
})

Deno.test('contact renders x.com and mailto links', () => {
  const ctx = fakeCtx()
  const contact = assembleSections(ctx).find((def) => def.id === 'contact')
  const body = contact?.render(ctx) ?? ''
  assertEquals(body.includes('me - [@me](https://x.com/me)'), true)
  assertEquals(
    body.includes('[me@gmail.com](mailto:me@gmail.com)'),
    true,
  )
  assertEquals(
    body.includes(
      'Project Link: [me/test-repo](https://github.com/me/test-repo)',
    ),
    true,
  )
  const linkedinOnly = fakeCtx({
    config: { contact: { linkedin: 'me' } },
  })
  const linkedinBody = assembleSections(linkedinOnly).find((def) =>
    def.id === 'contact'
  )?.render(linkedinOnly)
  assertEquals(
    linkedinBody?.includes('[me](https://linkedin.com/in/me)'),
    true,
  )
  const none = fakeCtx({ config: { contact: undefined } })
  assertEquals(
    assembleSections(none).find((def) => def.id === 'contact')?.render(none),
    undefined,
  )
})

Deno.test('license renders a branch aware link', () => {
  const ctx = fakeCtx()
  const license = assembleSections(ctx).find((def) => def.id === 'license')
  assertEquals(
    license?.render(ctx),
    '<sup> Licensed under <a href="https://github.com/me/test-repo/blob/dev/LICENSE.txt">MIT license</a></sup>',
  )
  const noRepo = fakeCtx({ repoUrl: undefined })
  const plainLicense = assembleSections(noRepo).find((def) =>
    def.id === 'license'
  )?.render(noRepo)
  assertEquals(plainLicense, '<sup>Licensed under the MIT license</sup>')
  const unlicensed = fakeCtx({ license: {} })
  assertEquals(
    assembleSections(unlicensed).find((def) => def.id === 'license')?.render(
      unlicensed,
    ),
    undefined,
  )
})

Deno.test('renderSections skips empty bodies', () => {
  const ctx = fakeCtx({
    content: [
      file({ id: 'about', body: '   ' }),
      file({ id: 'features', body: 'feature body' }),
    ],
  })
  const out = renderSections(
    ctx,
    assembleSections(ctx),
    (title, content) => `${title}::${content}`,
  )
  assertEquals(out.includes('feature body'), true)
  assertEquals(out.includes('About'), false)
})

Deno.test('empty contributing and contact bodies are skipped', () => {
  const emptyContributing = fakeCtx({
    content: [file({ id: 'contributing', body: '   ' })],
  })
  assertEquals(
    assembleSections(emptyContributing).find((def) => def.id === 'contributing')
      ?.render(emptyContributing),
    undefined,
  )
  const emptyContact = fakeCtx({
    config: { contact: {}, author: undefined },
  })
  assertEquals(
    assembleSections(emptyContact).find((def) => def.id === 'contact')?.render(
      emptyContact,
    ),
    undefined,
  )
})
