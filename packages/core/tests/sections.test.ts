import { assertEquals } from '@std/assert'
import type { ReadmeContext } from '../src/context.ts'
import {
  allSections,
  BUILTIN_SECTION_IDS,
  installSnippet,
  markdownMembersTable,
  markdownTable,
  renderSections,
} from '../src/sections.ts'
import type { ReadmeTemplateArgs } from '../src/types.ts'

const baseArgs: ReadmeTemplateArgs = {
  language: 'ts',
  title: 'Test',
  author: 'me',
  githubUsername: 'me',
  repoName: 'test-repo',
  xHandle: 'me',
  domain: 'gmail',
  email: 'me',
  images: { logo: 'logo.png' },
  template: { bugReport: 'bug.yml', featRequest: 'feat.yml' },
  backToTop: false,
  sections: {
    features: 'feature body',
    projectDescription: 'A description',
    about: 'about body',
    installation: 'install body',
    acknowledgments: 'ack body',
    gettingStarted: 'start body',
    roadmap: 'road body',
    usage: 'usage body',
  },
}

function fakeCtx(overrides: Partial<ReadmeContext> = {}): ReadmeContext {
  return {
    args: baseArgs,
    options: { workspaceRootPath: '.', dryRun: false, folderPath: '.' },
    repoUrl: 'https://github.com/me/test-repo',
    docUrl: 'https://github.com/me/test-repo',
    demoUrl: 'https://github.com/me/test-repo',
    branch: 'main',
    fullEmail: 'me@gmail.com',
    logoSrc: 'https://logo',
    screenshotSrc: undefined,
    license: { id: 'MIT', file: 'LICENSE.txt' },
    cocPath: undefined,
    badgeList: [],
    issueUrls: { bug: 'https://bug', feat: 'https://feat' },
    ...overrides,
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

Deno.test('renderSections skips empty bodies', () => {
  const ctx = fakeCtx()
  const out = renderSections(
    ctx,
    allSections(ctx),
    (title, content) => `${title}::${content}`,
  )
  assertEquals(out.includes('feature body'), true)
  assertEquals(Object.keys(ctx.args.sections).length > 0, true)
  const emptyCtx = fakeCtx({
    args: {
      ...baseArgs,
      sections: { ...baseArgs.sections, about: '  ', features: '' },
    },
  })
  const emptyOut = renderSections(
    emptyCtx,
    allSections(emptyCtx),
    (title) => title,
  )
  assertEquals(emptyOut.includes('💡 About the project'), false)
  assertEquals(emptyOut.includes('✨ Features'), false)
  assertEquals(emptyOut.includes('📨 Contact'), true)
})

Deno.test('allSections derives roadmap link and contributing variants', () => {
  const roadmap = allSections(fakeCtx()).find((s) => s.id === 'roadmap')
  assertEquals(
    roadmap?.render(fakeCtx())?.includes('open issues'),
    true,
  )
  const emptyRoadmap = allSections(fakeCtx({
    args: { ...baseArgs, sections: { ...baseArgs.sections, roadmap: '   ' } },
  })).find((s) => s.id === 'roadmap')
  assertEquals(emptyRoadmap?.render(fakeCtx()), undefined)

  const contributing = allSections(fakeCtx()).find((s) =>
    s.id === 'contributing'
  )
  assertEquals(contributing?.render(fakeCtx()), undefined)

  const withCoc = allSections(
    fakeCtx({ cocPath: '.github/CODE_OF_CONDUCT.md' }),
  )
    .find((s) => s.id === 'contributing')
  const cocBody = withCoc?.render(
    fakeCtx({ cocPath: '.github/CODE_OF_CONDUCT.md' }),
  )
  assertEquals(cocBody?.includes('code of conduct'), true)

  const withContributing = allSections(fakeCtx({
    args: {
      ...baseArgs,
      sections: { ...baseArgs.sections, contributing: 'PRs welcome' },
    },
    cocPath: 'coc.md',
  })).find((s) => s.id === 'contributing')
  const contributingBody = withContributing?.render(fakeCtx({
    args: {
      ...baseArgs,
      sections: { ...baseArgs.sections, contributing: 'PRs welcome' },
    },
    cocPath: 'coc.md',
  }))
  assertEquals(contributingBody?.includes('PRs welcome'), true)
  assertEquals(contributingBody?.includes('code of conduct'), true)
})

Deno.test('contributing body without a code of conduct', () => {
  const withContributingOnly = allSections(fakeCtx({
    args: {
      ...baseArgs,
      sections: { ...baseArgs.sections, contributing: 'PRs welcome' },
    },
    cocPath: undefined,
  })).find((s) => s.id === 'contributing')
  const body = withContributingOnly?.render(fakeCtx({
    args: {
      ...baseArgs,
      sections: { ...baseArgs.sections, contributing: 'PRs welcome' },
    },
    cocPath: undefined,
  }))
  assertEquals(body?.includes('PRs welcome'), true)
  assertEquals(body?.includes('code of conduct'), false)
})

Deno.test('license section variants', () => {
  const mit = allSections(fakeCtx()).find((s) => s.id === 'license')
  assertEquals(
    mit?.render(fakeCtx()),
    '<sup> Licensed under <a href="https://github.com/me/test-repo/blob/master/LICENSE.txt">MIT license</a></sup>',
  )
  const none = allSections(fakeCtx({ license: {} })).find((s) =>
    s.id === 'license'
  )
  assertEquals(none?.render(fakeCtx({ license: {} })), 'None')
})

Deno.test('custom sections are picked up in order', () => {
  const ctx = fakeCtx({
    args: {
      ...baseArgs,
      sections: {
        ...baseArgs.sections,
        '🤝 Support': 'support body',
        '🧪 Experiments': 'experiments body',
      },
    },
  })
  const defs = allSections(ctx)
  const customDefs = defs.filter((def) =>
    def.id === '🤝 Support' || def.id === '🧪 Experiments'
  )
  assertEquals(customDefs.length, 2)
  assertEquals(
    customDefs[0].render(ctx),
    'support body',
  )
  assertEquals(BUILTIN_SECTION_IDS.includes('contact' as never), false)
})

Deno.test('empty members list skips the workspace table', () => {
  const ctx = fakeCtx({
    args: { ...baseArgs, root: { members: [] } },
  })
  const about = allSections(ctx).find((s) => s.id === 'about')
  assertEquals(about?.render(ctx)?.includes('available packages'), false)
})
