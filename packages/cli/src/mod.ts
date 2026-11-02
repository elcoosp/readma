import { runCli } from './cli.ts'
if (import.meta.main) {
  Deno.exit(await runCli())
}
