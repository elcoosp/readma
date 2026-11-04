import { assertEquals, assertInstanceOf, assertRejects } from '@std/assert'
import {
  defaultOptions,
  fetchJsonDescription,
  issueTemplateUrl,
  type ReadmaContext,
  repoUrlFromConfig,
  resolveContext,
} from '../src/context.ts'
import { resetIo, setIo } from '../src/io.ts'
import { COC_FILE_PATH, type ReadmaConfig } from '../src/types.ts'
import { ReadmaError } from '../src/utils.ts'

const baseConfig: ReadmaConfig = {
  title: 'Test',
  repo: 'me/test-repo',
  author: 'me',
  contact: { email: 'me@gmail.com', x: 'me' },
  images: { logo: 'images/logo.png' },
  language: 'ts',
  content: { dir: 'readma' },
}

Deno.test('repoUrlFromConfig', () => {
  assertEquals(
    repoUrlFromConfig(baseConfig),
    'https://github.com/me/test-repo',
  )
  assertEquals(
    repoUrlFromConfig({
      ...baseConfig,
      links: { repo: 'https://custom.dev/repo' },
    }),
    'https://custom.dev/repo',
  )
  assertEquals(repoUrlFromConfig({ title: 'T' }), undefined)
})

Deno.test('defaultOptions', () => {
  assertEquals(defaultOptions({}), {
    workspaceRootPath: '.',
    dryRun: false,
    folderPath: undefined,
    content: undefined,
  })
  assertEquals(
    defaultOptions({ workspaceRootPath: '/root', dryRun: true }),
    {
      workspaceRootPath: '/root',
      dryRun: true,
      folderPath: undefined,
      content: undefined,
    },
  )
})

Deno.test('issueTemplateUrl', async (t) => {
  const dir = await Deno.makeTempDir()
  try {
    await Deno.mkdir(`${dir}/.github/ISSUE_TEMPLATE`, { recursive: true })
    await Deno.writeTextFile(
      `${dir}/.github/ISSUE_TEMPLATE/bug.yml`,
      `name: Bug report
title: 'Bug: something broke'
labels: ['bug']
assignees: ['me', 'you']
body: []`,
    )
    await t.step('derives a prefilled url from the yml template', async () => {
      const url = await issueTemplateUrl(
        dir,
        'https://github.com/me/repo',
        'bug.yml',
      )
      assertEquals(
        url,
        'https://github.com/me/repo/issues/new?template=bug.yml&title=Bug%3A+something+broke&labels=bug&assignees=me%2Cyou',
      )
    })
    await t.step('falls back when the template is missing', async () => {
      const url = await issueTemplateUrl(
        dir,
        'https://github.com/me/repo',
        'missing.yml',
      )
      assertEquals(
        url,
        'https://github.com/me/repo/issues/new?template=missing.yml',
      )
    })
    await t.step('defaults empty yml meta fields', async () => {
      await Deno.writeTextFile(
        `${dir}/.github/ISSUE_TEMPLATE/minimal.yml`,
        'name: Minimal\nbody: []',
      )
      const url = await issueTemplateUrl(
        dir,
        'https://github.com/me/repo',
        'minimal.yml',
      )
      assertEquals(
        url.includes('title=&labels=&assignees='),
        true,
      )
    })
    await t.step('throws a ReadmaError on invalid yml', async () => {
      await Deno.writeTextFile(
        `${dir}/.github/ISSUE_TEMPLATE/broken.yml`,
        'a: [unclosed',
      )
      const error = await assertRejects(() =>
        issueTemplateUrl(dir, 'https://github.com/me/repo', 'broken.yml')
      )
      assertInstanceOf(error, ReadmaError)
    })
  } finally {
    await Deno.remove(dir, { recursive: true })
  }
})

