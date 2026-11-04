import {
  type ContentFile,
  DEFAULT_CUSTOM_SECTION_ORDER,
  DEFAULT_SECTION_ORDER,
  DEFAULT_SECTION_TITLES,
  type PackageRegistry,
  type SourceLanguage,
} from './types.ts'
import { humanizeTitle } from './content.ts'
import { md } from './utils.ts'
import type { ReadmaContext } from './context.ts'
/** A readme section definition */
export type SectionDef = {
  /** Unique section id */
  id: string
  /** Displayed section title, also used to derive the toc anchor */
  title: string
  /** Render order, lower comes first */
  order: number
  /** Render the section body, return undefined or an empty string to skip the section */
  render: (ctx: ReadmaContext) => string | undefined
}
/** Installation snippet for a package, derived from the language and registry */
export function installSnippet(
  pkgName: string,
  language: SourceLanguage | undefined,
  packageRegistry: PackageRegistry | undefined,
): string | undefined {
  if (language === 'ts' && packageRegistry === 'jsr') {
    return md.code(`deno add ${pkgName}`)
  }
  if (language === 'ts' && packageRegistry === 'npm') {
    return [
      md.code(`pnpm add ${pkgName}`),
      md.code(`npm add ${pkgName}`),
      md.code(`yarn add ${pkgName}`),
      md.code(`deno add npm:${pkgName}`),
      md.code(`bun add ${pkgName}`),
    ].join('\n')
  }
  if (language === 'rs' && packageRegistry === 'crates.io') {
    return md.code(`cargo add ${pkgName}`)
  }
  return undefined
}
/** Resolve the displayed title of a content file section */
export function sectionTitleFor(
  ctx: ReadmaContext,
  file: ContentFile,
): string {
  return ctx.config.sections?.[file.id]?.title ?? file.title ??
    DEFAULT_SECTION_TITLES[file.id] ?? humanizeTitle(file.id)
}
/** Resolve the render order of a content file section */
export function sectionOrderFor(file: ContentFile): number {
  return file.order ??
    DEFAULT_SECTION_ORDER[file.id] ?? DEFAULT_CUSTOM_SECTION_ORDER
}
/** Resolve the hide flag of a content file section */
function sectionHiddenFor(ctx: ReadmaContext, file: ContentFile): boolean {
  return ctx.config.sections?.[file.id]?.hide ?? file.hide ?? false
}
/** Wrap the raw markdown body of a section */
function renderBody(
  ctx: ReadmaContext,
  file: ContentFile,
): string | undefined {
  const body = file.body.trim()
  if (body === '') return undefined
  switch (file.id) {
    case 'about':
      return aboutBody(ctx, body)
    case 'roadmap':
      return `${body}\n\nSee the [open issues](${ctx.repoUrl}/issues) for a full list of proposed features (and known issues).`
    default:
      return body
  }
}
/** About section body, with the optional screenshot and the workspace members table */
function aboutBody(ctx: ReadmaContext, body: string): string {
  const { config } = ctx
  const screenshot = ctx.screenshotSrc
    ? `<img src="${ctx.screenshotSrc}" alt="Product screenshot" />\n`
    : ''
  const members = config.root && config.root.members.length > 0
    ? `

> [!TIP]
> You are inside the entry point of **${
      config.repo?.split('/')[1] ?? config.title
    }** workspace, here is a list of available packages

${markdownMembersTable(config.root.members)}
`
    : ''
  return `${body}

${screenshot}${members}`.trim()
}
/** Contributing section body with the optional code of conduct note */
function contributingBody(
  ctx: ReadmaContext,
  body: string,
): string | undefined {
  const trimmed = body.trim()
  if (!ctx.cocPath && !trimmed) return undefined
  const cocNote = ctx.cocPath
    ? `> [!NOTE]
> Check the [code of conduct](${ctx.repoUrl}/tree/${ctx.branch}/${ctx.cocPath})`
    : ''
  const base = trimmed ||
    'Any contributions you make are **greatly appreciated**.'
  return `${base}\n${cocNote}`.trim()
}
/** Contact section body derived from the config contact fields */
function contactBody(ctx: ReadmaContext): string | undefined {
  const { config } = ctx
  const contact = config.contact
  if (!contact) return undefined
  const parts: string[] = []
  if (config.author) parts.push(config.author)
  if (contact.x) parts.push(`[@${contact.x}](https://x.com/${contact.x})`)
  if (contact.linkedin) {
    parts.push(
      `[${contact.linkedin}](https://linkedin.com/in/${contact.linkedin})`,
    )
  }
  if (contact.email) {
    parts.push(`[${contact.email}](mailto:${contact.email})`)
  }
  if (parts.length === 0) return undefined
  const projectLink = ctx.repoUrl
    ? `\n\nProject Link: [${config.repo ?? ctx.repoUrl}](${ctx.repoUrl})`
    : ''
  return `${parts.join(' - ')}${projectLink}`
}
/** License section body, branch aware when the repo url is known */
function licenseBody(ctx: ReadmaContext): string | undefined {
  const { license } = ctx
  if (!license.id) return undefined
  if (!ctx.repoUrl) return `<sup>Licensed under the ${license.id} license</sup>`
  return `<sup> Licensed under <a href="${ctx.repoUrl}/blob/${ctx.branch}/${license.file}">${license.id} license</a></sup>`
}
/** Installation fallback derived from the config, undefined when unknown */
function installationFallback(ctx: ReadmaContext): string | undefined {
  const { config } = ctx
  if (!ctx.pkgName) return undefined
  return installSnippet(ctx.pkgName, config.language, config.packageRegistry)
}
/**
 * Assemble every section definition of a readme from the loaded content
 * files, the engine generated sections and the config overrides.
 *
 * Definitions are sorted by render order, hidden and special files are
 * dropped and empty bodies render as undefined.
 */
