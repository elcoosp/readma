import type { PackageRegistry, SourceLanguage } from './types.ts'
import { md } from './utils.ts'
import type { ReadmeContext } from './context.ts'

/** A readme section definition */
export type SectionDef = {
  /** Unique section id */
  id: string
  /** Displayed section title, also used to derive the toc anchor */
  title: string
  /** Render the section body, return undefined or an empty string to skip the section */
  render: (ctx: ReadmeContext) => string | undefined
}

/** Installation snippet for a package, derived from the language and registry */
export function installSnippet(
  pkgName: string,
  language: SourceLanguage,
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
  if (language === 'rs') return md.code(`cargo add ${pkgName}`)
  return undefined
}

/** Sections derived from the custom (non builtin) keys of `args.sections` */
export function customSections(ctx: ReadmeContext): SectionDef[] {
  const customKeys = Object.keys(ctx.args.sections).filter((key) =>
    !(BUILTIN_SECTION_IDS as readonly string[]).includes(key)
  )
  return customKeys.map((key) => ({
    id: key,
    title: key,
    render: () => ctx.args.sections[key],
  }))
}

/** All the sections of a readme in rendering order */
export function allSections(ctx: ReadmeContext): SectionDef[] {
  return [
    {
      id: 'about',
      title: '💡 About the project',
      render: aboutSection,
    },
    {
      id: 'features',
      title: '✨ Features',
      render: () => ctx.args.sections.features,
    },
    {
      id: 'gettingStarted',
      title: '🎉 Getting started',
      render: () => ctx.args.sections.gettingStarted,
    },
    {
      id: 'installation',
      title: '📋 Installation',
      render: () => ctx.args.sections.installation,
    },
    {
      id: 'usage',
      title: '🔧 Usage',
      render: () => ctx.args.sections.usage,
    },
    {
      id: 'roadmap',
      title: '🚀 Roadmap',
      render: () =>
        ctx.args.sections.roadmap.trim()
          ? `${ctx.args.sections.roadmap.trim()}

See the [open issues](${ctx.repoUrl}/issues) for a full list of proposed features (and known issues).`
          : undefined,
    },
    ...customSections(ctx),
    {
      id: 'contributing',
      title: '💻 Contributing',
      render: () => {
        const { contributing } = ctx.args.sections
        const contributingBody = contributing?.trim()
          ? `\n\n${contributing.trim()}`
          : ''
        if (!ctx.cocPath && !contributingBody) return undefined
        const cocNote = ctx.cocPath
          ? `> [!NOTE]
> Check the [code of conduct](${ctx.repoUrl}/tree/${ctx.branch}/${ctx.cocPath})`
          : ''
        return `Any contributions you make are **greatly appreciated**.
${cocNote}${contributingBody}`
      },
    },
    {
      id: 'contact',
      title: '📨 Contact',
      render: () =>
        `${ctx.args.author} - [@${ctx.args.xHandle}](https://twitter.com/${ctx.args.xHandle}) - [${ctx.fullEmail}](${ctx.fullEmail})

Project Link: [${ctx.repoUrl}](${ctx.repoUrl})`,
    },
    {
      id: 'acknowledgments',
      title: '👏 Acknowledgments',
      render: () => ctx.args.sections.acknowledgments,
    },
    {
      id: 'license',
      title: '📄 License',
      render: () => {
        const { license } = ctx
        if (!license.id) return 'None'
        return `<sup> Licensed under <a href="${ctx.repoUrl}/blob/master/${license.file}">${license.id} license</a></sup>`
      },
    },
  ]
}

/** About section body, with the optional screenshot and the workspace members table */
function aboutSection(ctx: ReadmeContext): string {
  const { args } = ctx
  const screenshot = ctx.screenshotSrc
    ? `<img src="${ctx.screenshotSrc}" alt="Product screenshot" />\n`
    : ''
  const members = args.root && args.root.members.length > 0
    ? `

> [!TIP]
> You are inside the entry point of **${args.repoName}** workspace, here is a list of available packages

${markdownMembersTable(args.root.members)}
`
    : ''
  return `${args.sections.about.trim()}

${screenshot}${members}`.trim()
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

/** Builtin section ids which are not rendered as custom sections */
export const BUILTIN_SECTION_IDS = [
  'projectDescription',
  'about',
  'features',
  'gettingStarted',
  'installation',
  'usage',
  'roadmap',
  'contributing',
  'acknowledgments',
] as const

/** Render every section definition, skipping the empty ones */
export function renderSections(
  ctx: ReadmeContext,
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
