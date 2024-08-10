import { Tocer } from "./toc.ts";
import type { MdSrc, ReadmeTemplateArgs } from "./types.ts";
/** Markdown source */
//  TODO: Once sections derive all the table of contents
export const readme = ({
  github_username,
  repo_name,
  x_handle,
  linkedin_username,
  domain,
  email,
  title,
  author,
  // TODO: add commit convention
  sections: {
    project_description,
    about,
    installation,
    acknowledgments,
    getting_started,
    roadmap,
    usage,
  },
  images,
  template,
  language,
  back_to_top,
}: ReadmeTemplateArgs) => {
  // FIXME: domain + ext
  const fullEmail = `${email}@${domain}.com`;
  // TODO: allow other repo host
  const repoUrl = `https://github.com/${github_username}/${repo_name}`;
  const tocer = new Tocer(back_to_top);
  // TODO: use lit-html extension to get intellisense inside templates
  const ifLang = (lang: ReadmeTemplateArgs["language"], src: MdSrc) =>
    language == lang ? src : "";
  const projectShields = `
<!-- PROJECT SHIELDS -->
[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]
${linkedin_username ? "[![LinkedIn][linkedin-shield]][linkedin-url]" : ""}
${ifLang("rs", "![MSRV][crates-msrv-shield]")}
`.trim();
  return `
<a id="readme-top"></a>
${projectShields}

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="${repoUrl}">
    <img src="${images.logo}" style="max-height: 200px; object-fit: contain;" alt="Logo">
  </a>

<h3 align="center">${title}</h3>

  <p align="center">
    ${project_description}
    <br />
    <a href="${repoUrl}"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="${repoUrl}">View Demo</a>
    ·
    <a href="${repoUrl}/issues/new?labels=bug&template=-${template.bug_report}.md">Report Bug</a>
    ·
    <a href="${repoUrl}/issues/new?labels=enhancement&template=${template.feat_request}.md">Request Feature</a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of contents</summary>
  <ol>
    <li><a href="#about-the-project">About the project</a></li>
    <li><a href="#getting-started">Getting started</a></li>
    <li><a href="#installation">Installation</a></li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>

${tocer.section(
    "About the project",
    `
<img src="${images.screenshot}" alt="Product screenshot" />
  
${about}`,
  )
    }
${tocer.section("Getting started", getting_started)}
${tocer.section("Installation", installation)}
${tocer.section("Usage", usage)}
${tocer.section(
      "Roadmap",
      `
${roadmap}

See the [open issues](${repoUrl}/issues) for a full list of proposed features (and known issues).
`,
    )
    }
${tocer.section(
      "Contributing",
      `
Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (\`git checkout-b feat/AmazingFeature\`)
3. Commit your Changes (\`git commit-m 'Add some AmazingFeature'\`)
4. Push to the Branch (\`git push origin feat/AmazingFeature\`)
5. Open a Pull Request
`,
    )
    }
${tocer.section(
      "License",
      `Distributed under the MIT License. See \`LICENSE.txt\` for more information.`,
    )
    }
${tocer.section(
      "Contact",
      `
${author} - [@${x_handle}](https://twitter.com/${x_handle}) - [${fullEmail}](${fullEmail})

Project Link: [${repoUrl}](${repoUrl})
`,
    )
    }
${tocer.section("Acknowledgments", acknowledgments)}
<!--MARKDOWN LINKS & IMAGES-- >
<!--https://www.markdownguide.org/basic-syntax/#reference-style-links -->
${ifLang(
      "rs",
      "[crates-msrv-shield]: https://img.shields.io/crates/msrv/${repo_name}.svg?style=for-the-badge",
    )
    }
[contributors-shield]: https://img.shields.io/github/contributors/${github_username}/${repo_name}.svg?style=for-the-badge
[contributors-url]: ${repoUrl}/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/${github_username}/${repo_name}.svg?style=for-the-badge
[forks-url]: ${repoUrl}/network/members
[stars-shield]: https://img.shields.io/github/stars/${github_username}/${repo_name}.svg?style=for-the-badge
[stars-url]: ${repoUrl}/stargazers
[issues-shield]: https://img.shields.io/github/issues/${github_username}/${repo_name}.svg?style=for-the-badge
[issues-url]: ${repoUrl}/issues
[license-shield]: https://img.shields.io/github/license/${github_username}/${repo_name}.svg?style=for-the-badge
[license-url]: ${repoUrl}/blob/master/LICENSE.txt
${linkedin_username
      ? `[linkedin-url]: https://linkedin.com/in/${linkedin_username}
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555`
        .trim()
      : ""
    }
`.trim() +
    // Should end with a new line
    "\n";
};
