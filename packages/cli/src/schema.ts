/**
 * JSON schema of the readma config, emit it with `readma schema` and feed it
 * to your editor to get autocompletion inside `readma.yaml`
 */
export function configJsonSchema(): Record<string, unknown> {
  return {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    title: 'Readma config',
    description: 'Configuration of the readma readme generator',
    type: 'object',
    required: ['title'],
    properties: {
      $schema: { type: 'string', description: 'Json schema reference' },
      title: { type: 'string', description: 'Title of the readme' },
      description: {
        type: 'string',
        description: 'Short description displayed under the title',
      },
      repo: {
        type: 'string',
        description: 'Github slug of the project, e.g. owner/name',
      },
      language: { type: 'string', enum: ['rs', 'ts'] },
      packageRegistry: {
        type: 'string',
        enum: ['jsr', 'npm', 'crates.io'],
      },
      pkgName: {
        type: 'string',
        description:
          'Package name used by the install snippet, auto filled by the cli',
      },
      author: { type: 'string' },
      repobeats: { type: 'string' },
      coc: { type: 'string' },
      links: {
        type: 'object',
        properties: {
          repo: { type: 'string' },
          demo: { type: 'string' },
          doc: { type: 'string' },
        },
      },
      contact: {
        type: 'object',
        properties: {
          email: { type: 'string' },
          x: { type: 'string' },
          linkedin: { type: 'string' },
        },
      },
      images: {
        type: 'object',
        properties: {
          logo: { type: 'string' },
          screenshot: { type: 'string' },
        },
      },
      license: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          file: { type: 'string' },
        },
      },
      issueTemplates: {
        type: 'object',
        properties: {
          bug: { type: 'string' },
          feature: { type: 'string' },
        },
      },
      badges: {
        type: 'object',
        properties: {
          style: {
            type: 'string',
            enum: ['for-the-badge', 'social', 'flat', 'flat-square', 'plastic'],
          },
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
          backToTop: { type: 'boolean' },
        },
      },
      content: {
        type: 'object',
        properties: {
          dir: {
            type: 'string',
            description: 'Content directory, default to readma',
          },
        },
      },
      sections: {
        type: 'object',
        description: 'Per section overrides keyed by section id',
        additionalProperties: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            hide: { type: 'boolean' },
          },
        },
      },
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
