import { assertEquals } from '@std/assert'
import { cli } from '../src/cli.ts'

Deno.test('detectLanguage', async () => {
  const expected = {
    language: 'ts' as const,
    workspaceMembers: [],
  }
  const actual = await cli.detectLanguage({ repoName: 'test' })
  assertEquals(actual.language, expected.language)
  assertEquals(actual.workspaceMembers, expected.workspaceMembers)
})
