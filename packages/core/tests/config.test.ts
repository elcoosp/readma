import { assertEquals, assertInstanceOf } from '@std/assert'
import {
  CONFIG_FILENAMES,
  configIssues,
  normalizeConfig,
  parseConfigText,
} from '../src/config.ts'
import { ReadmaError } from '../src/utils.ts'

Deno.test('CONFIG_FILENAMES detection order', () => {
  assertEquals(CONFIG_FILENAMES, [
    'readma.yaml',
    'readma.yml',
    'readma.toml',
    'readma.json',
  ])
})

Deno.test('parseConfigText parses every supported format', () => {
  const yaml = parseConfigText('title: Readma\n', 'yaml')
  assertEquals(yaml.title, 'Readma')
  const yml = parseConfigText('title: Readma\n', 'yml')
  assertEquals(yml.title, 'Readma')
  const toml = parseConfigText('title = "Readma"\n', 'toml')
  assertEquals(toml.title, 'Readma')
  const json = parseConfigText('{"title": "Readma"}', 'json')
  assertEquals(json.title, 'Readma')
})

Deno.test('parseConfigText parses nested config structures', () => {
  const raw = parseConfigText(
    `title: Readma
repo: elcoosp/readma
contact:
  email: me@gmail.com
  x: me
badges:
  disabled:
    - issues
  custom:
    - name: Sponsor
      image: https://img.shields.io/badge/-Sponsor-purple
      link: https://sponsor.me
toc:
  backToTop: true
sections:
  contact:
    title: Get in touch
`,
    'yaml',
  )
  assertEquals(raw.repo, 'elcoosp/readma')
  const contact = raw.contact as Record<string, string>
  assertEquals(contact.email, 'me@gmail.com')
  const toc = raw.toc as Record<string, unknown>
  assertEquals(toc.backToTop, true)
})

Deno.test('parseConfigText rejects unknown extensions', () => {
  const error = (() => {
    try {
      parseConfigText('title: x', 'ts' as 'yaml')
      return undefined
    } catch (error_) {
      return error_
    }
  })()
  assertInstanceOf(error, ReadmaError)
  assertEquals((error as Error).message.includes('Unsupported'), true)
})

Deno.test('parseConfigText wraps parser failures', () => {
  for (
    const [text, ext] of [
      ['title: [unclosed', 'yaml'],
      ['title = broken', 'toml'],
      ['{not json}', 'json'],
    ] as const
  ) {
    const error = (() => {
      try {
        parseConfigText(text, ext)
        return undefined
      } catch (error_) {
        return error_
      }
    })()
    assertInstanceOf(error, ReadmaError)
    assertEquals((error as Error).message.includes(ext), true)
  }
})

Deno.test('parseConfigText rejects non object payloads', () => {
  const error = (() => {
    try {
      parseConfigText('- a\n- b\n', 'yaml')
      return undefined
    } catch (error_) {
      return error_
    }
  })()
  assertInstanceOf(error, ReadmaError)
  assertEquals((error as Error).message.includes('object'), true)
})

Deno.test('normalizeConfig keeps the content dir when provided', () => {
  const config = normalizeConfig({ title: 'T' })
  assertEquals(config.title, 'T')
  assertEquals(config.content, undefined)
  const customDir = normalizeConfig({ title: 'T', content: { dir: 'docs' } })
  assertEquals(customDir.content?.dir, 'docs')
})

Deno.test('configIssues accepts a minimal config', () => {
  assertEquals(configIssues({ title: 'T' }), [])
})

Deno.test('configIssues requires a title', () => {
  const issues = configIssues({})
  assertEquals(issues.length, 1)
  assertEquals(issues[0].path, 'title')
  assertEquals(issues[0].message.includes('required'), true)
})

Deno.test('configIssues validates the repo slug', () => {
  const issues = configIssues({ title: 'T', repo: 'not-a-slug' })
  assertEquals(issues.length, 1)
  assertEquals(issues[0].path, 'repo')
  assertEquals(issues[0].message.includes('owner/name'), true)
  assertEquals(configIssues({ title: 'T', repo: 'owner/name' }), [])
})

