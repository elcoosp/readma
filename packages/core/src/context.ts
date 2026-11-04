import { join } from '@std/path'
import * as yml from '@std/yaml'
import {
  detectBranch,
  detectLicense,
  io,
  type LicenseInfo,
  readOptionalFile,
} from './io.ts'
import { loadContentDir } from './content.ts'
import { type Shield, shields, type ShieldsArgs } from './shields.ts'
import {
  COC_FILE_PATH,
  type ContentFile,
  DEFAULT_CONTENT_DIR,
  type GlobalOptions,
  type ReadmaConfig,
} from './types.ts'
import { ReadmaError } from './utils.ts'
/** Fully resolved values used to render a readme without further side effects */
export type ReadmaContext = {
  /** Merged readme config */
  config: ReadmaConfig
  /** Defaulted global options */
  options: DefaultedGlobalOptions
  /** Loaded content files, empty when the content directory is absent */
  content: ContentFile[]
  /** Repository url, undefined when no repo slug or link is configured */
  repoUrl: string | undefined
  /** Documentation url, default to the repo url */
  docUrl: string
  /** Demo url, default to the doc url */
  demoUrl: string
  /** Current branch */
  branch: string
  /** Logo image absolute url, undefined without a logo or a repo slug */
  logoSrc: string | undefined
  /** Screenshot image absolute url, undefined when not provided */
  screenshotSrc: string | undefined
  /** Resolved license informations */
  license: LicenseInfo
  /** Code of conduct file path if found */
  cocPath: string | undefined
  /** Resolved shields, empty without a repo slug */
  badgeList: Shield[]
  /** Pre resolved issue template urls, undefined per missing template config */
  issueUrls: { bug?: string; feat?: string }
  /** Package name used by the install snippet, member pkg name or repo name */
  pkgName: string | undefined
}
/** Global options with their defaults applied */
export type DefaultedGlobalOptions =
  & Required<Omit<GlobalOptions, 'folderPath' | 'content'>>
  & {
    folderPath: string | undefined
    content: ContentFile[] | undefined
  }
/** Apply defaults to the global options */
export function defaultOptions(
  options: Partial<GlobalOptions>,
): DefaultedGlobalOptions {
  return {
    workspaceRootPath: '.',
    dryRun: false,
    folderPath: undefined,
    content: undefined,
    ...options,
  }
}
/** Compute the repo url from the config */
export function repoUrlFromConfig(
  config: ReadmaConfig,
): string | undefined {
  return config.links?.repo ??
    (config.repo ? `https://github.com/${config.repo}` : undefined)
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
  config: ReadmaConfig,
  options: Partial<GlobalOptions> = {},
  deps: Partial<ResolveContextDeps> = {},
): Promise<ReadmaContext> {
  const defaultedOptions = defaultOptions(options)
  const branch = await (deps.detectBranch ?? detectBranch)(
    defaultedOptions.workspaceRootPath,
  )
  const detectedLicense = await (deps.detectLicense ?? detectLicense)(
    defaultedOptions.workspaceRootPath,
  )
  const license: LicenseInfo = {
    id: config.license?.id ?? detectedLicense.id,
    file: config.license?.file ?? detectedLicense.file ?? 'LICENSE.txt',
  }
  const repoUrl = repoUrlFromConfig(config)
  const docUrl = config.links?.doc ?? repoUrl ?? ''
  const demoUrl = config.links?.demo ?? docUrl
  const contentUrl = (x = ''): string | undefined => {
    if (!config.repo) return x === '' ? undefined : x
    return `https://raw.githubusercontent.com/${config.repo}/HEAD/${x}`
  }
  const logoSrc = config.images?.logo
    ? contentUrl(config.images.logo)
    : undefined
  const screenshotSrc = config.images?.screenshot
    ? contentUrl(config.images.screenshot)
    : undefined
  const cocFileContent = await readOptionalFile(
    join(defaultedOptions.workspaceRootPath, COC_FILE_PATH),
  )
  const cocPath = config.coc ??
    (cocFileContent === undefined ? undefined : COC_FILE_PATH)
  const [githubUsername, repoName] = config.repo?.split('/') ?? []
  const badgeList = repoUrl && githubUsername && repoName
    ? shields(
      {
        packageRegistry: config.packageRegistry,
        vcsName: 'github',
        repoName,
        repoUrl,
        githubUsername,
        workspaceMember: config.workspaceMember,
        badgeStyle: config.badges?.style,
        commitActivityInterval: 'w',
        branch,
        language: config.language,
        linkedinUsername: config.contact?.linkedin,
        licenseFile: license.file ?? 'LICENSE.txt',
        badges: config.badges,
      } satisfies ShieldsArgs,
    )
    : []
  const [bugUrl, featUrl] = await Promise.all([
    config.issueTemplates?.bug
      ? issueTemplateUrl(
        defaultedOptions.workspaceRootPath,
        repoUrl as string,
        config.issueTemplates.bug,
      )
      : undefined,
    config.issueTemplates?.feature
      ? issueTemplateUrl(
        defaultedOptions.workspaceRootPath,
        repoUrl as string,
        config.issueTemplates.feature,
      )
      : undefined,
  ])
  const content = defaultedOptions.content ??
    await loadContentDir(
      join(
        defaultedOptions.workspaceRootPath,
        config.content?.dir ?? DEFAULT_CONTENT_DIR,
      ),
    )
  const pkgName = config.workspaceMember?.pkgName ?? config.pkgName ??
    (repoName || undefined)
  return {
    config,
    options: defaultedOptions,
    content,
    repoUrl,
    docUrl,
    demoUrl,
    branch,
    logoSrc,
    screenshotSrc,
    license,
    cocPath,
    badgeList,
    issueUrls: { bug: bugUrl, feat: featUrl },
    pkgName,
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
