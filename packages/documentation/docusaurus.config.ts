import type { Config } from "@docusaurus/types";
import { themes } from "prism-react-renderer";

const organizationName = "elcoosp";
const projectName = "readma";
const githubUrl = `https://github.com/${organizationName}/${projectName}`;
const jsrUrl = "https://jsr.io/@readma";
const docsUrl = "https://readma.vercel.app";
const title = "Readma";
const tagline = "Beautiful, effortless README generator";

const themeConfig = {
  image: "img/social-card.png",
  metadata: [
    {
      name: "description",
      content:
        "Readma generates complete, well-structured README files for Deno, pnpm/npm and Cargo workspaces straight from your project files: automatic shields.io badges, table of contents, workspace tables and CI check mode.",
    },
    {
      name: "keywords",
      content: "readme, generator, deno, typescript, rust, monorepo, shields",
    },
    { name: "twitter:card", content: "summary_large_image" },
  ],
  announcementBar: {
    id: "early-development",
    content:
      '🚧 Readma is in early development — expect breaking changes. If it saves you time, <a target="_blank" rel="noopener noreferrer" href="https://github.com/elcoosp/readma">star it on GitHub</a>! ⭐',
    backgroundColor: "#0d2136",
    textColor: "#f5b09a",
    isCloseable: true,
  },
  navbar: {
    title,
    logo: {
      alt: `${title} logo`,
      src: "img/logo.png",
    },
    hideOnScroll: false,
    items: [
      {
        type: "docSidebar",
        sidebarId: "docsSidebar",
        position: "left",
        label: "Docs",
      },
      { to: "/blog", label: "Blog", position: "left" },
      {
        href: `${jsrUrl}/cli`,
        label: "JSR",
        position: "right",
      },
      {
        href: githubUrl,
        position: "right",
        className: "header-github-link",
        "aria-label": "GitHub repository",
      },
    ],
  },
  footer: {
    style: "dark" as const,
    copyright: `Copyright © ${new Date().getFullYear()} elcoosp — Readma released under the MIT license.`,
    links: [
      {
        title: "Documentation",
        items: [
          { label: "Getting started", to: "/docs/getting-started" },
          { label: "CLI reference", to: "/docs/cli/overview" },
          { label: "Configuration", to: "/docs/config/overview" },
          { label: "Badges & shields", to: "/docs/config/badges" },
        ],
      },
      {
        title: "Packages",
        items: [
          { label: "@readma/core", href: `${jsrUrl}/core` },
          { label: "@readma/cli", href: `${jsrUrl}/cli` },
          { label: "@readma/pkg-json", href: `${jsrUrl}/pkg-json` },
        ],
      },
      {
        title: "Community",
        items: [
          { label: "GitHub", href: githubUrl },
          { label: "Issues", href: `${githubUrl}/issues` },
          { label: "Code of conduct", href: `${githubUrl}/blob/main/.github/CODE_OF_CONDUCT.md` },
          { label: "Releases", href: `${githubUrl}/releases` },
        ],
      },
      {
        title: "More",
        items: [
          { label: "Blog", to: "/blog" },
          { label: "FAQ", to: "/docs/faq" },
          { label: "Roadmap", href: `${githubUrl}#roadmap` },
          { label: `Docs site: ${docsUrl}`, href: docsUrl },
        ],
      },
    ],
  },
  prism: {
    theme: themes.github,
    darkTheme: themes.dracula,
    additionalLanguages: ["bash", "toml", "rust", "yaml", "diff", "json"],
    magicComments: [
      {
        className: "theme-code-block-highlighted-line",
        line: "highlight-next-line",
        block: { start: "highlight-start", end: "highlight-end" },
      },
      {
        className: "code-block-removed-line",
        line: "remove-next-line",
        block: { start: "removed-start", end: "removed-end" },
      },
      {
        className: "code-block-added-line",
        line: "add-next-line",
        block: { start: "added-start", end: "added-end" },
      },
    ],
  },
  colorMode: {
    defaultMode: "dark",
    disableSwitch: false,
    respectPrefersColorScheme: true,
  },
};

const config: Config = {
  url: docsUrl,
  baseUrl: "/",
  organizationName,
  projectName,
  title,
  tagline,
  favicon: "img/favicon.ico",
  onBrokenLinks: "throw",
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },
  markdown: {
    format: "mdx",
    hooks: {
      onBrokenMarkdownLinks: "warn",
    },
  },
  presets: [
    [
      "classic",
      {
        docs: {
          sidebarPath: "./sidebars.ts",
          editUrl: `${githubUrl}/edit/main/packages/documentation/`,
          showLastUpdateTime: true,
        },
        blog: {
          showReadingTime: true,
          editUrl: `${githubUrl}/edit/main/packages/documentation/`,
          blogSidebarTitle: "All posts",
          blogSidebarCount: "ALL",
        },
        theme: {
          customCss: "./src/css/custom.css",
        },
      },
    ],
  ],
  themeConfig,
  future: {
    v4: {
      removeLegacyPostBuildHeadAttribute: true,
      useCssCascadeLayers: true,
    },
    faster: {
      swcJsLoader: true,
      swcJsMinimizer: true,
      swcHtmlMinimizer: true,
      lightningCssMinimizer: true,
      rspackBundler: true,
      rspackPersistentCache: true,
      ssgWorkerThreads: true,
      mdxCrossCompilerCache: true,
    },
  },
  storage: {
    type: "localStorage",
    namespace: true,
  },
};

export default config;