Deno.test('resolveContext', async (t) => {
  await t.step('resolves every derived value', async () => {
    const dir = await Deno.makeTempDir()
    try {
      await Deno.writeTextFile(`${dir}/LICENSE.txt`, 'MIT License')
      const ctx = await resolveContext(
        { ...baseConfig, contact: { linkedin: 'me' } },
        { workspaceRootPath: dir },
        {
          detectBranch: () => Promise.resolve('dev'),
          detectLicense: () =>
            Promise.resolve({ id: 'MIT', file: 'LICENSE.txt' }),
        },
      )
      assertEquals(ctx.branch, 'dev')
      assertEquals(ctx.license, { id: 'MIT', file: 'LICENSE.txt' })
      assertEquals(ctx.repoUrl, 'https://github.com/me/test-repo')
      assertEquals(ctx.docUrl, 'https://github.com/me/test-repo')
      assertEquals(ctx.demoUrl, 'https://github.com/me/test-repo')
      assertEquals(
        ctx.logoSrc,
        'https://raw.githubusercontent.com/me/test-repo/HEAD/images/logo.png',
      )
      assertEquals(ctx.screenshotSrc, undefined)
      assertEquals(ctx.cocPath, undefined)
      const names = ctx.badgeList.map((shield) => shield.name)
      assertEquals(names.includes('LinkedIn'), true)
      assertEquals(names.includes('Codecov'), true)
      assertEquals(ctx.issueUrls.bug, undefined)
      assertEquals(ctx.issueUrls.feat, undefined)
      assertEquals(ctx.pkgName, 'test-repo')
      assertEquals(ctx.options.workspaceRootPath, dir)
      assertEquals(ctx.content, [])
    } finally {
      await Deno.remove(dir, { recursive: true })
    }
  })
  await t.step('uses urls, screenshot, coc and issue templates', async () => {
    const dir = await Deno.makeTempDir()
    try {
      await Deno.mkdir(`${dir}/.github`, { recursive: true })
      await Deno.writeTextFile(`${dir}/${COC_FILE_PATH}`, '# CoC')
      const ctx = await resolveContext(
        {
          ...baseConfig,
          links: {
            repo: 'https://repo',
            doc: 'https://docs',
            demo: 'https://demo',
          },
          images: { logo: 'l.png', screenshot: 's.png' },
          coc: COC_FILE_PATH,
          license: { id: 'Apache-2.0', file: 'LICENSE.md' },
          issueTemplates: { bug: 'bug.yml', feature: 'feat.yml' },
        },
        { workspaceRootPath: dir },
        {
          detectBranch: () => Promise.resolve('main'),
          detectLicense: () => Promise.resolve({}),
        },
      )
      assertEquals(ctx.docUrl, 'https://docs')
      assertEquals(ctx.demoUrl, 'https://demo')
      assertEquals(
        ctx.screenshotSrc,
        'https://raw.githubusercontent.com/me/test-repo/HEAD/s.png',
      )
      assertEquals(ctx.cocPath, COC_FILE_PATH)
      assertEquals(ctx.license, { id: 'Apache-2.0', file: 'LICENSE.md' })
      assertEquals(ctx.badgeList.length > 0, true)
      assertEquals(ctx.issueUrls.bug?.includes('template=bug.yml'), true)
      assertEquals(ctx.issueUrls.feat?.includes('template=feat.yml'), true)
    } finally {
      await Deno.remove(dir, { recursive: true })
    }
  })
  await t.step('detects a missing license fallback', async () => {
    const ctx: ReadmaContext = await resolveContext(baseConfig, {}, {
      detectBranch: () => Promise.resolve('main'),
      detectLicense: () => Promise.resolve({}),
    })
    assertEquals(ctx.license, { id: undefined, file: 'LICENSE.txt' })
  })
  await t.step('derives the member pkg name', async () => {
    const ctx = await resolveContext(
      {
        ...baseConfig,
        workspaceMember: {
          pkgName: '@s/core',
          path: 'packages/core',
          description: '-',
        },
      },
      {},
      {
        detectBranch: () => Promise.resolve('main'),
        detectLicense: () => Promise.resolve({}),
      },
    )
    assertEquals(ctx.pkgName, '@s/core')
  })
  await t.step('loads the content directory once', async () => {
    const dir = await Deno.makeTempDir()
    try {
      await Deno.mkdir(`${dir}/docs`)
      await Deno.writeTextFile(`${dir}/docs/about.md`, 'From the docs dir')
      const ctx = await resolveContext(
        { ...baseConfig, content: { dir: 'docs' } },
        { workspaceRootPath: dir },
        {
          detectBranch: () => Promise.resolve('main'),
          detectLicense: () => Promise.resolve({}),
        },
      )
      assertEquals(ctx.content.length, 1)
      assertEquals(ctx.content[0].id, 'about')
      assertEquals(ctx.content[0].body, 'From the docs dir')
    } finally {
      await Deno.remove(dir, { recursive: true })
    }
  })
  await t.step('honours pre loaded content', async () => {
    const ctx = await resolveContext(
      baseConfig,
      {
        content: [{ id: 'about', file: 'about.md', body: 'Pre loaded' }],
      },
      {
        detectBranch: () => Promise.resolve('main'),
        detectLicense: () => Promise.resolve({}),
      },
    )
    assertEquals(ctx.content[0].body, 'Pre loaded')
  })
  await t.step('omits badges without a repo slug', async () => {
    const ctx = await resolveContext(
      { title: 'No repo' },
      {},
      {
        detectBranch: () => Promise.resolve('main'),
        detectLicense: () => Promise.resolve({}),
      },
    )
    assertEquals(ctx.repoUrl, undefined)
    assertEquals(ctx.badgeList, [])
    assertEquals(ctx.logoSrc, undefined)
  })
})

Deno.test('fetchJsonDescription', async (t) => {
  await t.step('returns undefined when offline', async () => {
    assertEquals(await fetchJsonDescription('https://x', true), undefined)
  })
  await t.step('extracts the description', async () => {
    setIo({
      fetch: (() =>
        Promise.resolve(
          new Response('{"description":"desc"}', {
            status: 200,
          }),
        )) as typeof fetch,
    })
    try {
      assertEquals(await fetchJsonDescription('https://x', false), 'desc')
    } finally {
      resetIo()
    }
  })
  await t.step('returns undefined on non ok or empty description', async () => {
    setIo({
      fetch: (() =>
        Promise.resolve(
          new Response('{"description":""}', { status: 404 }),
        )) as typeof fetch,
    })
    try {
      assertEquals(await fetchJsonDescription('https://x', false), undefined)
    } finally {
      resetIo()
    }
    setIo({
      fetch: (() =>
        Promise.resolve(
          new Response('{"description":""}', { status: 200 }),
        )) as typeof fetch,
    })
    try {
      assertEquals(await fetchJsonDescription('https://x', false), undefined)
    } finally {
      resetIo()
    }
    setIo({
      fetch: (() => Promise.reject(new Error('network'))) as typeof fetch,
    })
    try {
      assertEquals(await fetchJsonDescription('https://x', false), undefined)
    } finally {
      resetIo()
    }
  })
})

Deno.test('resolveContext keeps relative image paths without a repo slug', async () => {
  const ctx = await resolveContext(
    { title: 'Local', images: { logo: 'assets/logo.png' } },
    {},
    {
      detectBranch: () => Promise.resolve('main'),
      detectLicense: () => Promise.resolve({}),
    },
  )
  assertEquals(ctx.logoSrc, 'assets/logo.png')
})
