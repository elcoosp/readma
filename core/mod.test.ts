import { assertEquals } from "@std/assert"
import { readme } from "./mod.ts"
import config from "../readma.config.ts"

Deno.test("readme", async () => {
  const current = await Deno.readTextFile("../README.md")
  const out = await readme(config, { folderPath: "../" })
  assertEquals(out, current)
})
