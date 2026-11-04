import { assertEquals } from '@std/assert'
import { Tocer } from '../src/toc.ts'

Deno.test('Tocer renders a toc with github compatible anchors', () => {
  const tocer = new Tocer(false)
  tocer.section('About the project', 'About body')
  tocer.section('Features', 'Features body')
  const toc = tocer.toc()
  assertEquals(
    toc.includes(
      '<a href="#about-the-project">About the project</a>',
    ),
    true,
  )
  assertEquals(toc.includes('<a href="#features">Features</a>'), true)
  assertEquals(toc.includes('<summary>Table of contents</summary>'), true)
})

Deno.test('Tocer deduplicates anchors', () => {
  const tocer = new Tocer(false)
  tocer.section('Notes', 'a')
  tocer.section('Notes', 'b')
  tocer.section('Notes', 'c')
  const toc = tocer.toc()
  assertEquals(toc.includes('href="#notes"'), true)
  assertEquals(toc.includes('href="#notes-1"'), true)
  assertEquals(toc.includes('href="#notes-2"'), true)
})

Deno.test('Tocer custom title and hide', () => {
  const titled = new Tocer(false, { title: 'Sommaire' })
  titled.section('A', 'b')
  assertEquals(titled.toc().includes('<summary>Sommaire</summary>'), true)
  const hidden = new Tocer(true, { hide: true })
  hidden.section('A', 'b')
  assertEquals(hidden.toc(), '')
  const empty = new Tocer(false)
  assertEquals(empty.toc(), '')
})

Deno.test('Tocer section rendering', () => {
  const tocer = new Tocer(true)
  const withContent = tocer.section('Title', '  Body  ')
  assertEquals(
    withContent,
    `## Title

Body

<p align="right">(<a href="#readme-top">back to top</a>)</p>
`,
  )
  const withoutContent = tocer.section('Empty', undefined)
  assertEquals(withoutContent.includes('## Empty'), true)
  const noBackToTop = new Tocer(false).section('T', 'C')
  assertEquals(noBackToTop.includes('back to top'), false)
})
