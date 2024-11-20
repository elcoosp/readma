// TODO: allow different case, this is too rusty
export type ReadmeTemplateArgs = {
  /** Hash of the repobeats svg to retrieve for your repo at https://repobeats.axiom.co/configs */
  repobeats?: string
  /** Link to a demo, default to the repo url if not specified */
  demo_url?: string
  /** Source files language, rust or typescript only for now */
  language: "rs" | "ts"
  /** Images links */
  images: { screenshot: string; logo: string }
  /** Main author */
  author: string
  /** Github template */
  template: {
    /** Github bug report (issue) template */
    bug_report: string
    /** Github feature request template */
    feat_request: string
  }
  /** Github user name */
  github_username: string
  /** Repository name */
  repo_name: string
  /** Ex twitter */
  x_handle: string
  /** LinkedIn username */
  linkedin_username?: string
  /** Domain name for the mail */
  domain: string
  /** Email (should just be the prefix, no @domain.com) */
  email: string
  /** This should be a reference to a folder that exist and contain source files for which you want a README  */
  title: string

  /** Wether or not to add a button to scroll back to the top of the readme */
  back_to_top: boolean
  /** This will be used in a near future to auto generate a table of content which would be dynamic optionally */
  sections: {
    /** Project description section */
    project_description: string
    /** About section */
    about: string
    /** Installation section */
    installation: string
    /** Acknowledgments section */
    acknowledgments: string
    /** Getting started section */
    getting_started: string
    /** Roadmap section */
    roadmap: string
    /** Usage section */
    usage: string
  }
}
export type MdSrc = string
