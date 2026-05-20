import { relative } from 'node:path'
import { buildStoryTree, discoverStories, watchStories } from './discovery.js'
import { c } from './output.js'

/**
 * @typedef {import('./config.js').ResolvedConfig} ResolvedConfig
 * @typedef {import('./discovery.js').StoryFile} StoryFile
 * @typedef {import('./discovery.js').StoryTreeNode} StoryTreeNode
 */

/**
 * Run the workshop against a project.
 *
 * Discovery, the story tree, and the file watcher are in place. The Vite-powered
 * host application is wired in by a later milestone; this entry point grows into
 * the dev server it serves.
 *
 * @param {ResolvedConfig} config
 * @returns {Promise<void>} Resolves when the process is interrupted.
 */
export async function serve(config) {
  const stories = await discoverStories(config)
  printDiscovery(config, stories)

  const watcher = watchStories(config, {
    onAdd: (story) => logChange('added', c.green, story),
    onRemove: (story) => logChange('removed', c.red, story),
    onChange: (story) => logChange('changed', c.cyan, story),
  })

  console.log(c.dim('\nwatching for story changes - press Ctrl+C to stop'))

  await new Promise((resolve) => {
    const stop = () => {
      watcher.close().then(() => {
        console.log(c.dim('\nstopped'))
        resolve()
      })
    }
    process.once('SIGINT', stop)
    process.once('SIGTERM', stop)
  })
}

/**
 * @param {ResolvedConfig} config
 * @param {StoryFile[]} stories
 */
function printDiscovery(config, stories) {
  const where = relative(process.cwd(), config.root) || '.'
  console.log(`${c.bold('vue-vitrine')} ${c.dim(`(${where})`)}`)
  if (config.configFile) {
    console.log(c.dim(`config  ${relative(config.root, config.configFile)}`))
  }
  console.log()

  if (stories.length === 0) {
    console.log(c.yellow('no story files found'))
    console.log(c.dim(`looked for ${config.stories.join(', ')}`))
    return
  }

  const count = stories.length === 1 ? '1 story' : `${stories.length} stories`
  console.log(c.dim(count))
  printTree(buildStoryTree(stories), '  ')
}

/**
 * @param {StoryTreeNode[]} nodes
 * @param {string} indent
 */
function printTree(nodes, indent) {
  for (const node of nodes) {
    if (node.type === 'folder') {
      console.log(`${indent}${c.bold(node.label)}/`)
      printTree(node.children ?? [], `${indent}  `)
    } else {
      console.log(`${indent}${node.label} ${c.dim(node.story.relPath)}`)
    }
  }
}

/**
 * @param {string} label
 * @param {(text: string|number) => string} color
 * @param {StoryFile} story
 */
function logChange(label, color, story) {
  console.log(`${color(label)} ${story.relPath}`)
}
