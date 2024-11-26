import { compile, run } from "@mdx-js/mdx"
import { renderToStaticMarkup } from "react-dom/server"
import * as runtime from "react/jsx-runtime"
export async function processFile(path: string) {
    try {
        const file = await Deno.readTextFile(path)
        console.log(`Rendering ${path}`)
        const compiled = await compile(file, { outputFormat: "function-body" })
        const { default: MDXContent } = await run(compiled, { ...runtime })
        const html = renderToStaticMarkup(MDXContent({}))
        return html
    } catch (error) {
        if (!(error instanceof Deno.errors.NotFound)) {
            throw error
        }

        return undefined
    }
}
