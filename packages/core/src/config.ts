import * as toml from '@std/toml'
import * as yml from '@std/yaml'
import type { ReadmaConfig } from './types.ts'
import { ReadmaError } from './utils.ts'
/** Config filenames tried in order when discovering the config of a project */
export const CONFIG_FILENAMES = [
  'readma.yaml',
  'readma.yml',
  'readma.toml',
  'readma.json',
] as const
/** Supported config file extensions */
export type ConfigExt = 'yaml' | 'yml' | 'toml' | 'json'
/**
 * Parse a config payload from its text representation.
 *
 * @param text Raw content of the config file
 * @param ext File extension driving the parser
 * @returns The parsed raw config object
 * @throws {ReadmaError} When the extension is unsupported, the payload is not
 * an object or the underlying parser fails
 */
export function parseConfigText(
  text: string,
  ext: ConfigExt,
): Record<string, unknown> {
  let parsed: unknown
  try {
    switch (ext) {
      case 'yaml':
      case 'yml':
        parsed = yml.parse(text)
        break
      case 'toml':
        parsed = toml.parse(text)
        break
      case 'json':
        parsed = JSON.parse(text)
        break
      default:
        throw new ReadmaError(
          `Unsupported config extension ${ext}, expected one of yaml, yml, toml, json`,
        )
    }
  } catch (error) {
    if (error instanceof ReadmaError) throw error
    throw new ReadmaError(
      `Could not parse the ${ext} config: ${
        error instanceof Error ? error.message : error
      }`,
      { cause: error },
    )
  }
  if (
    parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)
  ) {
    throw new ReadmaError(
      `Expected the ${ext} config to hold an object of options`,
    )
  }
  return parsed as Record<string, unknown>
}
/** Extract an optional string field from a raw object */
function str(
  source: Record<string, unknown>,
  key: string,
): string | undefined {
  const value = source[key]
  return typeof value === 'string' ? value : undefined
}
/** Extract an optional nested object field from a raw object */
function obj(
  source: Record<string, unknown>,
  key: string,
): Record<string, unknown> | undefined {
  const value = source[key]
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : undefined
}
/**
 * Normalize a raw config object: keeps the known fields, drops everything
 * else (e.g. `$schema`) and applies the defaults.
 *
 * @param raw Parsed config payload
 */
