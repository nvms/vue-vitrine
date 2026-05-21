/**
 * @typedef {import('./store.js').StoryRecord} StoryRecord
 */

/**
 * A node in the sidebar tree. Folders contain folders and stories; a story
 * contains its variants; a variant is a leaf.
 *
 * @typedef {object} TreeNode
 * @property {'folder'|'story'|'variant'} type
 * @property {string} label Display label.
 * @property {string} path Unique key within the tree.
 * @property {TreeNode[]} [children] Child nodes, on folders and stories.
 * @property {string} [storyId] Story record id, on story and variant nodes.
 * @property {string[]} [variants] Variant names, on story nodes.
 * @property {boolean} [single] True when a story has one variant or fewer.
 * @property {string} [variant] Variant name, on variant nodes.
 */

/**
 * Build the sidebar tree: story records grouped by their slash-delimited title,
 * with each story's variants as its children.
 *
 * @param {StoryRecord[]} records
 * @returns {TreeNode[]}
 */
export function buildTitleTree(records) {
  /** @type {TreeNode} */
  const root = { type: 'folder', label: '', path: '', children: [] }

  for (const record of records) {
    const segments = record.title
      .split('/')
      .map((part) => part.trim())
      .filter(Boolean)
    const folders = segments.slice(0, -1)
    const leaf = segments[segments.length - 1] || record.name

    let node = root
    let path = ''
    for (const folder of folders) {
      path = path ? `${path}/${folder}` : folder
      let child = node.children.find(
        (entry) => entry.type === 'folder' && entry.path === path,
      )
      if (!child) {
        child = { type: 'folder', label: folder, path, children: [] }
        node.children.push(child)
      }
      node = child
    }

    node.children.push({
      type: 'story',
      label: leaf,
      path: record.id,
      storyId: record.id,
      variants: record.variants,
      single: record.variants.length <= 1,
      children: record.variants.map((variant) => ({
        type: 'variant',
        label: variant,
        path: `${record.id}::${variant}`,
        storyId: record.id,
        variant,
      })),
    })
  }

  sortTree(root)
  return root.children
}

/**
 * Sort folders before stories alphabetically. Variant order is left untouched
 * because declaration order is meaningful.
 *
 * @param {TreeNode} node
 */
function sortTree(node) {
  if (!node.children || node.type === 'story') return
  node.children.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'folder' ? -1 : 1
    return a.label.localeCompare(b.label, undefined, { sensitivity: 'base' })
  })
  for (const child of node.children) sortTree(child)
}
