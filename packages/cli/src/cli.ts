import { Command } from '@cliffy/command'
import denoConf from '../deno.json' with { type: 'json' }
import { logger, setLogLevel } from './logger.ts'
import { type GenResult, runGen } from './gen.ts'
import { runInit } from './init.ts'
import { configJsonSchema } from './schema.ts'
import { runValidate, type ValidationResult } from './validate.ts'
/** Exit code used when the `--check` mode detects out of sync readmes */
export const CHECK_EXIT_CODE = 2
/** Exit code used when the validate command finds errors */
export const VALIDATE_EXIT_CODE = 1
/** Internal state collected while the commands run */
type RunState = {
  gen?: GenResult
  validate?: ValidationResult
}
/**
 * Run the readma cli
 * @param args Cli args, default to `Deno.args`
 * @returns The exit code of the run
 */
export async function runCli(args: string[] = Deno.args): Promise<number> {
  const state: RunState = {}
  await new Command()
    .name('readma')
    .version(denoConf.version)
    .description('Command line utility for Readma')
    .globalOption('-d, --debug', 'Enable debug output.')
    .globalOption('--root <path:string>', 'Project root path.', {
      default: '.',
    })
    .action((options) => {
      setLogLevel(options.debug ? 'debug' : 'info')
      logger.warn(
        'Main command called. Nothing will happen, use one of the subcommands: gen, init, validate, schema',
      )
    })
    .command('gen', 'Generate readme(s)')
    .option('--dry-run', 'Render the readmes without writing them')
    .option('--stdout', 'Print the rendered readmes to stdout')
    .option(
      '--check',
      'Exit with code 2 when a readme is out of sync with the config',
    )
    .option('--config <path:string>', 'Path to the config folder or file')
    .option('--root-only', 'Only generate the workspace root readme')
    .option('--members-only', 'Only generate the workspace member readmes')
    .option(
      '--member <path:string>',
      'Only generate the readme of a member path',
    )
    .option('--offline', 'Skip every network call')
    .action(async (genOptions) => {
      setLogLevel(genOptions.debug ? 'debug' : 'info')
      state.gen = await runGen({
        rootPath: genOptions.root,
        configPath: genOptions.config,
        dryRun: genOptions.dryRun,
        stdout: genOptions.stdout,
        check: genOptions.check,
        rootOnly: genOptions.rootOnly,
        membersOnly: genOptions.membersOnly,
        member: genOptions.member,
        offline: genOptions.offline,
      })
    })
    .command('init', 'Scaffold a readma.config.ts')
    .option('--force', 'Overwrite an existing config file')
    .option('--config <path:string>', 'Target config file or folder path')
    .option('--dry-run', 'Print the config content without writing it')
    .action(async (initOptions) => {
      setLogLevel(initOptions.debug ? 'debug' : 'info')
      const result = await runInit({
        rootPath: initOptions.root,
        force: initOptions.force,
        configPath: initOptions.config,
        dryRun: initOptions.dryRun,
      })
      if (initOptions.dryRun) console.log(result.content)
    })
    .command('validate', 'Validate the readma config and its referenced files')
    .option('--config <path:string>', 'Path to the config folder or file')
    .action(async (validateOptions) => {
      setLogLevel(validateOptions.debug ? 'debug' : 'info')
      state.validate = await runValidate({
        rootPath: validateOptions.root,
        configPath: validateOptions.config,
      })
      for (const issue of state.validate.issues) {
        logger.error(issue.message)
      }
    })
    .command('schema', 'Print the JSON schema of the readma config')
    .action(() => {
      console.log(JSON.stringify(configJsonSchema(), undefined, 2))
    })
    .parse(args)
  if (state.gen?.check && state.gen.changed.length > 0) return CHECK_EXIT_CODE
  if (state.validate && !state.validate.ok) return VALIDATE_EXIT_CODE
  return 0
}
