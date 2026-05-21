import { discoverStories, isStoryFile } from './discovery.js'

/**
 * @typedef {import('./config.js').ResolvedConfig} ResolvedConfig
 * @typedef {import('./discovery.js').StoryFile} StoryFile
 */

const VIRTUAL_ID = 'virtual:vitrine-stories'
const RESOLVED_ID = `\0${VIRTUAL_ID}`

/**
 * Vite plugin that exposes discovered stories to the host app and keeps the
 * list current as story files are created or deleted.
 *
 * The virtual module `virtual:vitrine-stories` exports a `stories` array; each
 * entry carries a `load()` that dynamically imports the story file. When a
 * story file is added or removed the module is invalidated and the page
 * reloads. Edits to existing story files are left to Vue's own hot reload.
 *
 * @param {{ config: ResolvedConfig, initialStories: StoryFile[], metaService: import('./meta.js').MetaService }} options
 * @returns {import('vite').Plugin}
 */
export function vitrinePlugin({ config, initialStories, metaService }) {
  let stories = initialStories

  return {
    name: 'vitrine',

    config() {
      return {
        server: { fs: { allow: [config.root] } },
      }
    },

    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_ID
    },

    load(id) {
      if (id === RESOLVED_ID) return generateManifest(stories)
    },

    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url || !req.url.startsWith('/__vitrine/meta')) return next()
        const file = new URL(req.url, 'http://localhost').searchParams.get('file')
        res.setHeader('content-type', 'application/json')
        if (!file) {
          res.statusCode = 400
          res.end(JSON.stringify({ error: 'missing file parameter' }))
          return
        }
        try {
          res.end(JSON.stringify(metaService.describe(file)))
        } catch (error) {
          res.statusCode = 500
          res.end(JSON.stringify({ error: String(error?.message ?? error) }))
        }
      })

      const reload = async (file) => {
        if (!isStoryFile(config, file)) return
        stories = await discoverStories(config)
        const mod = server.moduleGraph.getModuleById(RESOLVED_ID)
        if (mod) server.moduleGraph.invalidateModule(mod)
        server.ws.send({ type: 'full-reload' })
      }
      server.watcher.on('add', reload)
      server.watcher.on('unlink', reload)
      server.watcher.on('change', (file) => {
        if (file.endsWith('.vue')) metaService.invalidate()
      })
    },
  }
}

/**
 * Generate the source of the `virtual:vitrine-stories` module.
 *
 * @param {StoryFile[]} stories
 * @returns {string}
 */
function generateManifest(stories) {
  const entries = stories.map((story) => {
    const url = `/${story.relPath}`
    return [
      '  {',
      `    id: ${q(story.id)},`,
      `    relPath: ${q(story.relPath)},`,
      `    name: ${q(story.name)},`,
      `    format: ${q(story.format)},`,
      `    url: ${q(url)},`,
      `    load: () => import(${q(url)}),`,
      '  }',
    ].join('\n')
  })
  return `export const stories = [\n${entries.join(',\n')}\n]\n`
}

/**
 * @param {string} value
 * @returns {string}
 */
function q(value) {
  return JSON.stringify(value)
}
