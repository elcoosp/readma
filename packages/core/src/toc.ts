import { paramCase } from '@wok/case'
import type { MdSrc } from './types.ts'
/** Derive a table of content */
export class Tocer {
  hasBackToTop: boolean
  sections: string[]
  constructor(hasBackToTop: boolean) {
    this.hasBackToTop = hasBackToTop
    this.sections = []
  }
  toc(title = 'Table of contents') {
    return `
<!-- TABLE OF CONTENTS -->
<details>
  <summary>${title}</summary>
  <ol>${
      this.sections.map((s) =>
        `\n   <li><a href="#${paramCase(s)}">${s}</a></li>`
      )
        .join('')
    }
  </ol>
</details>
    `.trim()
  }
  section(title: string, content: MdSrc | undefined) {
    this.sections.push(title)
    const backToTopMd = this.hasBackToTop
      ? `<p align="right">(<a href="#readme-top">back to top</a>)</p>`
      : ''
    const trimmed = `
## ${title}

${content ? content.trim() : ''}

${backToTopMd}`.trim()
    return `${trimmed}\n`
  }
}
