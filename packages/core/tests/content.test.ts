import { assertEquals, assertInstanceOf } from '@std/assert'
import { resetIo, setIo } from '../src/io.ts'
import {
  DEFAULT_CONTENT_DIR,
  humanizeTitle,
  idFromFilename,
  loadContentDir,
  mergeContent,
  parseFrontMatter,
  sortContent,
} from '../src/content.ts'
import { ReadmaError } from '../src/utils.ts'

Deno.test('DEFAULT_CONTENT_DIR', () => {
  assertEquals(DEFAULT_CONTENT_DIR, 'readma')
})

Deno.test('parseFrontMatter without front matter returns the raw body', () => {
  const { meta, body } = parseFrontMatter('# Hello\n\nBody text\n')
  assertEquals(meta, {})
  assertEquals(body, '# Hello\n\nBody text\n')
})

Deno.test('parseFrontMatter extracts the yaml header', () => {
  const { meta, body } = parseFrontMatter(
    '---\ntitle: My title\norder: 20\nhide: false\n---\n\nBody\n',
  )
  assertEquals(meta, { title: 'My title', order: 20, hide: false })
  assertEquals(body, '\nBody\n')
})

Deno.test('parseFrontMatter tolerates a missing trailing newline', () => {
  const { meta, body } = parseFrontMatter('---\ntitle: T\n---\nBody')
  assertEquals(meta, { title: 'T' })
  assertEquals(body, 'Body')
})

Deno.test('parseFrontMatter rejects broken yaml with the file label', () => {
  const error = (() => {
    try {
      parseFrontMatter('---\ntitle: [broken\n---\nbody\n', 'readma/faq.md')
      return undefined
    } catch (error_) {
      return error_
    }
  })()
  assertInstanceOf(error, ReadmaError)
  assertEquals((error as Error).message.includes('readma/faq.md'), true)
})

Deno.test('parseFrontMatter rejects wrong front matter types', () => {
  const cases = [
    '---\ntitle: 42\n---\nbody',
    '---\norder: ten\n---\nbody',
    '---\nhide: "true"\n---\nbody',
    '---\n- list\n---\nbody',
  ]
  for (const text of cases) {
    const error = (() => {
      try {
        parseFrontMatter(text, 'file.md')
        return undefined
      } catch (error_) {
        return error_
      }
    })()
    assertInstanceOf(error, ReadmaError)
  }
})

Deno.test('parseFrontMatter ignores unknown front matter keys', () => {
  const { meta, body } = parseFrontMatter('---\ncustom: yes\n---\nbody')
  assertEquals(meta, {})
  assertEquals(body, 'body')
})

Deno.test('idFromFilename strips extension and numeric prefix', () => {
  assertEquals(idFromFilename('about.md'), { id: 'about', order: undefined })
  assertEquals(idFromFilename('10-faq.md'), { id: 'faq', order: 10 })
  assertEquals(idFromFilename('020-faq.md'), { id: 'faq', order: 20 })
  assertEquals(idFromFilename('header.md'), { id: 'header', order: undefined })
  assertEquals(idFromFilename('notes.txt'), undefined)
  assertEquals(idFromFilename('nested/dir.md'), undefined)
})

Deno.test('humanizeTitle turns ids into readable defaults', () => {
  assertEquals(humanizeTitle('about'), 'About')
  assertEquals(humanizeTitle('getting-started'), 'Getting started')
  assertEquals(humanizeTitle('my_cool_section'), 'My cool section')
  assertEquals(humanizeTitle('FAQ'), 'FAQ')
})

Deno.test('sortContent orders by explicit order then filename', () => {
  const sorted = sortContent([
    { id: 'b', file: 'b.md', body: 'b' },
    { id: 'a', file: '20-a.md', body: 'a', order: 20 },
    { id: 'c', file: '10-c.md', body: 'c', order: 10 },
    { id: 'd', file: 'a-file.md', body: 'd' },
  ])
  assertEquals(sorted.map((file) => file.id), ['b', 'd', 'c', 'a'])
})

Deno.test('loadContentDir returns an empty list for a missing folder', async () => {
  const dir = await Deno.makeTempDir()
  try {
    assertEquals(await loadContentDir(`${dir}/readma`), [])
  } finally {
    await Deno.remove(dir, { recursive: true })
  }
})