export function normalizeConfig(
  raw: Record<string, unknown>,
): ReadmaConfig {
  const config: ReadmaConfig = {
    title: typeof raw.title === 'string' ? raw.title : '',
  }
  const rawContent = obj(raw, 'content')
  if (rawContent) config.content = raw.content as ReadmaConfig['content']
  const description = str(raw, 'description')
  if (description !== undefined) config.description = description
  const repo = str(raw, 'repo')
  if (repo !== undefined) config.repo = repo
  if (obj(raw, 'links')) config.links = raw.links as ReadmaConfig['links']
  const language = str(raw, 'language')
  if (language !== undefined) {
    config.language = language as ReadmaConfig['language']
  }
  const packageRegistry = str(raw, 'packageRegistry')
  if (packageRegistry !== undefined) {
    config.packageRegistry = packageRegistry as ReadmaConfig['packageRegistry']
  }
  const pkgName = str(raw, 'pkgName')
  if (pkgName !== undefined) config.pkgName = pkgName
  const author = str(raw, 'author')
  if (author !== undefined) config.author = author
  if (obj(raw, 'contact')) {
    config.contact = raw.contact as ReadmaConfig['contact']
  }
  if (obj(raw, 'images')) config.images = raw.images as ReadmaConfig['images']
  if (obj(raw, 'license')) {
    config.license = raw.license as ReadmaConfig['license']
  }
  if (obj(raw, 'issueTemplates')) {
    config.issueTemplates = raw.issueTemplates as ReadmaConfig['issueTemplates']
  }
  const coc = str(raw, 'coc')
  if (coc !== undefined) config.coc = coc
  if (obj(raw, 'badges')) config.badges = raw.badges as ReadmaConfig['badges']
  if (obj(raw, 'toc')) config.toc = raw.toc as ReadmaConfig['toc']
  const repobeats = str(raw, 'repobeats')
  if (repobeats !== undefined) config.repobeats = repobeats
  if (obj(raw, 'sections')) {
    config.sections = raw.sections as ReadmaConfig['sections']
  }
  if (obj(raw, 'workspaceMember')) {
    config.workspaceMember = raw
      .workspaceMember as ReadmaConfig['workspaceMember']
  }
  if (obj(raw, 'root')) config.root = raw.root as ReadmaConfig['root']
  return config
}
/** A single config data issue, `path` locates the offending field */
export type ConfigIssue = {
  path: string
  message: string
}
/** Check helper collecting issues, obj and arr return the checked value on success */
type Checker = {
  push: (path: string, message: string) => void
  str: (path: string, value: unknown) => void
  reqStr: (path: string, value: unknown) => void
  bool: (path: string, value: unknown) => void
  enum_: (path: string, value: unknown, allowed: readonly string[]) => void
  obj: (
    path: string,
    value: unknown,
  ) => Record<string, unknown> | undefined
  arr: (path: string, value: unknown) => unknown[] | undefined
}
function createChecker(issues: ConfigIssue[]): Checker {
  const push = (path: string, message: string) => issues.push({ path, message })
  return {
    push,
    str: (path, value) => {
      if (value !== undefined && typeof value !== 'string') {
        push(path, `expected a string, got ${describeType(value)}`)
      }
    },
    reqStr: (path, value) => {
      if (value === undefined) push(path, 'expected a string, got undefined')
      else if (typeof value !== 'string') {
        push(path, `expected a string, got ${describeType(value)}`)
      }
    },
    bool: (path, value) => {
      if (value !== undefined && typeof value !== 'boolean') {
        push(path, `expected a boolean, got ${describeType(value)}`)
      }
    },
    enum_: (path, value, allowed) => {
      if (
        value !== undefined &&
        (typeof value !== 'string' || !allowed.includes(value))
      ) {
        push(path, `expected one of ${allowed.join(', ')}`)
      }
    },
    obj: (path, value) => {
      if (
        value !== undefined &&
        (typeof value !== 'object' || value === null || Array.isArray(value))
      ) {
        push(path, `expected an object, got ${describeType(value)}`)
        return undefined
      }
      return value as Record<string, unknown> | undefined
    },
    arr: (path, value) => {
      if (value !== undefined && !Array.isArray(value)) {
        push(path, `expected an array, got ${describeType(value)}`)
        return undefined
      }
      return value as unknown[] | undefined
    },
  }
}
function describeType(value: unknown): string {
  if (value === null) return 'null'
  if (Array.isArray(value)) return 'array'
  return typeof value
}
const REPO_SLUG_RE = /^\S+\/\S+$/u
const GH_TEMPLATE_EXTS = ['.yml', '.yaml', '.md'] as const
/** Validate a config against the data rules the engine relies on */
export function configIssues(
  config: Partial<ReadmaConfig>,
): ConfigIssue[] {
  const issues: ConfigIssue[] = []
  const check = createChecker(issues)
  if (typeof config.title !== 'string' || config.title.trim() === '') {
    issues.push({ path: 'title', message: 'a non empty title is required' })
  }
  check.str('description', config.description)
  if (
    config.repo !== undefined &&
    (typeof config.repo !== 'string' || !REPO_SLUG_RE.test(config.repo))
  ) {
    issues.push({
      path: 'repo',
      message: 'expected a github slug shaped as owner/name',
    })
  }
  check.enum_('language', config.language, ['ts', 'rs'])
  check.enum_('packageRegistry', config.packageRegistry, [
    'jsr',
    'npm',
    'crates.io',
  ])
  check.str('pkgName', config.pkgName)
  check.str('author', config.author)
  check.str('coc', config.coc)
  check.str('repobeats', config.repobeats)
  const links = check.obj('links', config.links)
  if (links) {
    check.str('links.repo', links.repo)
    check.str('links.doc', links.doc)
    check.str('links.demo', links.demo)
  }
  const contact = check.obj('contact', config.contact)
  if (contact) {
    check.str('contact.email', contact.email)
    check.str('contact.x', contact.x)
    check.str('contact.linkedin', contact.linkedin)
  }
  const images = check.obj('images', config.images)
  if (images) {
    check.str('images.logo', images.logo)
    check.str('images.screenshot', images.screenshot)
  }
  const license = check.obj('license', config.license)
  if (license) {
    check.str('license.id', license.id)
    check.str('license.file', license.file)
  }
  const templates = check.obj('issueTemplates', config.issueTemplates)
  if (templates) {
    for (const key of ['bug', 'feature'] as const) {
      const value = templates[key]
      if (
        value !== undefined &&
        (typeof value !== 'string' ||
          !GH_TEMPLATE_EXTS.some((ext) => value.endsWith(ext)))
      ) {
        check.push(
          `issueTemplates.${key}`,
          `expected a .yml, .yaml or .md filename`,
        )
      }
    }
  }
  const badges = check.obj('badges', config.badges)
  if (badges) {
    check.enum_('badges.style', badges.style, [
      'for-the-badge',
      'social',
      'flat',
      'flat-square',
      'plastic',
    ])
    const disabled = check.arr('badges.disabled', badges.disabled)
    if (disabled) {
      const allowed = [
        'linkedin',
        'msrv',
        'registry',
        'codecov',
        'contributors',
        'forks',
        'stars',
        'commitActivity',
        'actions',
        'issues',
        'pullRequests',
        'lastCommit',
        'release',
        'license',
      ]
      disabled.forEach((id, index) => {
        if (typeof id !== 'string' || !allowed.includes(id)) {
          check.push(`badges.disabled[${index}]`, `unknown badge id`)
        }
      })
    }
    const custom = check.arr('badges.custom', badges.custom)
    if (custom) {
      custom.forEach((badge, index) => {
        if (
          badge === null || typeof badge !== 'object' || Array.isArray(badge)
        ) {
          check.push(`badges.custom[${index}]`, 'expected an object')
          return
        }
        const record = badge as Record<string, unknown>
        check.reqStr(`badges.custom[${index}].name`, record.name)
        check.reqStr(`badges.custom[${index}].image`, record.image)
        check.reqStr(`badges.custom[${index}].link`, record.link)
      })
    }
  }
  const toc = check.obj('toc', config.toc)
  if (toc) {
    check.str('toc.title', toc.title)
    check.bool('toc.hide', toc.hide)
    check.bool('toc.backToTop', toc.backToTop)
  }
  const content = check.obj('content', config.content)
  if (content) {
    check.str('content.dir', content.dir)
  }
  const sections = check.obj('sections', config.sections)
  if (sections) {
    for (const [id, options] of Object.entries(sections)) {
      const record = check.obj(`sections.${id}`, options)
      if (!record) continue
      check.str(`sections.${id}.title`, record.title)
      check.bool(`sections.${id}.hide`, record.hide)
    }
  }
  const memberIssues = (
    path: string,
    member: unknown,
  ): void => {
    if (member === undefined) return
    if (
      member === null || typeof member !== 'object' || Array.isArray(member)
    ) {
      check.push(path, 'expected an object')
      return
    }
    const record = member as Record<string, unknown>
    check.reqStr(`${path}.pkgName`, record.pkgName)
    check.reqStr(`${path}.path`, record.path)
    check.reqStr(`${path}.description`, record.description)
  }
  memberIssues('workspaceMember', config.workspaceMember)
  const root = config.root === undefined
    ? undefined
    : check.obj('root', config.root)
  if (root) {
    const members = check.arr('root.members', root.members)
    if (members) {
      members.forEach((member, index) => {
        memberIssues(`root.members[${index}]`, member)
      })
    }
  }
  return issues
}
