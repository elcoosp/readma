/** Workspace member, language agnostic */
export type WorkspaceMember = {
  pkgName: string
  path: string
  description: string
}
/** Registry on which a package is published */
export type PackageRegistry = 'jsr' | 'npm' | 'crates.io'
/** Version control system, github only for now */
export type VcsName = 'github'
/** Source files language */
export type SourceLanguage = 'rs' | 'ts'
/** SPDX license identifier, see [SPDX](https://spdx.org/licenses/) */
export type LicenseId =
  | 'MIT'
  | 'Apache-2.0'
  | 'GPL-3.0'
  | 'BSD-3-Clause'
  | 'MPL-2.0'
  | (string & Record<never, never>)
/** Path to a [github issue template](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/configuring-issue-templates-for-your-repository) */
export type GhIssueTemplateFilename =
  | `${string}.yml`
  | `${string}.yaml`
  | `${string}.md`
/** Badge style for [shields.io](https://shields.io/) */
export type BadgeStyle =
  | 'for-the-badge'
  | 'social'
  | 'flat'
  | 'flat-square'
  | 'plastic'
/** Arbitrary user provided badge appended after the builtin ones */
export type CustomBadge = {
  /** Accessible name of the badge, also used for the markdown reference name */
  name: string
  /** Image url of the badge */
  image: string
  /** Link url the badge points to */
  link: string
}
/** Ids of the builtin badges, all enabled by default and individually disableable */
export type BuiltinBadgeId =
  | 'linkedin'
  | 'msrv'
  | 'registry'
  | 'codecov'
  | 'contributors'
  | 'forks'
  | 'stars'
  | 'commitActivity'
  | 'actions'
  | 'issues'
  | 'pullRequests'
  | 'lastCommit'
  | 'release'
  | 'license'
/** Badge related configuration */
export type BadgesConfig = {
  /** Badge style for [shields.io](https://shields.io/) */
  style?: BadgeStyle
  /** Builtin badges to disable, all builtin badges are enabled by default */
  disabled?: BuiltinBadgeId[]
  /** Arbitrary user provided badges appended after the builtin ones */
  custom?: CustomBadge[]
}
/** Table of contents related configuration */
export type TocConfig = {
  /** Title of the table of contents block, default to `Table of contents` */
  title?: string
  /** Hide the table of contents entirely */
  hide?: boolean
  /** Add a back to top button inside every section */
  backToTop?: boolean
}
/** Ways to reach the project author, every field is optional */
export type ContactConfig = {
  /** Full email address, e.g. `me@gmail.com` */
  email?: string
  /** X (formerly Twitter) handle, links to `https://x.com/<handle>` */
  x?: string
  /** LinkedIn username, links to `https://linkedin.com/in/<username>` */
  linkedin?: string
}
/** License configuration, auto detected from the license file when omitted */
export type LicenseConfig = {
  /** SPDX license identifier, e.g. `MIT` */
  id?: LicenseId
  /** License file path relative to the config root, default to the detected one */
  file?: string
}
/** Github issue template files used to prefill the report bug / request feature links */
export type IssueTemplatesConfig = {
  /** Bug report template filename inside `.github/ISSUE_TEMPLATE` */
  bug?: GhIssueTemplateFilename
  /** Feature request template filename inside `.github/ISSUE_TEMPLATE` */
  feature?: GhIssueTemplateFilename
}
/** Project urls, the repo one is derived from the `repo` slug when omitted */
export type LinksConfig = {
  /** Repository url */
  repo?: string
  /** Documentation url */
  doc?: string
  /** Demo url */
  demo?: string
}
/** Images rendered inside the readme header and about section */
export type ImagesConfig = {
  /** Logo path or url, rendered in the header */
  logo?: string
  /** Screenshot path or url, rendered inside the about section */
  screenshot?: string
}
/** Per section overrides, keyed by section id */
export type SectionOptions = {
  /** Section title override, wins over the front matter title */
  title?: string
  /** Hide the section entirely */
  hide?: boolean
}
/**
 * Declarative readme configuration, loaded from a `readma.yaml`, `readma.yml`,
 * `readma.toml` or `readma.json` file. Every field except `title` is optional.
 *
 * Section bodies never live in the config: they are markdown files stored
 * inside the content directory (default `readma/`), see {@link ContentFile}.
 */
