import { themes as prismThemes } from "prism-react-renderer"
import { deepmerge } from "deepmerge-ts"
import { titleCase } from "title-case"
import type { Config } from "@docusaurus/types"
import type * as Preset from "@docusaurus/preset-classic"

type DerivedConfig =
    & {
        githubUrl: string
    }
    & Pick<Config, "organizationName" | "title">
    & StaticConfig
type StaticConfig = {
    projectName: string
} & Pick<Config, "organizationName">
export function themeConfig(
    { title, githubUrl, projectName }: DerivedConfig,
): Preset.ThemeConfig {
    return {
        image: "img/social-card.png",
        navbar: {
            title,
            logo: {
                alt: `${title} logo`,
                src: "img/logo.svg",
            },
            items: [
                {
                    type: "docSidebar",
                    sidebarId: "introductionSidebar",
                    position: "left",
                    label: "Introduction",
                },
                { to: "/blog", label: "Blog", position: "left" },
                {
                    href: githubUrl,
                    label: "GitHub",
                    position: "right",
                },
            ],
        },
        footer: {
            style: "dark",
            links: [
                {
                    title: "Docs",
                    items: [
                        {
                            label: "Introduction",
                            to: "/docs/intro",
                        },
                    ],
                },
                {
                    title: "Community",
                    items: [
                        {
                            label: "Stack Overflow",
                            href:
                                `https://stackoverflow.com/questions/tagged/${projectName}`,
                        },
                    ],
                },
                {
                    title: "More",
                    items: [
                        {
                            label: "Blog",
                            to: "/blog",
                        },
                        {
                            label: "GitHub",
                            href: githubUrl,
                        },
                    ],
                },
            ],
        },
        prism: {
            theme: prismThemes.github,
            darkTheme: prismThemes.dracula,
        },
    }
}
export function classicPreset(
    config: DerivedConfig,
): ["classic", Preset.Options] {
    return [
        "classic",
        {
            docs: {
                sidebarPath: "./sidebars.ts",
                editUrl: `${config.githubUrl}/tree/main/documentation/blog`,
            },
            blog: {
                showReadingTime: true,
                feedOptions: {
                    type: ["rss", "atom"],
                    xslt: true,
                },
                editUrl: `${config.githubUrl}/tree/main/documentation/docs`,
                onInlineTags: "warn",
                onInlineAuthors: "warn",
                onUntruncatedBlogPosts: "warn",
            },
            theme: {
                customCss: "./src/css/custom.css",
            },
        } satisfies Preset.Options,
    ]
}

export function createDocusaurusConfig(
    { projectName, organizationName }: StaticConfig,
    getConfig: (derivedConfig: DerivedConfig) => Partial<Config>,
): Config {
    const githubUrl = `https://github.com/${organizationName}/${projectName}`
    const deploy: "vercel" = "vercel"
    const url = { "vercel": `https://${projectName}.vercel.app` }[deploy]
    const title = titleCase(projectName)
    const baseUrl = { "vercel": `/` }[deploy]
    return deepmerge<[Config, Config]>(
        getConfig({
            githubUrl,
            organizationName,
            title,
            projectName,
        }) as Config,
        {
            url,
            baseUrl,
            organizationName,
            title,
            favicon: "img/favicon.ico",
            onBrokenLinks: "throw",
            onBrokenMarkdownLinks: "warn",
            i18n: {
                defaultLocale: "en",
                locales: ["en"],
            },
            future: {
                experimental_faster: true,
            },
        },
    )
}
export default createDocusaurusConfig
