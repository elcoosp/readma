import { join } from '@std/path'
import * as yml from '@std/yaml'
import {
  detectBranch,
  detectLicense,
  io,
  type LicenseInfo,
  readOptionalFile,
} from './io.ts'
import { shields, type ShieldsArgs } from './shields.ts'
import {
  COC_FILE_PATH,
  type GlobalOptions,
  type ReadmeTemplateArgs,
} from './types.ts'
import { ReadmaError } from './utils.ts'

/** Fully resolved values used to render a readme without further side effects */
export type ReadmeContext = {
  /** Merged template args */
  args: ReadmeTemplateArgs
  /** Defaulted global options */
  options: DefaultedGlobalOptions
  /** Repository url */
  repoUrl: string
  /** Documentation url, default to the repo url */
  docUrl: string
  /** Demo url, default to the repo url */
  demoUrl: string
  /** Current branch */
  branch: string
  /** Full email address */
  fullEmail: string
  /** Logo image absolute url */
  logoSrc: string
  /** Screenshot image absolute url, undefined when not provided */
  screenshotSrc: string | undefined
  /** Resolved license informations */
  license: LicenseInfo
  /** Code of conduct file path if found */
  cocPath: string | undefined
  /** Resolved shields */
  badgeList: ReturnType<typeof shields>
  /** Pre resolved issue template urls */
  issueUrls: { bug: string; feat: string }
}
/** Global options with their defaults applied */
export type DefaultedGlobalOptions = Required<GlobalOptions>

/** Apply defaults to the global options */
export function defaultOptions(
  options: Partial<GlobalOptions>,
): DefaultedGlobalOptions {
  return {
    workspaceRootPath: '.',
    dryRun: false,
    folderPath: '.',
    ...options,
  }
}

/** Compute the repo url from the template args */
export function repoUrlFromArgs(args: ReadmeTemplateArgs): string {
  const vcsName = args.vcsName ?? 'github'
  return args.urls?.repo ??
    `https://${vcsName}.com/${args.githubUsername}/${args.repoName}`
}

/** Raw issue template front matter */
export type IssueTemplateMeta = {
  title: string
  labels: string
  assignees: string[]
}

/** Read a github issue template file and derive its pre filled new issue url */
export async function issueTemplateUrl(
  rootPath: string,
  repoUrl: string,
  templateFilename: string,
): Promise<string> {
  const fallbackUrl = `${repoUrl}/issues/new?template=${
    encodeURIComponent(templateFilename)
  }`
  const filePath = join(rootPath, '.github', 'ISSUE_TEMPLATE', templateFilename)
  const fileStr = await readOptionalFile(filePath)
  if (fileStr === undefined) return fallbackUrl
  try {
    const meta = yml.parse(fileStr) as Partial<IssueTemplateMeta>
    const urlParams = new URLSearchParams({
      title: meta.title ?? '',
      labels: meta.labels ?? '',
      assignees: (meta.assignees ?? []).toString(),
    })
    return `${repoUrl}/issues/new?template=${templateFilename}&${urlParams}`
  } catch (error) {
    throw new ReadmaError(
      `Could not parse the github issue template at ${filePath}`,
      { cause: error },
    )
  }
}

/** Dependencies of {@link resolveContext} which can be injected for tests */
export type ResolveContextDeps = {
  detectBranch: typeof detectBranch
  detectLicense: typeof detectLicense
}

/** Resolve every async/env dependent value once, so that rendering stays pure */
export async function resolveContext(
  args: ReadmeTemplateArgs,
  options: Partial<GlobalOptions> = {},
  deps: Partial<ResolveContextDeps> = {},
): Promise<ReadmeContext> {
  const defaultedOptions = defaultOptions(options)
  const branch = await (deps.detectBranch ?? detectBranch)(
    defaultedOptions.workspaceRootPath,
  )
  const license = await (deps.detectLicense ?? detectLicense)(
    defaultedOptions.workspaceRootPath,
  )
  const licenseId = args.license ?? license.id
  const resolvedLicense: LicenseInfo = {
    id: licenseId,
    file: args.licenseFile ?? license.file ?? 'LICENSE.txt',
  }
  const repoUrl = repoUrlFromArgs(args)
  const docUrl = args.urls?.doc ?? repoUrl
  const demoUrl = args.urls?.demo ?? repoUrl
  const vcsName = args.vcsName ?? 'github'
  const domainExt = args.domainExt ?? 'com'
  const fullEmail = `${args.email}@${args.domain}.${domainExt}`
  const ghContentUrl = (x = '') =>
    `https://raw.githubusercontent.com/${args.githubUsername}/${args.repoName}/HEAD/${x}`
  const logoSrc = ghContentUrl(args.images.logo)
  const screenshotSrc = args.images.screenshot
    ? ghContentUrl(args.images.screenshot)
    : undefined
  const cocFileContent = await readOptionalFile(
    join(defaultedOptions.workspaceRootPath, COC_FILE_PATH),
  )
  const cocPath = args.coc ??
    (cocFileContent === undefined ? undefined : COC_FILE_PATH)
  const badgeList = shields(
    {
      packageRegistry: args.packageRegistry,
      vcsName,
      repoName: args.repoName,
      repoUrl,
      githubUsername: args.githubUsername,
      workspaceMember: args.workspaceMember,
      badgeStyle: args.badgeStyle,
      commitActivityInterval: 'w',
      branch,
      language: args.language,
      linkedinUsername: args.linkedinUsername,
      badges: args.badges,
    } satisfies ShieldsArgs,
  )
  const [bugUrl, featUrl] = await Promise.all([
    issueTemplateUrl(
      defaultedOptions.workspaceRootPath,
      repoUrl,
      args.template.bugReport,
    ),
    issueTemplateUrl(
      defaultedOptions.workspaceRootPath,
      repoUrl,
      args.template.featRequest,
    ),
  ])
  return {
    args,
    options: defaultedOptions,
    repoUrl,
    docUrl,
    demoUrl,
    branch,
    fullEmail,
    logoSrc,
    screenshotSrc,
    license: resolvedLicense,
    cocPath,
    badgeList,
    issueUrls: { bug: bugUrl, feat: featUrl },
  }
}

/** Fetch a remote json description, return undefined on failure or when offline */
export async function fetchJsonDescription(
  url: string,
  offline: boolean,
  fetchFn: typeof fetch = io.fetch,
): Promise<string | undefined> {
  if (offline) return undefined
  try {
    const response = await fetchFn(url, {
      headers: { Accept: 'application/json' },
    })
    if (response.ok) {
      const body = await response.json()
      return typeof body?.description === 'string' && body.description
        ? body.description
        : undefined
    }
    return undefined
  } catch {
    return undefined
  }
}
