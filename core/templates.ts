import { renderShields, shields } from "./shields.ts"
import { Tocer } from "./toc.ts"
import { $ } from "@david/dax"
import type { ReadmeTemplateArgs } from "./types.ts"
const getBranch = async () => {
  // Workaround github ci
  const GITHUB_HEAD_REF = Deno.env.get("GITHUB_HEAD_REF")
  if (GITHUB_HEAD_REF) return GITHUB_HEAD_REF
  return (await $`git branch --show-current`.text()) || "main"
}
/** Markdown source */
//  TODO: Once sections derive all the table of contents, enable custom sections
export const readme = async ({
  workspaceMember,
  githubUsername,
  repoName,
  xHandle,
  linkedinUsername,
  domain,
  email,
  title,
  author,
  repobeats,
  urls,
  // TODO: add commit convention
  sections: {
    projectDescription,
    about,
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
}: ReadmeTemplateArgs) => {
  // FIXME: domain + ext
  const fullEmail = `${email}@${domain}.com`
  const repoUrl = urls?.repo ||
    `https://github.com/${githubUsername}/${repoName}`
  const demoUrl = urls?.demo || repoUrl
  const branch = await getBranch()
  const tocer = new Tocer(backToTop)
  const commitActivityInterval = "w"
  const tocVar = "$$TOC$$"
  const badgeStyle = "for-the-badge"
  const { shieldsBadges, shieldsRefs } = renderShields(
    shields({
      repoName,
      repoUrl,
      githubUsername,
      workspaceMember,
      style: badgeStyle,
      commitActivityInterval,
      branch,
      language,
      linkedinUsername,
    }),
  )
  const logoSrc =
    `https://raw.githubusercontent.com/${githubUsername}/${repoName}/HEAD/${images.logo}`
  const projectShields = `
<!-- PROJECT SHIELDS -->
${shieldsBadges}
`.trim()
  const withoutToc = `
<a id="readme-top"></a>
${projectShields}

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="${repoUrl}">
    <img src="${logoSrc}" style="max-height: 200px; object-fit: contain;" alt="Logo">
  </a>
  <h3 align="center">${title}</h3>
  ${workspaceMember ? `<h4 align="center">${workspaceMember}</h4>` : ""}
  <p align="center">
    ${projectDescription}
    <br />
    <a href="${repoUrl}"><strong>📖 Explore the docs »</strong></a>
    <br />
    <br />
    <a href="${demoUrl}">View Demo</a>
    ·
    <a href="${repoUrl}/issues/new?labels=bug&template=-${template.bugReport}.md">Report Bug</a>
    ·
    <a href="${repoUrl}/issues/new?labels=enhancement&template=${template.featRequest}.md">Request Feature</a>
  </p>
</div>
${
    workspaceMember
      ? `
> [!NOTE]
> You are inside the **${workspaceMember}** workspace member package, not the entry point
`
      : ""
  }
${tocVar}

${
    tocer.section(
      "💡 About the project",
      `
<img src="${images.screenshot}" alt="Product screenshot" />
  
${about}`,
    )
  }
${tocer.section("🎉 Getting started", gettingStarted)}
${tocer.section("📋 Installation", installation)}
${tocer.section("🔧 Usage", usage)}
${
    tocer.section(
      "🚀 Roadmap",
      `
${roadmap}

See the [open issues](${repoUrl}/issues) for a full list of proposed features (and known issues).
`,
    )
  }
${
    tocer.section(
      "💻 Contributing",
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
      "📄 License",
      `Distributed under the MIT License. See \`LICENSE.txt\` for more information.`,
    )
  }
${
    tocer.section(
      "📨 Contact",
      `
${author} - [@${xHandle}](https://twitter.com/${xHandle}) - [${fullEmail}](${fullEmail})

Project Link: [${repoUrl}](${repoUrl})
`,
    )
  }
${tocer.section("👏 Acknowledgments", acknowledgments)}
<!--MARKDOWN LINKS & IMAGES-- >
<!--https://www.markdownguide.org/basic-syntax/#reference-style-links -->
${
    repobeats
      ? `![Alt](https://repobeats.axiom.co/api/embed/${repobeats}.svg "Repobeats analytics image")`
      : ""
  }
${
    // The new line is absolutely necessary
    "\n" + shieldsRefs}
`.trim() +
    // Should end with a new line
    "\n"

  return withoutToc.replace(tocVar, tocer.toc())
}
