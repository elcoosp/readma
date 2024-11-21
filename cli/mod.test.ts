import { assertEquals } from "@std/assert"
import { cli } from "./cli.ts"

Deno.test("detectLanguage", async () => {
  const expected = {
    language: "ts" as const,
    files: {
      rs: undefined,
      ts: {
        "name": "@readma/cli",
        "version": "0.0.0",
        "exports": "./mod.ts",
        "tasks": {
          /** Test */
          "t": "deno test -A",
          /** Doc */
          "d": "deno doc --html mod.ts",
        },
      },
    },
    workspaceMembers: undefined,
  }
  const actual = await cli.detectLanguage()
  assertEquals(actual.language, expected.language)
  assertEquals(actual.workspaceMembers, expected.workspaceMembers)
})
