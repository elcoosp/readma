import * as yml from '@std/yaml'
import { join } from '@std/path'
import { io } from './io.ts'
import { type ContentFile, SPECIAL_CONTENT_IDS } from './types.ts'
import { ReadmaError } from './utils.ts'
export { DEFAULT_CONTENT_DIR } from './types.ts'
/** Front matter values understood inside a content file */
export type FrontMatter = {
  title?: string
  order?: number
  hide?: boolean
}
/** Front matter block delimiting the meta from the markdown body */
const FRONT_MATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/
/**
 * Split a content file into its front matter meta and markdown body.
 *
 * @param text Raw content file text
 * @param file File label used in error messages
 * @returns The parsed front matter and the remaining markdown body
 * @throws {ReadmaError} When the front matter is broken or holds wrong types
 */
export function parseFrontMatter(
  text: string,
  file = 'content.md',
): { meta: FrontMatter; body: string } {
  const match = FRONT_MATTER_RE.exec(text)
  if (!match) return { meta: {}, body: text }
  const body = text.slice(match[0].length)
  let parsed: unknown
  try {
    parsed = yml.parse(match[1])
  } catch (error) {
    throw new ReadmaError(
      `Could not parse the front matter of ${file}: ${
        error instanceof Error ? error.message : error
      }`,
      { cause: error },
    )
  }
  if (parsed === null) return { meta: {}, body }
  if (typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new ReadmaError(
      `Expected the front matter of ${file} to hold key value pairs`,
    )
  }
  const record = parsed as Record<string, unknown>
  const meta: FrontMatter = {}
  const fail = (key: string, expected: string): never => {
    throw new ReadmaError(
      `Expected the front matter ${key} of ${file} to be a ${expected}`,
    )
  }
  const title = record.title
  if (typeof title === 'string') meta.title = title
  else if (title !== undefined) fail('title', 'string')
  const order = record.order
  if (typeof order === 'number' && Number.isFinite(order)) meta.order = order
  else if (order !== undefined) fail('order', 'number')
  const hide = record.hide
  if (typeof hide === 'boolean') meta.hide = hide
  else if (hide !== undefined) fail('hide', 'boolean')
  return { meta, body }
}
/** Derive the section id and numeric order from a content filename */
export function idFromFilename(
  filename: string,
): { id: string; order?: number } | undefined {
  if (!filename.endsWith('.md')) return undefined
  const base = filename.slice(0, -'.md'.length)
  if (base === '' || base.includes('/')) return undefined
  const prefixed = /^(\d+)-(.+)$/u.exec(base)
  if (prefixed) return { id: prefixed[2], order: Number(prefixed[1]) }
  return { id: base, order: undefined }
}
/** Humanize a section id into a default display title */
export function humanizeTitle(id: string): string {
  const words = id.replaceAll(/[-_]+/gu, ' ').trim()
  return words.charAt(0).toUpperCase() + words.slice(1)
}
/** Sort content files by explicit order, then by id for determinism */
export function sortContent(files: ContentFile[]): ContentFile[] {
  return [...files].toSorted((a, b) =>
    (a.order ?? 0) - (b.order ?? 0) || a.id.localeCompare(b.id)
  )
}
/**
 * Load every markdown content file of a directory.
 *
 * Files are sorted by order then id. Non markdown files are ignored, missing
 * directories yield an empty list: content is always optional.
 *
 * @param dirPath Content directory path
 */
export async function loadContentDir(dirPath: string): Promise<ContentFile[]> {
  let names: string[]
  try {
    names = await io.readDir(dirPath)
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) return []
    if (error instanceof Error && error.name === 'NotFound') return []
    throw error
  }
  const files: ContentFile[] = []
  for (const name of names.toSorted()) {
    const parsedId = idFromFilename(name)
    if (!parsedId) continue
    const filePath = join(dirPath, name)
    let text: string
    try {
      text = await io.readTextFile(filePath)
    } catch (error) {
      throw new ReadmaError(
        `Could not read the content file at ${filePath}: ${
          error instanceof Error ? error.message : error
        }`,
        { cause: error },
      )
    }
    const { meta, body } = parseFrontMatter(text, filePath)
    const special = (SPECIAL_CONTENT_IDS as readonly string[]).includes(
        parsedId.id,
      )
      ? parsedId.id as ContentFile['special']
      : undefined
    files.push({
      id: parsedId.id,
      file: name,
      title: meta.title,
      order: meta.order ?? parsedId.order,
      hide: meta.hide,
      body,
      special,
    })
  }
  const seen = new Set<string>()
  const deduped = files.filter((file) => {
    if (seen.has(file.id)) return false
    seen.add(file.id)
    return true
  })
  return sortContent(deduped)
}
/**
 * Merge a base content list with an override one (e.g. root content with a
 * workspace member content), the override wins on id collisions and its
 * custom files are appended.
 */
export function mergeContent(
  base: ContentFile[],
  override: ContentFile[],
): ContentFile[] {
  const byId = new Map<string, ContentFile>()
  for (const file of base) byId.set(file.id, file)
  for (const file of override) byId.set(file.id, file)
  return sortContent([...byId.values()])
}
