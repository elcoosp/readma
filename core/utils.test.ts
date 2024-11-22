import { assertEquals } from "@std/assert"
import config from "../readma.config.ts"
import { readReadmaConfig } from "./utils.ts"

Deno.test("readReadmaConfig", async () => {
    assertEquals(await readReadmaConfig("../"), config)
})
