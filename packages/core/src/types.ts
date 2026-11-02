/** Workspace member, language agnostic */
export type WorkspaceMember = {
  pkgName: string
  path: string
  description: string
}
/** Templates function */
export type TemplateFn = (
  templateArgs: ReadmeTemplateArgs,
  globalOptions: GlobalOptions,
) => Promise<string>
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
}
/** Config used to feed the {@link readme} function */
export type ReadmeTemplateArgs = {
  /** Hash of the repobeats svg to retrieve for your repo at https://repobeats.axiom.co/configs */
  repobeats?: string
  /** Package status, not used yet */
  status?: 'unreleased' | 'early' | 'stable'
  /** Version control system */
  vcsName?: VcsName
  /** {@link WorkspaceMember}, auto generated if you use the cli */
  workspaceMember?: WorkspaceMember
  /** Root readme only related config */
  root?: {
    /** All the members of the workspace */
    members: WorkspaceMember[]
  }
  /** Registry on which the package is published  */
  packageRegistry?: PackageRegistry
  /** Set of urls for documentation, demo, etc. */
  urls?: {
    /** Repository url */
    repo?: string
    /** Link to a demo, default to the repo url if not specified */
    demo?: string
    /** Link to documentation, default to the repo url if not specified */
    doc?: string
  }
  /** Source files language, rust or typescript only for now */
  language: SourceLanguage
  /** Images links */
  images: { screenshot?: string; logo: string }
  /** Main author */
  author: string
  /** [Github issue template](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/configuring-issue-templates-for-your-repository) paths relative to `.github/ISSUE_TEMPLATE` */
  template: {
    /** Github bug report template */
    bugReport: GhIssueTemplateFilename
    /** Github feature request template */
    featRequest: GhIssueTemplateFilename
  }
  /** Github user name */
  githubUsername: string
  /** Repository name */
  repoName: string
  /** Ex twitter */
  xHandle: string
  /** LinkedIn username */
  linkedinUsername?: string
  /** Domain name for the mail */
  domain: string
  /** Domain extension for the mail, default to com */
  domainExt?: string
  /** Email (should just be the prefix, no @domain.com) */
  email: string
  /** Title of the readme, displayed under the logo */
  title: string
  /** Wether or not to add a button to scroll back to the top of the readme */
  backToTop: boolean
  /** This will be used in a near future to auto generate a table of content which would be dynamic optionally */
  sections:
    & {
      /** Features section */
      features: string
      /** Project description section */
      projectDescription: string
      /** About section */
      about: string
      /** Installation section, can be omitted in a single rust package */
      installation: string
      /** Acknowledgments section */
      acknowledgments: string
      /** Getting started section */
      gettingStarted: string
      /** Roadmap section */
      roadmap: string
      /** Usage section */
      usage: string

      /** Custom sections */
      [sectionName: string]: string
    }
    & Partial<{
      /** Contributing optional section */
      contributing?: string
    }>
  /** Code of conduct file path if exist */
  coc?: string
  /** License identifier, auto detected by the cli from the license file */
  license?: LicenseId
  /** License file path relative to the repo root, auto detected by the cli, default to `LICENSE.txt` */
  licenseFile?: string
  /** Badge style for [shields.io](https://shields.io/) */
  badgeStyle?: 'for-the-badge' | 'social' | 'flat' | 'flat-square' | 'plastic'
  /** Fine grained badge configuration, disable builtin badges or add custom ones */
  badges?: BadgesConfig
  /** Table of contents configuration */
  toc?: TocConfig
}
/** Markdown source */
export type MdSrc = string
/** Template independent options */
export type GlobalOptions = {
  /** Root path of the workspace, default to the current working directory */
  workspaceRootPath?: string
  /** Skip the file write side effect */
  dryRun?: boolean
  /** Folder in which the `README.md` is written, default to the workspace root path */
  folderPath?: string
}
export const COC_FILE_PATH = '.github/CODE_OF_CONDUCT.md' as const
/** Keys of the builtin sections in rendering order */
export const BUILTIN_SECTION_KEYS = [
  'projectDescription',
  'about',
  'features',
  'gettingStarted',
  'installation',
  'usage',
  'roadmap',
  'contributing',
  'acknowledgments',
] as const
export type BuiltinSectionKey = (typeof BUILTIN_SECTION_KEYS)[number]
