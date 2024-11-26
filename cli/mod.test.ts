import { assertEquals } from '@std/assert'
import { cli } from './cli.ts'

Deno.test('detectLanguage', async () => {
  const expected = {
    language: 'ts' as const,
    workspaceMembers: undefined,
  }
  const actual = await cli.detectLanguage({ repoName: 'test' })
  assertEquals(actual.language, expected.language)
  assertEquals(actual.workspaceMembers, expected.workspaceMembers)
})
