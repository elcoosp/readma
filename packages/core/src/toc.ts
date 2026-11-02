import type { MdSrc, TocConfig } from './types.ts'
import { ghSlug } from './utils.ts'
/** Derive a table of content with GitHub compatible anchors */
export class Tocer {
  hasBackToTop: boolean
  title: string
  hide: boolean
  sections: string[]
  /** Already emitted anchors, used to deduplicate like GitHub does */
  seenAnchors: Map<string, number>

  constructor(hasBackToTop: boolean, tocConfig: TocConfig = {}) {
    this.hasBackToTop = hasBackToTop
    this.title = tocConfig.title ?? 'Table of contents'
    this.hide = tocConfig.hide ?? false
    this.sections = []
    this.seenAnchors = new Map()
  }

  /** Compute the GitHub compatible anchor of a section title, deduplicated on re-use */
  anchor(title: string): string {
    const base = ghSlug(title)
    const count = this.seenAnchors.get(base) ?? 0
    this.seenAnchors.set(base, count + 1)
    return count === 0 ? base : `${base}-${count}`
  }

  /** Hideable markdown anchor block pointing to every registered section */
  toc(): MdSrc {
    if (this.hide || this.sections.length === 0) return ''
    return `
<!-- TABLE OF CONTENTS -->
<details>
  <summary>${this.title}</summary>
  <ol>${
      this.sections.map((s) =>
        `\n   <li><a href="#${this.anchor(s)}">${s}</a></li>`
      )
        .join('')
    }
  </ol>
</details>
    `.trim()
  }

  /** Register a section and render it with an optional back to top button */
  section(title: string, content: MdSrc | undefined): MdSrc {
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
