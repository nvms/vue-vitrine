import { spawn } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { createServer as createHttpServer } from 'node:http'
import { relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { createServer as createViteServer } from 'vite'
import { discoverStories } from './discovery.js'
import { createMetaService } from './meta.js'
import { c } from './output.js'
import { vitrinePlugin } from './plugin.js'

/**
 * @typedef {import('./config.js').ResolvedConfig} ResolvedConfig
 */

const packageDir = resolve(fileURLToPath(import.meta.url), '../..')
const runtimeDir = resolve(packageDir, 'src/runtime')

/**
 * Run the workshop: a Vite dev server hosting the vitrine host app.
 *
 * @param {ResolvedConfig} config
 * @returns {Promise<void>} Resolves when the process is interrupted.
 */
export async function serve(config) {
  const stories = await discoverStories(config)
  const metaService = createMetaService(config.root)

  const vite = await createViteServer({
    root: config.root,
    base: '/',
    configFile: false,
    appType: 'custom',
    clearScreen: false,
    server: {
      middlewareMode: true,
      fs: { allow: [config.root, packageDir] },
    },
    optimizeDeps: { include: ['vue'] },
    resolve: {
      dedupe: ['vue'],
      alias: { 'vue-vitrine': resolve(packageDir, 'src/index.js') },
    },
    plugins: [
      vue(),
      vitrinePlugin({ config, initialStories: stories, metaService }),
    ],
    ...config.vite,
  })

  const indexHtml = buildIndexHtml()
  const httpServer = createHttpServer((req, res) => {
    vite.middlewares(req, res, async () => {
      try {
        const html = await vite.transformIndexHtml(req.url || '/', indexHtml)
        res.statusCode = 200
        res.setHeader('content-type', 'text/html')
        res.end(html)
      } catch (error) {
        vite.ssrFixStacktrace(error)
        res.statusCode = 500
        res.end(error.message)
      }
    })
  })

  const port = await listen(httpServer, config.server.port, config.server.host)

  const url = `http://${config.server.host}:${port}/`
  printBanner(config, stories, url)
  if (config.server.open) openBrowser(url)

  await new Promise((resolveExit) => {
    const stop = () => {
      vite.close().finally(() => httpServer.close(() => resolveExit()))
    }
    process.once('SIGINT', stop)
    process.once('SIGTERM', stop)
  })
}

/**
 * Listen on the given port, advancing to the next port when one is in use.
 *
 * @param {import('node:http').Server} server
 * @param {number} startPort
 * @param {string} host
 * @param {number} [maxAttempts]
 * @returns {Promise<number>} The port the server bound to.
 */
function listen(server, startPort, host, maxAttempts = 20) {
  return new Promise((resolveListen, rejectListen) => {
    let port = startPort
    let attempts = 0

    const onError = (error) => {
      if (error.code === 'EADDRINUSE' && attempts < maxAttempts) {
        attempts += 1
        port += 1
        server.listen(port, host)
      } else {
        rejectListen(error)
      }
    }

    server.on('error', onError)
    server.listen(port, host, () => {
      server.off('error', onError)
      resolveListen(port)
    })
  })
}

/**
 * @returns {string}
 */
function buildIndexHtml() {
  const template = readFileSync(resolve(runtimeDir, 'index.html'), 'utf8')
  return template.replace('{{entry}}', `/@fs/${resolve(runtimeDir, 'main.js')}`)
}

/**
 * @param {ResolvedConfig} config
 * @param {import('./discovery.js').StoryFile[]} stories
 * @param {string} url
 */
function printBanner(config, stories, url) {
  const where = relative(process.cwd(), config.root) || '.'
  const count = stories.length === 1 ? '1 story' : `${stories.length} stories`
  console.log()
  console.log(`  ${c.bold('vue-vitrine')}  ${c.dim(where)}`)
  console.log(`  ${c.green('ready')}  ${c.cyan(url)}`)
  console.log(`  ${c.dim(count)}`)
  if (stories.length === 0) {
    console.log(`  ${c.yellow('no story files found')} ${c.dim(`(${config.stories.join(', ')})`)}`)
  }
  console.log()
  console.log(c.dim('  press Ctrl+C to stop'))
}

/**
 * @param {string} url
 */
function openBrowser(url) {
  const command =
    process.platform === 'darwin'
      ? 'open'
      : process.platform === 'win32'
        ? 'start'
        : 'xdg-open'
  try {
    spawn(command, [url], {
      stdio: 'ignore',
      detached: true,
      shell: process.platform === 'win32',
    }).unref()
  } catch {}
}
