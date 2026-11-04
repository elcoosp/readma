import type { MdSrc } from './types.ts'

/** Type safe error thrown by readma */
export class ReadmaError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options)
    this.name = 'ReadmaError'
  }
}

/** Quick utils to avoid ugly escaping everywhere */
export const md = {
  /** Return code between backticks with an optional lang */
  code: (c: MdSrc, lng = 'sh'): string => `\`\`\`${lng}\n${c.trim()}\n\`\`\``,
  /** Return a markdown link */
  link: (text: MdSrc, url: string): string => `[${text}](${url})`,
  /** Return a markdown image */
  img: (alt: MdSrc, src: string): string => `![${alt}](${src})`,
}

/**
 * Slugify a markdown heading the same way GitHub does it for its anchors.
 *
 * The algorithm: lowercase, drop every character which is not a word
 * character, a space, an underscore or an hyphen (this includes emojis and
 * punctuation), then turn spaces into hyphens (without collapsing them).
 *
 * @example
 * ```ts
 * ghSlug('About the project') // 'about-the-project'
 * ghSlug('\u{1F4A1} Features') // '-features' (pictographs are dropped)
 * ghSlug('Contact & support') // 'contact--support'
 * ```
 */
export function ghSlug(heading: string): string {
  const cleaned = heading
    .toLowerCase()
    .replaceAll(/[^\p{L}\p{N} _-]/gu, '')
  return cleaned.replaceAll(' ', '-')
}
