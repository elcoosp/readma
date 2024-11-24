// TODO: allow different case, this is too rusty
/** Config used to feed the {@link readme} function */
export type ReadmeTemplateArgs = {
  /** Hash of the repobeats svg to retrieve for your repo at https://repobeats.axiom.co/configs */
  repobeats?: string
  vcsName?: "github"
  /** Name of a workspace member, auto generated if you use the cli */
  workspaceMember?: string
  urls?: {
    /** Repository url */
    repo?: string
    /** Link to a demo, default to the repo url if not specified */
    demo?: string
  }
  /** Source files language, rust or typescript only for now */
  language: "rs" | "ts"
  /** Images links */
  images: { screenshot: string; logo: string }
  /** Main author */
  author: string
  /** Github template */
  template: {
    /** Github bug report (issue) template */
    bugReport: string
    /** Github feature request template */
    featRequest: string
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
  /** This should be a reference to a folder that exist and contain source files for which you want a README  */
  title: string

  /** Wether or not to add a button to scroll back to the top of the readme */
  backToTop: boolean
  /** This will be used in a near future to auto generate a table of content which would be dynamic optionally */
  sections: {
    /** Project description section */
    projectDescription: string
    /** About section */
    about: string
    /** Installation section */
    installation: string
    /** Acknowledgments section */
    acknowledgments: string
    /** Getting started section */
    gettingStarted: string
    /** Roadmap section */
    roadmap: string
    /** Usage section */
    usage: string
  }
  license?: "MIT"
  badgeStyle?: "for-the-badge" | "social" | "flat" | "flat-square" | "plastic"
}
export type MdSrc = string
