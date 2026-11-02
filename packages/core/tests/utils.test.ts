import { assertEquals } from '@std/assert'
import { ghSlug, md, ReadmaError } from '../src/utils.ts'

Deno.test('md helpers', () => {
  assertEquals(md.code('ls -la'), '```sh\nls -la\n```')
  assertEquals(md.code('  deno task r  ', 'ts'), '```ts\ndeno task r\n```')
  assertEquals(
    md.link('Readma', 'https://readma.dev'),
    '[Readma](https://readma.dev)',
  )
  assertEquals(md.img('logo', 'logo.png'), '![logo](logo.png)')
})

Deno.test('ghSlug mirrors github anchors', () => {
  assertEquals(ghSlug('About the project'), 'about-the-project')
  assertEquals(ghSlug('💡 About the project'), '-about-the-project')
  assertEquals(ghSlug('✨ Features'), '-features')
  assertEquals(ghSlug('Contact & support'), 'contact--support')
  assertEquals(ghSlug('Multi   spaces'), 'multi---spaces')
  assertEquals(ghSlug('Already-Slugged_1'), 'already-slugged_1')
  assertEquals(ghSlug('UPPER case'), 'upper-case')
  assertEquals(ghSlug('Émoji Tëst'), 'émoji-tëst')
  assertEquals(ghSlug(''), '')
  assertEquals(ghSlug('v2.0 release'), 'v20-release')
})

Deno.test('ReadmaError keeps the name', () => {
  const error = new ReadmaError('oops', { cause: new Error('root') })
  assertEquals(error.name, 'ReadmaError')
  assertEquals(error.message, 'oops')
  assertEquals((error.cause as Error).message, 'root')
  assertEquals(error instanceof Error, true)
})
