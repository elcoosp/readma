/**
 * JSON schema of the readma config, emit it with `readma schema` and feed it
 * to your editor to get autocompletion inside `readma.config.ts`
 */
export function configJsonSchema(): Record<string, unknown> {
  return {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    title: 'Readma config',
    description: 'Configuration of the readma readme generator',
    type: 'object',
    required: [
      'language',
      'images',
      'author',
      'template',
      'githubUsername',
      'repoName',
      'xHandle',
      'domain',
      'email',
      'title',
      'backToTop',
      'sections',
    ],
    properties: {
      language: { type: 'string', enum: ['rs', 'ts'] },
      title: { type: 'string' },
      author: { type: 'string' },
      githubUsername: { type: 'string' },
      repoName: { type: 'string' },
      xHandle: { type: 'string' },
      linkedinUsername: { type: 'string' },
      domain: { type: 'string' },
      domainExt: { type: 'string' },
      email: { type: 'string' },
      backToTop: { type: 'boolean' },
      repobeats: { type: 'string' },
      status: { type: 'string', enum: ['unreleased', 'early', 'stable'] },
      vcsName: { type: 'string', enum: ['github'] },
      packageRegistry: {
        type: 'string',
        enum: ['jsr', 'npm', 'crates.io'],
      },
      badgeStyle: {
        type: 'string',
        enum: ['for-the-badge', 'social', 'flat', 'flat-square', 'plastic'],
      },
      license: { type: 'string' },
      licenseFile: { type: 'string' },
      coc: { type: 'string' },
      workspaceMember: { $ref: '#/$defs/workspaceMember' },
      root: {
        type: 'object',
        properties: {
          members: {
            type: 'array',
            items: { $ref: '#/$defs/workspaceMember' },
          },
        },
      },
      urls: {
        type: 'object',
        properties: {
          repo: { type: 'string' },
          demo: { type: 'string' },
          doc: { type: 'string' },
        },
      },
      images: {
        type: 'object',
        required: ['logo'],
        properties: {
          logo: { type: 'string' },
          screenshot: { type: 'string' },
        },
      },
      template: {
        type: 'object',
        required: ['bugReport', 'featRequest'],
        properties: {
          bugReport: { type: 'string' },
          featRequest: { type: 'string' },
        },
      },
      sections: {
        type: 'object',
        required: [
          'features',
          'projectDescription',
          'about',
          'installation',
          'acknowledgments',
          'gettingStarted',
          'roadmap',
          'usage',
        ],
        properties: {
          features: { type: 'string' },
          projectDescription: { type: 'string' },
          about: { type: 'string' },
          installation: { type: 'string' },
          acknowledgments: { type: 'string' },
          gettingStarted: { type: 'string' },
          roadmap: { type: 'string' },
          usage: { type: 'string' },
          contributing: { type: 'string' },
        },
        additionalProperties: { type: 'string' },
      },
      badges: {
        type: 'object',
        properties: {
          disabled: {
            type: 'array',
            items: {
              type: 'string',
              enum: [
                'linkedin',
                'msrv',
                'registry',
                'codecov',
                'contributors',
                'forks',
                'stars',
                'commitActivity',
                'actions',
                'issues',
                'pullRequests',
                'lastCommit',
                'release',
                'license',
              ],
            },
          },
          custom: {
            type: 'array',
            items: {
              type: 'object',
              required: ['name', 'image', 'link'],
              properties: {
                name: { type: 'string' },
                image: { type: 'string' },
                link: { type: 'string' },
              },
            },
          },
        },
      },
      toc: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          hide: { type: 'boolean' },
        },
      },
    },
    $defs: {
      workspaceMember: {
        type: 'object',
        required: ['pkgName', 'path', 'description'],
        properties: {
          pkgName: { type: 'string' },
          path: { type: 'string' },
          description: { type: 'string' },
        },
      },
    },
  }
}
