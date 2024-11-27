import { $ } from '@david/dax'
import { join } from '@std/path'
import * as yml from '@std/yaml'
import { markdownTable } from 'markdown-table'
import { renderShields, shields } from './shields.ts'
import { Tocer } from './toc.ts'
import type * as types from './types.ts'
const getBranch = async () => {
  // Workaround github ci
  const GITHUB_HEAD_REF = Deno.env.get('GITHUB_HEAD_REF')
  if (GITHUB_HEAD_REF) return GITHUB_HEAD_REF
  return (await $`git branch --show-current`.text()) || 'main'
}
//  TODO: Once sections derive all the table of contents, enable custom sections
/** Generate one or more readme (if there is workspace members) based on {@link ReadmeTemplateArgs} */
export const readme: types.TemplateFn = async ({
  workspaceMember,
  githubUsername,
  repoName,
  xHandle,
  linkedinUsername,
  domain,
  email,
  title,
  author,
  root,
  repobeats,
  packageRegistry,
  urls,
  // TODO: add commit convention
  sections: {
    projectDescription,
    about,
    features,
    installation,
    acknowledgments,
    gettingStarted,
    roadmap,
    usage,
  },
  images,
  template,
  language,
  backToTop,
  vcsName = 'github',
  domainExt = 'com',
  license,
  badgeStyle = 'for-the-badge',
}, globalOptions) => {
  const fullEmail = `${email}@${domain}.${domainExt}`
  const repoUrl = urls?.repo ||
    `https://${vcsName}.com/${githubUsername}/${repoName}`
  const docUrl = urls?.doc || repoUrl
  const demoUrl = urls?.demo || repoUrl
  const branch = await getBranch()
  const tocer = new Tocer(backToTop)
  const commitActivityInterval = 'w'
  const tocVar = '$$TOC$$'
  const { shieldsBadges, shieldsRefs } = renderShields(
    shields({
      packageRegistry,
      vcsName,
      repoName,
      repoUrl,
      githubUsername,
      workspaceMember,
      badgeStyle,
      commitActivityInterval,
      branch,
      language,
      linkedinUsername,
    }),
  )
  const ghContentUrl = (x = '') =>
    `https://raw.githubusercontent.com/${githubUsername}/${repoName}/HEAD/${x}`
  const logoSrc = ghContentUrl(images.logo)
  const screenshotSrc = ghContentUrl(images.screenshot)
  const licenseSectionBody = license === 'MIT'
    ? 'Distributed under the MIT License. See \`LICENSE.txt\` for more information.'
    : 'Not declared'

  const getIssueTemplateUrl = async (templateFilename: string) => {
    const fileStr = await Deno.readTextFile(
      join(
        globalOptions.workspaceRootPath,
        '.github',
        'ISSUE_TEMPLATE',
        templateFilename,
      ),
    )
    const {
      title,
      labels,
      assignees,
    } = yml.parse(fileStr) as {
      title: string
      labels: string
      assignees: string[]
      // The rest is ignored hence unknown
      name: unknown
      description: unknown
      body: unknown
    }
    const urlParams = new URLSearchParams({
      title,
      labels,
      assignees: assignees.toString(),
    })
    return `${repoUrl}/issues/new?template=${
      // TODO should read template & feed default values into the uri encoded query string
      templateFilename}&${urlParams}`
  }
  const projectShields = `
<!-- PROJECT SHIELDS -->
${shieldsBadges}
`.trim()
  const withoutToc = `${
    `
<a id="readme-top"></a>
${projectShields}

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="${repoUrl}">
    <img src="${logoSrc}" style="max-height: 200px; object-fit: contain;" alt="Logo">
  </a>
  <h3 align="center">${title}</h3>
  ${workspaceMember ? `<h4 align="center">${workspaceMember.pkgName}</h4>` : ''}
  <p align="center">
    ${projectDescription}
    <br />
    <a href="${docUrl}"><strong>📖 Explore the docs »</strong></a>
    <br />
    <br />
    <a href="${demoUrl}">View Demo</a>
    ·
    <a href="${await getIssueTemplateUrl(template.bugReport)}">Report Bug</a>
    ·
    <a href="${await getIssueTemplateUrl(
      template.featRequest,
    )}">Request Feature</a>
  </p>
</div>
${
      workspaceMember
        ? `
> [!NOTE]
> You are inside the **${workspaceMember.pkgName}** workspace member package, not the repository entry point
`
        : ''
    }
${tocVar}

${
      tocer.section(
        '💡 About the project',
        `
${about}

${
          images.screenshot
            ? `<img src="${screenshotSrc}" alt="Product screenshot" />\n`
            : ''
        }
${
          root && root.members.length > 0
            ? `> [!TIP]
> You are inside the entry point of **${repoName}** workspace, here is a list of available packages

${
              markdownTable([
                ['Package', 'Description'],
              ].concat(
                root.members.map((
                  { pkgName, path, description },
                ) => [`[${pkgName}](${path})`, description]),
              ))
            }
`
            : ''
        }
`,
      )
    }
${tocer.section('✨ Features', features)}
${tocer.section('🎉 Getting started', gettingStarted)}
${tocer.section('📋 Installation', installation)}
${tocer.section('🔧 Usage', usage)}
${
      tocer.section(
        '🚀 Roadmap',
        `
${roadmap}

See the [open issues](${repoUrl}/issues) for a full list of proposed features (and known issues).
`,
      )
    }
${
      tocer.section(
        '💻 Contributing',
        `
Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (\`git checkout-b feat/AmazingFeature\`)
3. Commit your Changes (\`git commit -m 'Add some AmazingFeature'\`)
4. Push to the Branch (\`git push origin feat/AmazingFeature\`)
5. Open a Pull Request
`,
      )
    }
${
      tocer.section(
        '📄 License',
        licenseSectionBody,
      )
    }
${
      tocer.section(
        '📨 Contact',
        `
${author} - [@${xHandle}](https://twitter.com/${xHandle}) - [${fullEmail}](${fullEmail})

Project Link: [${repoUrl}](${repoUrl})
`,
      )
    }
${tocer.section('👏 Acknowledgments', acknowledgments)}
<!--MARKDOWN LINKS & IMAGES-- >
<!--https://www.markdownguide.org/basic-syntax/#reference-style-links -->
${
      repobeats
        ? `![Alt](https://repobeats.axiom.co/api/embed/${repobeats}.svg "Repobeats analytics image")`
        : ''
    }
${
      // The new line is absolutely necessary
      `\n${shieldsRefs}`}
`.trim()
  }\n`

  return withoutToc.replace(tocVar, tocer.toc())
}
