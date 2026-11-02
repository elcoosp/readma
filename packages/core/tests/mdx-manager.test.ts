import { assertEquals, assertInstanceOf, assertRejects } from '@std/assert'
import { processFile, renderMdx } from '../src/mdx-manager.ts'
import { resetIo, setIo } from '../src/io.ts'
import { ReadmaError } from '../src/utils.ts'

Deno.test('renderMdx renders a document', async () => {
  const html = await renderMdx('# Hello\n\nWorld')
  assertEquals(html.includes('Hello'), true)
  const component = await renderMdx('<div style={{color: "red"}}>Hi</div>')
  assertEquals(component.includes('Hi'), true)
})

Deno.test('processFile', async (t) => {
  const dir = await Deno.makeTempDir()
  try {
    await t.step('renders an existing file', async () => {
      const filePath = `${dir}/doc.mdx`
      await Deno.writeTextFile(filePath, '# Doc')
      const html = await processFile(filePath)
      assertEquals(html?.includes('Doc'), true)
    })
    await t.step('returns undefined for a missing file', async () => {
      assertEquals(await processFile(`${dir}/missing.mdx`), undefined)
    })
    await t.step('wraps render errors in a ReadmaError', async () => {
      const filePath = `${dir}/broken.mdx`
      await Deno.writeTextFile(filePath, '<NotAComponent />')
      const error = await assertRejects(() => processFile(filePath))
      assertInstanceOf(error, ReadmaError)
    })
    await t.step('propagates read errors', async () => {
      setIo({
        readTextFile: () => Promise.reject(new Error('disk failure')),
      })
      try {
        await assertRejects(
          () => processFile(`${dir}/any.mdx`),
          Error,
          'disk failure',
        )
      } finally {
        resetIo()
      }
    })
  } finally {
    await Deno.remove(dir, { recursive: true })
  }
})