Deno.test('configIssues validates field types', () => {
  const issues = configIssues(
    {
      title: 42,
      description: 42,
      language: 'go',
      packageRegistry: 'cran',
      pkgName: 42,
      author: 42,
      coc: 42,
      repobeats: 42,
      links: 'nope',
      contact: 'nope',
      images: 'nope',
      license: 'nope',
      issueTemplates: 'nope',
      badges: 'nope',
      toc: 'nope',
      content: 'nope',
      sections: 'nope',
      workspaceMember: 'nope',
      root: 'nope',
    } as unknown as Parameters<typeof configIssues>[0],
  )
  const paths = issues.map((issue) => issue.path)
  for (
    const path of [
      'title',
      'description',
      'language',
      'packageRegistry',
      'pkgName',
      'author',
      'coc',
      'repobeats',
      'links',
      'contact',
      'images',
      'license',
      'issueTemplates',
      'badges',
      'toc',
      'content',
      'sections',
      'workspaceMember',
      'root',
    ]
  ) {
    assertEquals(paths.includes(path), true, `expected issue at ${path}`)
  }
})

Deno.test('configIssues validates nested config values', () => {
  const issues = configIssues(
    {
      title: 'T',
      content: { dir: 42 },
      toc: { backToTop: 'yes' },
      badges: { style: 'sparkly', custom: [{ name: 'x', image: 'y' }] },
      sections: { about: { hide: 'nope' } },
      contact: { email: 42 },
      license: { id: 42 },
      issueTemplates: { bug: 'tpl.txt' },
      links: { repo: 42 },
      images: { logo: 42 },
      root: { members: [{ pkgName: 'p', path: 'pp', description: 'd' }] },
      workspaceMember: { pkgName: 'p', path: 'pp' },
    } as unknown as Parameters<typeof configIssues>[0],
  )
  const paths = issues.map((issue) => issue.path).toSorted()
  assertEquals(paths, [
    'badges.custom[0].link',
    'badges.style',
    'contact.email',
    'content.dir',
    'images.logo',
    'issueTemplates.bug',
    'license.id',
    'links.repo',
    'sections.about.hide',
    'toc.backToTop',
    'workspaceMember.description',
  ])
})

Deno.test('normalizeConfig keeps every optional group', () => {
  const config = normalizeConfig({
    title: 'T',
    pkgName: '@s/pkg',
    badges: { style: 'flat' },
    sections: { about: { hide: true } },
  })
  assertEquals(config.pkgName, '@s/pkg')
  assertEquals(config.badges?.style, 'flat')
  assertEquals(config.sections?.about?.hide, true)
})

Deno.test('configIssues describes arrays, nulls and unknown badges', () => {
  const issues = configIssues(
    {
      title: 'T',
      badges: {
        style: 'flat',
        disabled: 'nope',
        custom: [{ name: 'x', image: 'y', link: 'z' }, null, 'text'],
      },
      toc: null,
      sections: { about: 'nope' },
    } as unknown as Parameters<typeof configIssues>[0],
  )
  const messages = issues.map((issue) => `${issue.path}: ${issue.message}`)
  assertEquals(messages.some((m) => m.includes('badges.disabled')), true)
  assertEquals(messages.some((m) => m.includes('badges.custom[1]')), true)
  assertEquals(messages.some((m) => m.includes('badges.custom[2]')), true)
  assertEquals(messages.some((m) => m.includes('toc')), true)
  assertEquals(messages.some((m) => m.includes('sections.about')), true)
})

Deno.test('configIssues rejects unknown disabled badge ids', () => {
  const issues = configIssues({
    title: 'T',
    badges: { disabled: ['issues', 'not-a-badge' as never] },
  })
  const paths = issues.map((issue) => issue.path)
  assertEquals(paths.includes('badges.disabled[1]'), true)
})

Deno.test('configIssues accepts optional fields being undefined', () => {
  const issues = configIssues({
    title: 'T',
    description: undefined,
    repo: undefined,
    contact: undefined,
    images: undefined,
    license: undefined,
    issueTemplates: undefined,
    badges: undefined,
    toc: undefined,
    content: undefined,
    sections: undefined,
  })
  assertEquals(issues, [])
})
