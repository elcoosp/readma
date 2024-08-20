import config from "../readma.config.ts"
import * as toml from "@std/toml"
// Because import() inside config of ts file return undefined, copy to .readma.toml
console.log("toml ->\n", toml.stringify(config))