export type ReadmaConfig = {
  /** Optional json schema reference used by editors, ignored by the engine */
  $schema?: string
  /** Title of the readme, displayed under the logo */
  title: string
  /** Short description displayed under the title inside the header */
  description?: string
  /** Github slug of the project, e.g. `owner/name`, drives badges and links */
  repo?: string
  /** Project urls */
  links?: LinksConfig
  /** Source files language, drives the install snippet */
  language?: SourceLanguage
  /** Registry on which the package is published, drives the install snippet */
  packageRegistry?: PackageRegistry
  /** Package name used by the install snippet, auto filled by the cli from the detection files */
  pkgName?: string
  /** Main author name */
  author?: string
  /** Contact informations, the contact section is omitted when empty */
  contact?: ContactConfig
  /** Images rendered inside the readme */
  images?: ImagesConfig
  /** License configuration */
  license?: LicenseConfig
  /** Github issue templates used for the report bug / request feature links */
  issueTemplates?: IssueTemplatesConfig
  /** Code of conduct file path relative to the config root */
  coc?: string
  /** Badge configuration */
  badges?: BadgesConfig
  /** Table of contents configuration */
  toc?: TocConfig
  /** Content directory configuration, default to `readma` */
  content?: {
    /** Directory holding the markdown content files, relative to the config root */
    dir?: string
  }
  /** Hash of the repobeats svg to retrieve for your repo at https://repobeats.axiom.co/configs */
  repobeats?: string
  /** Per section overrides keyed by section id */
  sections?: Record<string, SectionOptions>
  /** Set by the cli when rendering a workspace member readme */
  workspaceMember?: WorkspaceMember
  /** Set by the cli when rendering the workspace root readme */
  root?: {
    /** All the members of the workspace */
    members: WorkspaceMember[]
  }
}
/** A markdown content file loaded from a content directory */
export type ContentFile = {
  /** Section id, derived from the filename without extension and numeric prefix */
  id: string
  /** Filename relative to the content directory */
  file: string
  /** Title from the front matter, wins over the derived default */
  title?: string
  /** Render order from the front matter, wins over the numeric filename prefix */
  order?: number
  /** Hide flag from the front matter */
  hide?: boolean
  /** Markdown body, front matter stripped */
  body: string
  /** Special files are not rendered as sections */
  special?: 'header' | 'footer'
}
/** Markdown source */
export type MdSrc = string
/** Rendering options */
export type GlobalOptions = {
  /** Root path of the workspace, default to the current working directory */
  workspaceRootPath?: string
  /** Skip the file write side effect */
  dryRun?: boolean
  /** Folder in which the `README.md` is written, default to the workspace root or the member path */
  folderPath?: string
  /** Pre loaded content files, loaded from the content directory when omitted */
  content?: ContentFile[]
}
/** Templates function */
export type TemplateFn = (
  config: ReadmaConfig,
  options?: GlobalOptions,
) => Promise<string>
export const COC_FILE_PATH = '.github/CODE_OF_CONDUCT.md' as const
/** Default content directory name */
export const DEFAULT_CONTENT_DIR = 'readma'
/** File based builtin section ids, each maps to a `<id>.md` content file */
export const BUILTIN_SECTION_IDS = [
  'about',
  'features',
  'getting-started',
  'installation',
  'usage',
  'roadmap',
  'contributing',
  'acknowledgments',
] as const
export type BuiltinSectionId = (typeof BUILTIN_SECTION_IDS)[number]
/** Engine generated section ids, they have no content file */
export const GENERATED_SECTION_IDS = ['contact', 'license'] as const
export type GeneratedSectionId = (typeof GENERATED_SECTION_IDS)[number]
/** Special content file ids, they are not rendered as sections */
export const SPECIAL_CONTENT_IDS = ['header', 'footer'] as const
export type SpecialContentId = (typeof SPECIAL_CONTENT_IDS)[number]
/** Default render order of the known sections, custom sections default to {@link DEFAULT_CUSTOM_SECTION_ORDER} */
export const DEFAULT_SECTION_ORDER: Record<string, number> = {
  about: 10,
  features: 20,
  'getting-started': 30,
  installation: 40,
  usage: 50,
  roadmap: 60,
  contributing: 110,
  contact: 120,
  acknowledgments: 130,
  license: 140,
}
/** Default render order of custom sections, between roadmap and contributing */
export const DEFAULT_CUSTOM_SECTION_ORDER = 100
/** Default titles of the known sections, overridable via front matter or config */
export const DEFAULT_SECTION_TITLES: Record<string, string> = {
  about: 'About',
  features: 'Features',
  'getting-started': 'Getting started',
  installation: 'Installation',
  usage: 'Usage',
  roadmap: 'Roadmap',
  contributing: 'Contributing',
  contact: 'Contact',
  acknowledgments: 'Acknowledgments',
  license: 'License',
}
