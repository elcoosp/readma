import { join } from '@std/path'
import { type ReadmeContext, resolveContext } from './context.ts'
import { renderShields } from './shields.ts'
import { allSections, renderSections } from './sections.ts'
import { Tocer } from './toc.ts'
import type { GlobalOptions, ReadmeTemplateArgs, TemplateFn } from './types.ts'

/** Render the readme header (logo, title, description, quick links, badges) */
export function renderHeader(ctx: ReadmeContext): string {
  const { args } = ctx
  const { shieldsBadges } = renderShields(ctx.badgeList)
  const workspaceMemberNote = args.workspaceMember
    ? `
> [!NOTE]
> You are inside the **${args.workspaceMember.pkgName}** workspace member package, not the repository entry point
`
    : ''
  return `<a id="readme-top"></a>
<!-- PROJECT LOGO -->
<br />
<div align="center">
<a href="${ctx.repoUrl}">
<img src="${ctx.logoSrc}" style="max-height: 200px; object-fit: contain;" alt="Logo">
</a>
<h3 align="center">${args.title}</h3>
${
    args.workspaceMember
      ? `<h4 align="center">${args.workspaceMember.pkgName}</h4>`
      : ''
  }
<p align="center">
${args.sections.projectDescription}
<br />
<a href="${ctx.docUrl}"><strong>📖 Explore the docs »</strong></a>
<br />
<br />
<a href="${ctx.demoUrl}">View Demo</a>
·
<a href="${ctx.issueUrls.bug}">Report Bug</a>
·
<a href="${ctx.issueUrls.feat}">Request Feature</a>
  </p>
  </div>
${workspaceMemberNote}
${shieldsBadges}`
}

/** Render the readme footer (repobeats analytics and the markdown reference links) */
export function renderFooter(ctx: ReadmeContext): string {
  const { shieldsRefs } = renderShields(ctx.badgeList)
  const repobeats = ctx.args.repobeats
    ? `![Alt](https://repobeats.axiom.co/api/embed/${ctx.args.repobeats}.svg "Repobeats analytics image")`
    : ''
  return `<!--MARKDOWN LINKS & IMAGES-->
<!--https://www.markdownguide.org/basic-syntax/#reference-style-links -->
${repobeats}
${shieldsRefs}`
}

/** Render the full readme markdown from an already resolved context */
function renderFromContext(ctx: ReadmeContext): string {
  const tocer = new Tocer(ctx.args.backToTop, ctx.args.toc)
  const body = renderSections(
    ctx,
    allSections(ctx),
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
 * Render a readme based on the template args, without any write side effect
 *
 * @param rt Readme arguments to feed the template
 * @param options Global options
 */
export const readme: TemplateFn = async (rt, options = {}) => {
  const ctx = await resolveContext(rt, options)
  return renderFromContext(ctx)
}

/**
 * Render a readme via {@link readme} then write it as `README.md` inside the
 * resolved `folderPath` option, unless `dryRun` is set
 *
 * @param rt Readme arguments to feed the template
 * @param options Global options
 * @returns The rendered readme markdown
 */
export async function writeReadme(
  rt: ReadmeTemplateArgs,
  options: Partial<GlobalOptions> = {},
): Promise<string> {
  const ctx = await resolveContext(rt, options)
  const rendered = renderFromContext(ctx)
  if (!ctx.options.dryRun) {
    const folderPath = ctx.options.folderPath === '.'
      ? join(
        ctx.options.workspaceRootPath,
        rt.workspaceMember?.path ?? '',
      )
      : ctx.options.folderPath
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