export function assembleSections(ctx: ReadmaContext): SectionDef[] {
  const sectionFiles = ctx.content.filter((file) => !file.special)
  const defs: SectionDef[] = sectionFiles
    .filter((file) => !sectionHiddenFor(ctx, file))
    .map((file) => ({
      id: file.id,
      title: sectionTitleFor(ctx, file),
      order: sectionOrderFor(file),
      render: (renderCtx: ReadmaContext) =>
        file.id === 'contributing'
          ? contributingBody(renderCtx, file.body)
          : renderBody(renderCtx, file),
    }))
  if (!defs.some((def) => def.id === 'installation')) {
    const snippet = installationFallback(ctx)
    if (snippet) {
      defs.push({
        id: 'installation',
        title: DEFAULT_SECTION_TITLES.installation,
        order: DEFAULT_SECTION_ORDER.installation,
        render: () => snippet,
      })
    }
  }
  if (!defs.some((def) => def.id === 'contributing') && ctx.cocPath) {
    defs.push({
      id: 'contributing',
      title: DEFAULT_SECTION_TITLES.contributing,
      order: DEFAULT_SECTION_ORDER.contributing,
      render: (renderCtx: ReadmaContext) => contributingBody(renderCtx, ''),
    })
  }
  if (!defs.some((def) => def.id === 'contact')) {
    defs.push({
      id: 'contact',
      title: DEFAULT_SECTION_TITLES.contact,
      order: DEFAULT_SECTION_ORDER.contact,
      render: contactBody,
    })
  }
  if (!defs.some((def) => def.id === 'license')) {
    defs.push({
      id: 'license',
      title: DEFAULT_SECTION_TITLES.license,
      order: DEFAULT_SECTION_ORDER.license,
      render: licenseBody,
    })
  }
  return defs
    .filter((def) => ctx.config.sections?.[def.id]?.hide !== true)
    .toSorted((a, b) => a.order - b.order || a.id.localeCompare(b.id))
}
/** Markdown table listing the workspace members */
export function markdownMembersTable(
  members: { pkgName: string; path: string; description: string }[],
): string {
  const header = ['Package', 'Description']
  const rows = members.map(({ pkgName, path: memberPath, description }) => [
    `[${pkgName}](${memberPath})`,
    description,
  ])
  return markdownTable([header, ...rows])
}
/** Render every section definition, skipping the empty ones */
export function renderSections(
  ctx: ReadmaContext,
  defs: SectionDef[],
  renderSection: (title: string, content: string | undefined) => string,
): string {
  const rendered: string[] = []
  for (const def of defs) {
    const content = def.render(ctx)
    if (content !== undefined && content.trim() !== '') {
      rendered.push(renderSection(def.title, content))
    }
  }
  return rendered.join('\n')
}
/** Minimal markdown table renderer (kept dependency free for the common case) */
export function markdownTable(rows: string[][]): string {
  if (rows.length === 0) return ''
  const columnCount = Math.max(...rows.map((row) => row.length))
  const widths = Array.from(
    { length: columnCount },
    (_, columnIndex) =>
      Math.max(...rows.map((row) => (row[columnIndex] ?? '').length)),
  )
  const formatRow = (row: string[]) =>
    `| ${
      Array.from(
        { length: columnCount },
        (_, columnIndex) =>
          (row[columnIndex] ?? '').padEnd(widths[columnIndex]),
      ).join(' | ')
    } |`
  const separator = `| ${
    widths.map((width) => '-'.repeat(width)).join(' | ')
  } |`
  return [
    formatRow(rows[0]),
    separator,
    ...rows.slice(1).map((row) => formatRow(row)),
  ].join('\n')
}
