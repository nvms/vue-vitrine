import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { loadConfig } from './config.js'
import { c } from './output.js'
import { serve } from './serve.js'

/** The vue-vitrine version, read from package.json. */
export const version = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
).version

const ALIASES = { c: 'config', h: 'help', v: 'version', p: 'port' }
const VALUE_FLAGS = new Set(['config', 'root', 'port', 'host'])

/**
 * Parsed command-line arguments.
 *
 * @typedef {object} ParsedArgs
 * @property {string|undefined} command The subcommand, or undefined for the default.
 * @property {boolean} [help] The `--help` flag was given.
 * @property {boolean} [version] The `--version` flag was given.
 * @property {string} [config] Path to a config file.
 * @property {string} [root] Project root.
 * @property {string} [port] Dev server port.
 * @property {string} [host] Dev server host.
 * @property {boolean} [open] Open a browser on start.
 * @property {string[]} _ Positional arguments.
 */

/**
 * Parse `process.argv`-style arguments into a structured object.
 *
 * @param {string[]} argv Arguments, excluding the node binary and script path.
 * @returns {ParsedArgs}
 */
export function parseArgs(argv) {
  /** @type {Record<string, unknown> & { _: string[] }} */
  const out = { _: [] }

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--') {
      out._.push(...argv.slice(i + 1))
      break
    }
    if (!arg.startsWith('-') || arg === '-') {
      out._.push(arg)
      continue
    }

    const isLong = arg.startsWith('--')
    let body = isLong ? arg.slice(2) : arg.slice(1)
    let value

    if (isLong && body.startsWith('no-')) {
      out[body.slice(3)] = false
      continue
    }

    const eq = body.indexOf('=')
    if (eq !== -1) {
      value = body.slice(eq + 1)
      body = body.slice(0, eq)
    }

    const name = ALIASES[body] ?? body
    if (VALUE_FLAGS.has(name)) {
      if (value === undefined) {
        value = argv[++i]
        if (value === undefined) throw new Error(`missing value for --${name}`)
      }
      out[name] = value
    } else {
      out[name] = value === undefined ? true : value
    }
  }

  return { ...out, command: out._[0] }
}

/**
 * Load configuration and run the workshop.
 *
 * @param {ParsedArgs} args
 */
async function runServe(args) {
  const root = args.root ? resolve(process.cwd(), args.root) : process.cwd()
  const config = await loadConfig({
    root,
    configFile: args.config,
    overrides: serverOverrides(args),
  })
  await serve(config)
}

/**
 * Build server option overrides from CLI flags.
 *
 * @param {ParsedArgs} args
 * @returns {Partial<import('./config-api.js').VitrineServerConfig>}
 */
function serverOverrides(args) {
  const overrides = {}
  if (args.port !== undefined) {
    const port = Number(args.port)
    if (!Number.isInteger(port) || port < 0 || port > 65535) {
      throw new Error(`invalid port: ${args.port}`)
    }
    overrides.port = port
  }
  if (args.host !== undefined) overrides.host = args.host
  if (args.open !== undefined) overrides.open = Boolean(args.open)
  return overrides
}

/** @type {Record<string, (args: ParsedArgs) => Promise<void>>} */
const commands = {
  serve: runServe,
}

/**
 * The help text shown for `--help` and unknown commands.
 *
 * @returns {string}
 */
export function helpText() {
  return [
    `${c.bold('vue-vitrine')} - a component workshop for Vue 3`,
    '',
    `${c.bold('Usage')}`,
    '  vitrine [command] [options]',
    '',
    `${c.bold('Commands')}`,
    '  serve                start the dev server (default)',
    '',
    `${c.bold('Options')}`,
    '  -c, --config <file>  path to a config file',
    '      --root <dir>     project root (default: current directory)',
    '  -p, --port <number>  dev server port',
    '      --host [host]    dev server host',
    '      --open           open a browser on start',
    '  -h, --help           show this help',
    '  -v, --version        show the version',
  ].join('\n')
}

/**
 * Entry point. Parses arguments, dispatches to a command, and reports errors.
 *
 * @param {string[]} argv Arguments, excluding the node binary and script path.
 * @returns {Promise<void>}
 */
export async function run(argv) {
  let args
  try {
    args = parseArgs(argv)
  } catch (error) {
    console.error(c.red(error.message))
    process.exitCode = 1
    return
  }

  if (args.help) {
    console.log(helpText())
    return
  }
  if (args.version) {
    console.log(version)
    return
  }

  const name = args.command ?? 'serve'
  const command = commands[name]
  if (!command) {
    console.error(c.red(`unknown command: ${name}`))
    console.error(helpText())
    process.exitCode = 1
    return
  }

  try {
    await command(args)
  } catch (error) {
    console.error(c.red(error.message))
    process.exitCode = 1
  }
}
