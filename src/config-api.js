/**
 * Configuration types and the `defineConfig` helper.
 *
 * This module has no dependencies so it is safe to import from both the Node
 * CLI and the browser runtime.
 *
 * @module vue-vitrine/config
 */

/**
 * Dev server options.
 *
 * @typedef {object} VitrineServerConfig
 * @property {number} [port] Port the dev server listens on.
 * @property {string} [host] Host the dev server binds to.
 * @property {boolean} [open] Open a browser when the server starts.
 */

/**
 * User configuration, as exported from `vitrine.config.js`.
 *
 * @typedef {object} VitrineConfig
 * @property {string} [root] Project root. Defaults to the current working directory.
 * @property {string|string[]} [stories] Glob(s) matching story files.
 * @property {string|string[]} [exclude] Glob(s) to exclude from discovery.
 * @property {string|null} [setupFile] Path to a global setup file, resolved against the root.
 * @property {VitrineServerConfig} [server] Dev server options.
 * @property {import('vite').UserConfig} [vite] Vite config merged into vitrine's own.
 */

/**
 * Identity helper that gives editor type hints inside `vitrine.config.js`.
 *
 * @param {VitrineConfig} config
 * @returns {VitrineConfig}
 */
export function defineConfig(config) {
  return config
}
