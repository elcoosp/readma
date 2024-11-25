import {
  classicPreset,
  createDocusaurusConfig,
  themeConfig,
} from "@elcoosp-configs/docusaurus"

const config = createDocusaurusConfig(
  { organizationName: "elcoosp", projectName: "readma" },
  (derived) => {
    return ({
      tagline: "Beautiful effortless README generator",
      plugins: [],
      presets: [classicPreset(derived)],
      themeConfig: themeConfig(derived),
    })
  },
)

export default config
