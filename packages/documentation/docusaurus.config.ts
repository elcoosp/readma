import type { Config } from "@docusaurus/types";
import { themes } from "prism-react-renderer";

const organizationName = "elcoosp";
const projectName = "readma";
const githubUrl = `https://github.com/${organizationName}/${projectName}`;
const title = "Readma";

const themeConfig = {
  image: "img/social-card.png",
  navbar: {
    title,
    logo: {
      alt: `${title} logo`,
      src: "img/logo.svg",
    },
    items: [
      {
        to: "/",
        position: "left",
        label: "Home",
      },
      {
        href: githubUrl,
        label: "GitHub",
        position: "right",
      },
    ],
  },
  footer: {
    style: "dark" as const,
    links: [
      {
        title: "Packages",
        items: [
          {
            label: "@readma/core",
            href: "https://jsr.io/@readma/core",
          },
          {
            label: "@readma/cli",
            href: "https://jsr.io/@readma/cli",
          },
        ],
      },
      {
        title: "More",
        items: [
          {
            label: "GitHub",
            href: githubUrl,
          },
        ],
      },
    ],
  },
  prism: {
    theme: themes.github,
    darkTheme: themes.dracula,
  },
};

const config: Config = {
  url: "https://readma.vercel.app",
  baseUrl: "/",
  organizationName,
  projectName,
  title,
  tagline: "Beautiful effortless README generator",
  favicon: "img/favicon.ico",
  onBrokenLinks: "throw",
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: "warn",
    },
  },
  presets: [
    [
      "classic",
      {
        docs: false,
        blog: false,
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
    experimental_router: "hash",
  },
  storage: {
    type: "localStorage",
    namespace: true,
  },
};

export default config;
