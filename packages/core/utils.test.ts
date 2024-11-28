import { assertEquals } from '@std/assert'
import config from '../../readma.config.ts'
import { getReadmaConfig } from './utils.ts'

Deno.test('getReadmaConfig', async () => {
  assertEquals(await getReadmaConfig('../'), config)
})
