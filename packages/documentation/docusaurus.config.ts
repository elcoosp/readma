import {
  classicPreset,
  createDocusaurusConfig,
  themeConfig,
} from "@elcoosp-configs/docusaurus";
const future = {
  v4: {
    removeLegacyPostBuildHeadAttribute: true,
    useCssCascadeLayers: true,
  },
  experimental_faster: {
    swcJsLoader: true,
    swcJsMinimizer: true,
    swcHtmlMinimizer: true,
    lightningCssMinimizer: true,
    rspackBundler: true,
    rspackPersistentCache: true,
    ssgWorkerThreads: true,
    mdxCrossCompilerCache: true,
  },
  experimental_storage: {
    type: "localStorage",
    namespace: true,
  },
  experimental_router: "hash",
} as const;
const config = createDocusaurusConfig(
  { organizationName: "elcoosp", projectName: "readma" },
  (derived) => {
    return {
      future,
      tagline: "Beautiful effortless README generator",
      plugins: [],
      presets: [classicPreset(derived)],
      themeConfig: themeConfig(derived),
    };
  },
);

export default config;
