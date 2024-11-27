// TODO: allow different case, this is too rusty
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
export type PackageRegistry = 'jsr' | 'npm' | 'crates.io'
/** Path to a [github issue template](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/configuring-issue-templates-for-your-repository) */
export type GhIssueTemplateFilename =
  | `${string}.yml`
  | `${string}.yaml`
  | `${string}.md`
/** Config used to feed the {@link readme} function */
export type ReadmeTemplateArgs = {
  /** Hash of the repobeats svg to retrieve for your repo at https://repobeats.axiom.co/configs */
  repobeats?: string
  /** Version control system */
  vcsName?: 'github'
  /** Name of a workspace member, auto generated if you use the cli */
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
  language: 'rs' | 'ts'
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
  // FIXME semantically incorrect
  /** This should be a reference to a folder that exist and contain source files for which you want a README  */
  title: string
  /** Wether or not to add a button to scroll back to the top of the readme */
  backToTop: boolean
  /** This will be used in a near future to auto generate a table of content which would be dynamic optionally */
  sections: {
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
  /** License */
  license?: 'MIT'
  /** Badge style for [shields.io](https://shields.io/) */
  badgeStyle?: 'for-the-badge' | 'social' | 'flat' | 'flat-square' | 'plastic'
}
/** Markdown source */
export type MdSrc = string
/** Template independent options */
export type GlobalOptions = {
  /** Specify folder where the file is output */
  folderPath: string
}
