import type { Config } from "@docusaurus/types"
import createDocusaurusConfig, {
  classicPreset,
  themeConfig,
} from "./create-docusaurus-config"

const config: Config = createDocusaurusConfig(
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