Deno.test('loadContentDir loads, parses and labels content files', async () => {
  const dir = await Deno.makeTempDir()
  try {
    await Deno.mkdir(`${dir}/readma`)
    await Deno.writeTextFile(
      `${dir}/readma/about.md`,
      '---\ntitle: About this\n---\nAbout body\n',
    )
    await Deno.writeTextFile(`${dir}/readma/30-faq.md`, 'Faq body\n')
    await Deno.writeTextFile(
      `${dir}/readma/header.md`,
      'Custom header content\n',
    )
    await Deno.writeTextFile(`${dir}/readma/footer.md`, 'Custom footer\n')
    await Deno.writeTextFile(`${dir}/readma/ignored.txt`, 'not markdown')
    await Deno.writeTextFile(`${dir}/readma/ignored.mdx`, 'legacy mdx')
    const files = await loadContentDir(`${dir}/readma`)
    assertEquals(files.length, 4)
    const about = files.find((file) => file.id === 'about')
    assertEquals(about?.title, 'About this')
    assertEquals(about?.body, 'About body\n')
    assertEquals(about?.file, 'about.md')
    assertEquals(about?.special, undefined)
    const faq = files.find((file) => file.id === 'faq')
    assertEquals(faq?.order, 30)
    assertEquals(faq?.body, 'Faq body\n')
    const header = files.find((file) => file.id === 'header')
    assertEquals(header?.special, 'header')
    const footer = files.find((file) => file.id === 'footer')
    assertEquals(footer?.special, 'footer')
  } finally {
    await Deno.remove(dir, { recursive: true })
  }
})

Deno.test('loadContentDir is idempotent across io overrides', async () => {
  const dir = await Deno.makeTempDir()
  try {
    await Deno.mkdir(`${dir}/readma`)
    await Deno.writeTextFile(`${dir}/readma/about.md`, 'Body')
    const direct = await loadContentDir(`${dir}/readma`)
    setIo({
      readTextFile: (path) =>
        path.endsWith('about.md')
          ? Promise.resolve('Injected')
          : Deno.readTextFile(path),
    })
    const injected = await loadContentDir(`${dir}/readma`)
    assertEquals(injected[0].body, 'Injected')
    assertEquals(direct[0].body, 'Body')
  } finally {
    await Deno.remove(dir, { recursive: true })
    resetIo()
  }
})

Deno.test('loadContentDir surfaces read errors with the file path', async () => {
  const dir = await Deno.makeTempDir()
  try {
    await Deno.mkdir(`${dir}/readma`)
    await Deno.writeTextFile(`${dir}/readma/broken.md`, 'ok')
    setIo({
      readTextFile: (path) =>
        path.endsWith('broken.md')
          ? Promise.reject(new Error('disk exploded'))
          : Deno.readTextFile(path),
    })
    const error = await loadContentDir(`${dir}/readma`).catch((error_) =>
      error_
    )
    assertInstanceOf(error, ReadmaError)
    assertEquals((error as Error).message.includes('broken.md'), true)
  } finally {
    await Deno.remove(dir, { recursive: true })
    resetIo()
  }
})

Deno.test('loadContentDir deduplicates ids keeping the first file', async () => {
  const dir = await Deno.makeTempDir()
  try {
    await Deno.mkdir(`${dir}/readma`)
    await Deno.writeTextFile(`${dir}/readma/10-faq.md`, 'First faq')
    await Deno.writeTextFile(`${dir}/readma/faq.md`, 'Second faq')
    const files = await loadContentDir(`${dir}/readma`)
    const faqs = files.filter((file) => file.id === 'faq')
    assertEquals(faqs.length, 1)
    assertEquals(faqs[0].body, 'First faq')
  } finally {
    await Deno.remove(dir, { recursive: true })
  }
})

Deno.test('mergeContent lets overrides win by id and keeps customs', () => {
  const base = [
    { id: 'about', file: 'about.md', body: 'root about' },
    { id: 'usage', file: 'usage.md', body: 'root usage' },
  ]
  const override = [
    { id: 'usage', file: 'usage.md', body: 'member usage' },
    { id: 'extras', file: 'extras.md', body: 'member extra' },
  ]
  const merged = mergeContent(base, override)
  const byId = new Map(merged.map((file) => [file.id, file]))
  assertEquals(byId.get('about')?.body, 'root about')
  assertEquals(byId.get('usage')?.body, 'member usage')
  assertEquals(byId.get('extras')?.body, 'member extra')
})

Deno.test('sortContent keeps a deterministic order for equal ranks', () => {
  const sorted = sortContent([
    { id: 'zeta', file: 'zeta.md', body: 'z', order: 100 },
    { id: 'alpha', file: 'alpha.md', body: 'a', order: 100 },
  ])
  assertEquals(sorted.map((file) => file.id), ['alpha', 'zeta'])
})

Deno.test('loadContentDir rethrows unexpected readDir errors', async () => {
  setIo({
    readDir: () => Promise.reject(new Error('not a directory')),
  })
  try {
    const error = await loadContentDir('/any/readma').catch((error_) => error_)
    assertEquals((error as Error).message, 'not a directory')
  } finally {
    resetIo()
  }
})
