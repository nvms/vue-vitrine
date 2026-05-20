import { existsSync } from 'node:fs'
import { isAbsolute, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

/**
 * @typedef {import('./index.js').VitrineConfig} VitrineConfig
 * @typedef {import('./index.js').VitrineServerConfig} VitrineServerConfig
 */

/**
 * Configuration after defaults are applied and paths are resolved.
 *
 * @typedef {object} ResolvedConfig
 * @property {string} root Absolute project root.
 * @property {string|null} configFile Absolute path to the loaded config file, or null.
 * @property {string[]} stories Glob patterns matching story files.
 * @property {string[]} exclude Glob patterns excluded from discovery.
 * @property {string|null} setupFile Absolute path to a global setup file, or null.
 * @property {Required<VitrineServerConfig>} server Resolved dev server options.
 * @property {import('vite').UserConfig} vite Vite config to merge.
 */

const CONFIG_NAMES = ['vitrine.config.js', 'vitrine.config.mjs']

/**
 * Default discovery and server settings before any user config is applied.
 */
export const defaults = Object.freeze({
  stories: ['**/*.story.{vue,js,ts}'],
  exclude: ['**/node_modules/**', '**/dist/**', '**/.vitrine/**', '**/.git/**'],
  server: Object.freeze({ port: 6006, host: 'localhost', open: false }),
})

/**
 * Locate the config file for a project.
 *
 * @param {string} root Absolute project root.
 * @param {string} [explicit] An explicit path from the `--config` flag.
 * @returns {string|null} Absolute path to the config file, or null when none exists.
 */
export function resolveConfigFile(root, explicit) {
  if (explicit) {
    const file = isAbsolute(explicit) ? explicit : resolve(root, explicit)
    if (!existsSync(file)) throw new Error(`config file not found: ${file}`)
    return file
  }
  for (const name of CONFIG_NAMES) {
    const file = resolve(root, name)
    if (existsSync(file)) return file
  }
  return null
}

/**
 * Import a config file and return its exported object.
 *
 * @param {string} file Absolute path to the config file.
 * @returns {Promise<VitrineConfig>}
 */
export async function loadConfigFile(file) {
  const mod = await import(pathToFileURL(file).href)
  const config = mod.default ?? mod.config
  if (config == null) {
    throw new Error(`config file has no default export: ${file}`)
  }
  if (typeof config !== 'object' || Array.isArray(config)) {
    throw new Error(`config file must export an object: ${file}`)
  }
  return config
}

/**
 * Load and resolve configuration for a project.
 *
 * @param {object} [options]
 * @param {string} [options.root] Project root. Defaults to the current working directory.
 * @param {string} [options.configFile] Explicit config file path.
 * @param {Partial<VitrineServerConfig>} [options.overrides] Server options from CLI flags.
 * @returns {Promise<ResolvedConfig>}
 */
export async function loadConfig(options = {}) {
  const root = resolve(options.root ?? process.cwd())
  const configFile = resolveConfigFile(root, options.configFile)
  const userConfig = configFile ? await loadConfigFile(configFile) : {}
  return mergeConfig(root, configFile, userConfig, options.overrides ?? {})
}

/**
 * @param {string} root
 * @param {string|null} configFile
 * @param {VitrineConfig} userConfig
 * @param {Partial<VitrineServerConfig>} overrides
 * @returns {ResolvedConfig}
 */
function mergeConfig(root, configFile, userConfig, overrides) {
  const server = { ...defaults.server, ...(userConfig.server ?? {}) }
  if (overrides.port != null) server.port = overrides.port
  if (overrides.host != null) server.host = overrides.host
  if (overrides.open != null) server.open = overrides.open

  return {
    root,
    configFile,
    stories: toPatternArray(userConfig.stories) ?? [...defaults.stories],
    exclude: [...defaults.exclude, ...(toPatternArray(userConfig.exclude) ?? [])],
    setupFile: resolveSetupFile(root, userConfig.setupFile),
    server,
    vite: userConfig.vite ?? {},
  }
}

/**
 * Normalize a string-or-array glob option into a deduplicated array.
 *
 * @param {string|string[]|undefined|null} value
 * @returns {string[]|null}
 */
function toPatternArray(value) {
  if (value == null) return null
  const list = Array.isArray(value) ? value : [value]
  const patterns = list.filter((item) => typeof item === 'string' && item.length > 0)
  return [...new Set(patterns)]
}

/**
 * @param {string} root
 * @param {string|null|undefined} setupFile
 * @returns {string|null}
 */
function resolveSetupFile(root, setupFile) {
  if (!setupFile) return null
  return isAbsolute(setupFile) ? setupFile : resolve(root, setupFile)
}
