import type { MdSrc } from "./types.ts";

// TODO rely on https://github.com/a-ahandani/ah-toc for sweetness of the process
/** Derive a table of content */
export class Tocer {
  hasBackToTop: boolean;
  constructor(hasBackToTop: boolean) {
    this.hasBackToTop = hasBackToTop;
  }
  section(title: string, content: MdSrc) {
    const backToTopMd = this.hasBackToTop
      ? `<p align="right">(<a href="#readme-top">back to top</a>)</p>`
      : "";
    return `
## ${title}

${content.trim()}

${backToTopMd}`.trim() + "\n";
  }
}
