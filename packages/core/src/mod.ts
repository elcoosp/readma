export { readme, renderFooter, renderHeader, writeReadme } from './templates.ts'
export * as utils from './utils.ts'
export * as types from './types.ts'
export * as mdx from './mdx-manager.ts'
export * as shieldsModule from './shields.ts'
export * as tocModule from './toc.ts'
export * as contextModule from './context.ts'
export * as sectionsModule from './sections.ts'
export * as ioModule from './io.ts'
export { ReadmaError } from './utils.ts'
export { ghSlug, md } from './utils.ts'
export { Tocer } from './toc.ts'
export { renderShields, shield, shields, shieldUrl } from './shields.ts'
export type { Shield } from './shields.ts'
export {
  fetchJsonDescription,
  issueTemplateUrl,
  resolveContext,
} from './context.ts'
export type { ReadmeContext } from './context.ts'
export { allSections, installSnippet, renderSections } from './sections.ts'
export type { SectionDef } from './sections.ts'
export {
  detectBranch,
  detectLicense,
  getReadmaConfig,
  io,
  matchLicense,
  readOptionalFile,
  resetIo,
  setIo,
} from './io.ts'
export type { LicenseInfo, ReadmaIo } from './io.ts'
export type {
  BadgesConfig,
  BuiltinBadgeId,
  CustomBadge,
  GhIssueTemplateFilename,
  GlobalOptions,
  LicenseId,
  MdSrc,
  PackageRegistry,
  ReadmeTemplateArgs,
  SourceLanguage,
  TemplateFn,
  TocConfig,
  VcsName,
  WorkspaceMember,
} from './types.ts'
export { BUILTIN_SECTION_KEYS, COC_FILE_PATH } from './types.ts'
export type { BuiltinSectionKey } from './types.ts'
