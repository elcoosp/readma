import { join } from '@std/path'
import { type ReadmaContext, resolveContext } from './context.ts'
import { renderShields } from './shields.ts'
import { assembleSections, renderSections } from './sections.ts'
import { Tocer } from './toc.ts'
import type { GlobalOptions, ReadmaConfig, TemplateFn } from './types.ts'
/** Render the readme header (logo, title, description, quick links, badges) */
export function renderHeader(ctx: ReadmaContext): string {
  const { config } = ctx
  const { shieldsBadges } = renderShields(ctx.badgeList)
  const memberNote = config.workspaceMember
    ? `
> [!NOTE]
> You are inside the **${config.workspaceMember.pkgName}** workspace member package, not the repository entry point
`
    : ''
  const lines: string[] = [
    '<a id="readme-top"></a>',
    '<!-- PROJECT LOGO -->',
    '<br />',
    '<div align="center">',
  ]
  if (ctx.logoSrc) {
    lines.push(
      `<a href="${ctx.repoUrl ?? ''}">`,
      '<img src="' + ctx.logoSrc +
        '" style="max-height: 200px; object-fit: contain;" alt="Logo">',
      '</a>',
    )
  }
  lines.push(`<h3 align="center">${config.title}</h3>`)
  if (config.workspaceMember) {
    lines.push(`<h4 align="center">${config.workspaceMember.pkgName}</h4>`)
  }
  const docLink = config.links?.doc
    ? `<a href="${config.links.doc}"><strong>Explore the docs »</strong></a>`
    : undefined
  const quickLinks: string[] = []
  if (config.links?.demo) {
    quickLinks.push(`<a href="${config.links.demo}">View Demo</a>`)
  }
  if (ctx.issueUrls.bug) {
    quickLinks.push(`<a href="${ctx.issueUrls.bug}">Report Bug</a>`)
  }
  if (ctx.issueUrls.feat) {
    quickLinks.push(`<a href="${ctx.issueUrls.feat}">Request Feature</a>`)
  }
  const hasIntro = config.description !== undefined || docLink !== undefined ||
    quickLinks.length > 0
  if (hasIntro) {
    lines.push('<p align="center">')
    if (config.description !== undefined) {
      lines.push(`${config.description}<br />`)
    }
    if (docLink) {
      lines.push(docLink, '<br />', '<br />')
    }
    if (quickLinks.length > 0) {
      lines.push(quickLinks.join('\n·\n'))
    }
    lines.push('</p>')
  }
  lines.push('</div>')
  const headerFile = ctx.content.find((file) => file.special === 'header')
  const headerBody = headerFile?.body.trim()
    ? `\n${headerFile.body.trim()}\n`
    : ''
  return `${lines.join('\n')}
${memberNote}${shieldsBadges}${headerBody}`
}
/** Render the readme footer (repobeats analytics and the markdown reference links) */
export function renderFooter(ctx: ReadmaContext): string {
  const { shieldsRefs } = renderShields(ctx.badgeList)
  const footerFile = ctx.content.find((file) => file.special === 'footer')
  const footerBody = footerFile?.body.trim()
    ? `${footerFile.body.trim()}\n`
    : ''
  const repobeats = ctx.config.repobeats
    ? `![Alt](https://repobeats.axiom.co/api/embed/${ctx.config.repobeats}.svg "Repobeats analytics image")\n`
    : ''
  return `${footerBody}${repobeats}<!--MARKDOWN LINKS & IMAGES-->
<!--https://www.markdownguide.org/basic-syntax/#reference-style-links -->
${shieldsRefs}`
}
/** Render the full readme markdown from an already resolved context */
function renderFromContext(ctx: ReadmaContext): string {
  const tocer = new Tocer(ctx.config.toc?.backToTop ?? false, ctx.config.toc)
  const body = renderSections(
    ctx,
    assembleSections(ctx),
    (title, content) => tocer.section(title, content),
  )
  const tocBlock = tocer.toc()
  return `${
    [
      renderHeader(ctx),
      tocBlock,
      body,
      renderFooter(ctx),
    ]
      .filter((part) => part.trim() !== '')
      .join('\n\n')
  }\n`
}
/**
 * Render a readme based on the config, without any write side effect.
 *
 * The content files are taken from the `content` option when provided,
 * otherwise they are loaded from the content directory of the workspace root.
 *
 * @param config Readma config feeding the template
 * @param options Global options
 */
export const readme: TemplateFn = async (config, options = {}) => {
  const ctx = await resolveContext(config, options)
  return renderFromContext(ctx)
}
/**
 * Render a readme via {@link readme} then write it as `README.md` inside the
 * resolved folder path (the `folderPath` option, the workspace member path or
 * the workspace root), unless `dryRun` is set
 *
 * @param config Readma config feeding the template
 * @param options Global options
 * @returns The rendered readme markdown
 */
export async function writeReadme(
  config: ReadmaConfig,
  options: Partial<GlobalOptions> = {},
): Promise<string> {
  const ctx = await resolveContext(config, options)
  const rendered = renderFromContext(ctx)
  if (!ctx.options.dryRun) {
    const folderPath = ctx.options.folderPath ??
      join(ctx.options.workspaceRootPath, config.workspaceMember?.path ?? '')
    const filepath = join(folderPath, 'README.md')
    try {
      await Deno.writeTextFile(filepath, rendered)
    } catch (error) {
      throw new Error(
        `Expected ${folderPath} folder to exist, so that we can write the rendered markdown output inside, got error ${error}`,
        { cause: error },
      )
    }
  }
  return rendered
}
