import type { MdSrc } from "./types.ts"
// TODO: fix lines of markdown inside template lit lead to incorrectly formatted md, use an md template lit & a linter
/** Quick utils to avoid ugly escaping everywhere */
export const md = {
  /** Return code between backticks with an optional lang */
  code: (c: MdSrc, lng = "sh"): string =>
    "```" + lng + `\n${c.trim()}\n` + "```",
}
