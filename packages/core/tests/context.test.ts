import { assertEquals, assertInstanceOf, assertRejects } from '@std/assert'
import {
  defaultOptions,
  fetchJsonDescription,
  issueTemplateUrl,
  type ReadmeContext,
  repoUrlFromArgs,
  resolveContext,
} from '../src/context.ts'
import { resetIo, setIo } from '../src/io.ts'
import { COC_FILE_PATH, type ReadmeTemplateArgs } from '../src/types.ts'
import { ReadmaError } from '../src/utils.ts'

const baseArgs: ReadmeTemplateArgs = {
  language: 'ts',
  title: 'Test',
  author: 'me',
  githubUsername: 'me',
  repoName: 'test-repo',
  xHandle: 'me',
  domain: 'gmail',
  email: 'me',
  images: { logo: 'images/logo.png' },
  template: { bugReport: 'bug.yml', featRequest: 'feat.yml' },
  backToTop: false,
  sections: {
    features: 'features',
    projectDescription: 'desc',
    about: 'about',
    installation: 'install',
    acknowledgments: 'thanks',
    gettingStarted: 'start',
    roadmap: 'road',
    usage: 'usage',
  },
}

Deno.test('repoUrlFromArgs', () => {
  assertEquals(
    repoUrlFromArgs(baseArgs),
    'https://github.com/me/test-repo',
  )
  assertEquals(
    repoUrlFromArgs({ ...baseArgs, urls: { repo: 'https://custom.dev/repo' } }),
    'https://custom.dev/repo',
  )
  assertEquals(
    repoUrlFromArgs({ ...baseArgs, vcsName: 'github' }),
    'https://github.com/me/test-repo',
  )
})

Deno.test('defaultOptions', () => {
  assertEquals(defaultOptions({}), {
    workspaceRootPath: '.',
    dryRun: false,
    folderPath: '.',
  })
  assertEquals(
    defaultOptions({ workspaceRootPath: '/root', dryRun: true }),
    {
      workspaceRootPath: '/root',
      dryRun: true,
      folderPath: '.',
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
        { ...baseArgs, linkedinUsername: 'me' },
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
      assertEquals(ctx.fullEmail, 'me@gmail.com')
      assertEquals(
        ctx.logoSrc,
        'https://raw.githubusercontent.com/me/test-repo/HEAD/images/logo.png',
      )
      assertEquals(ctx.screenshotSrc, undefined)
      assertEquals(ctx.cocPath, undefined)
      const names = ctx.badgeList.map((s) => s.name)
      assertEquals(names.includes('LinkedIn'), true)
      assertEquals(ctx.issueUrls.bug.includes('template=bug.yml'), true)
      assertEquals(ctx.options.workspaceRootPath, dir)
    } finally {
      await Deno.remove(dir, { recursive: true })
    }
  })
  await t.step('uses urls, domainExt, screenshot and coc', async () => {
    const dir = await Deno.makeTempDir()
    try {
      await Deno.mkdir(`${dir}/.github`, { recursive: true })
      await Deno.writeTextFile(`${dir}/${COC_FILE_PATH}`, '# CoC')
      const ctx = await resolveContext(
        {
          ...baseArgs,
          urls: {
            repo: 'https://repo',
            doc: 'https://docs',
            demo: 'https://demo',
          },
          domainExt: 'fr',
          images: { logo: 'l.png', screenshot: 's.png' },
          coc: COC_FILE_PATH,
          license: 'Apache-2.0',
          licenseFile: 'LICENSE.md',
        },
        { workspaceRootPath: dir },
        {
          detectBranch: () => Promise.resolve('main'),
          detectLicense: () => Promise.resolve({}),
        },
      )
      assertEquals(ctx.docUrl, 'https://docs')
      assertEquals(ctx.demoUrl, 'https://demo')
      assertEquals(ctx.fullEmail, 'me@gmail.fr')
      assertEquals(
        ctx.screenshotSrc,
        'https://raw.githubusercontent.com/me/test-repo/HEAD/s.png',
      )
      assertEquals(ctx.cocPath, COC_FILE_PATH)
      assertEquals(ctx.license, { id: 'Apache-2.0', file: 'LICENSE.md' })
      assertEquals(ctx.badgeList.length > 0, true)
    } finally {
      await Deno.remove(dir, { recursive: true })
    }
  })
  await t.step('detects a missing license file fallback', async () => {
    const ctx: ReadmeContext = await resolveContext(baseArgs, {}, {
      detectBranch: () => Promise.resolve('main'),
      detectLicense: () => Promise.resolve({}),
    })
    assertEquals(ctx.license, { id: undefined, file: 'LICENSE.txt' })
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
