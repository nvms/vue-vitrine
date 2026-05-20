import { basename, relative, resolve, sep } from 'node:path'
import { watch } from 'chokidar'
import picomatch from 'picomatch'
import { glob } from 'tinyglobby'

/**
 * @typedef {import('./config.js').ResolvedConfig} ResolvedConfig
 */

/**
 * A discovered story file.
 *
 * @typedef {object} StoryFile
 * @property {string} id Stable identifier (the POSIX-style path relative to the root).
 * @property {string} absPath Absolute path on disk.
 * @property {string} relPath Path relative to the project root, POSIX-style.
 * @property {string} name File name without the `.story.{ext}` suffix.
 * @property {'vue'|'js'|'ts'} format Story file format.
 */

/**
 * A node in the story tree. Folders group stories by directory; story nodes are leaves.
 *
 * @typedef {object} StoryTreeNode
 * @property {'folder'|'story'} type Node kind.
 * @property {string} label Display label.
 * @property {string} path Path key, unique within the tree.
 * @property {StoryTreeNode[]} [children] Child nodes, present on folders.
 * @property {StoryFile} [story] The story file, present on story nodes.
 */

/**
 * Handlers for story file changes observed by {@link watchStories}.
 *
 * @typedef {object} WatchHandlers
 * @property {(story: StoryFile) => void} [onAdd] A story file was created.
 * @property {(story: StoryFile) => void} [onRemove] A story file was deleted.
 * @property {(story: StoryFile) => void} [onChange] A story file was modified.
 */

const STORY_RE = /\.story\.(vue|js|ts)$/

const PRUNE_DIRS = new Set([
  'node_modules',
  '.git',
  'dist',
  '.vitrine',
  '.handoff',
  'coverage',
  'types',
])

/**
 * Find every story file under the project root.
 *
 * @param {ResolvedConfig} config
 * @returns {Promise<StoryFile[]>} Story files sorted by id.
 */
export async function discoverStories(config) {
  const matches = await glob(config.stories, {
    cwd: config.root,
    ignore: config.exclude,
    absolute: true,
    onlyFiles: true,
  })
  return matches
    .filter((path) => STORY_RE.test(path))
    .map((path) => toStoryFile(config.root, path))
    .sort((a, b) => a.id.localeCompare(b.id))
}

/**
 * Group story files into a tree keyed by their directory structure.
 *
 * @param {StoryFile[]} stories
 * @returns {StoryTreeNode[]} The top-level nodes of the tree.
 */
export function buildStoryTree(stories) {
  /** @type {StoryTreeNode} */
  const root = { type: 'folder', label: '', path: '', children: [] }

  for (const story of stories) {
    const segments = story.relPath.split('/')
    const dirs = segments.slice(0, -1)
    let node = root
    let path = ''
    for (const dir of dirs) {
      path = path ? `${path}/${dir}` : dir
      let folder = node.children.find(
        (child) => child.type === 'folder' && child.path === path,
      )
      if (!folder) {
        folder = { type: 'folder', label: dir, path, children: [] }
        node.children.push(folder)
      }
      node = folder
    }
    node.children.push({
      type: 'story',
      label: story.name,
      path: story.relPath,
      story,
    })
  }

  sortTree(root)
  return root.children
}

/**
 * Watch the project root for story files being added, removed, or changed.
 *
 * @param {ResolvedConfig} config
 * @param {WatchHandlers} [handlers]
 * @returns {import('chokidar').FSWatcher} The watcher. Call `close()` to stop it.
 */
export function watchStories(config, handlers = {}) {
  const isStory = createMatcher(config)

  const watcher = watch(config.root, {
    ignoreInitial: true,
    persistent: true,
    ignored: (path, stats) => {
      const rel = toPosix(relative(config.root, path))
      if (rel === '') return false
      if (rel.split('/').some((segment) => PRUNE_DIRS.has(segment))) return true
      if (stats?.isFile() && !STORY_RE.test(path)) return true
      return false
    },
  })

  const dispatch = (handler) => (path) => {
    if (!handler) return
    const absPath = resolve(path)
    const rel = toPosix(relative(config.root, absPath))
    if (isStory(rel)) handler(toStoryFile(config.root, absPath))
  }

  watcher.on('add', dispatch(handlers.onAdd))
  watcher.on('unlink', dispatch(handlers.onRemove))
  watcher.on('change', dispatch(handlers.onChange))
  return watcher
}

/**
 * Build a predicate that matches story files against the include and exclude globs.
 *
 * @param {ResolvedConfig} config
 * @returns {(relPath: string) => boolean}
 */
function createMatcher(config) {
  const include = config.stories.map((pattern) => picomatch(pattern, { dot: false }))
  const exclude = config.exclude.map((pattern) => picomatch(pattern, { dot: true }))
  return (relPath) => {
    if (!STORY_RE.test(relPath)) return false
    if (exclude.some((match) => match(relPath))) return false
    return include.length === 0 || include.some((match) => match(relPath))
  }
}

/**
 * @param {string} root
 * @param {string} absPath
 * @returns {StoryFile}
 */
function toStoryFile(root, absPath) {
  const relPath = toPosix(relative(root, absPath))
  const format = /** @type {'vue'|'js'|'ts'} */ (absPath.match(STORY_RE)[1])
  return {
    id: relPath,
    absPath,
    relPath,
    name: basename(absPath).replace(STORY_RE, ''),
    format,
  }
}

/**
 * Sort a folder's children: folders before stories, each group alphabetical.
 *
 * @param {StoryTreeNode} folder
 */
function sortTree(folder) {
  if (!folder.children) return
  folder.children.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'folder' ? -1 : 1
    return a.label.localeCompare(b.label, undefined, { sensitivity: 'base' })
  })
  for (const child of folder.children) sortTree(child)
}

/**
 * @param {string} path
 * @returns {string}
 */
function toPosix(path) {
  return sep === '/' ? path : path.split(sep).join('/')
}
