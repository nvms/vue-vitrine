/**
 * @typedef {import('./store.js').StoryRecord} StoryRecord
 */

/**
 * A node in the sidebar tree.
 *
 * @typedef {object} TreeNode
 * @property {'folder'|'story'} type
 * @property {string} label Display label.
 * @property {string} path Unique key within the tree.
 * @property {TreeNode[]} [children] Present on folders.
 * @property {string} [id] Story record id, present on story nodes.
 */

/**
 * Group story records into a tree by their slash-delimited title.
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
      id: record.id,
    })
  }

  sortTree(root)
  return root.children
}

/**
 * @param {TreeNode} folder
 */
function sortTree(folder) {
  if (!folder.children) return
  folder.children.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'folder' ? -1 : 1
    return a.label.localeCompare(b.label, undefined, { sensitivity: 'base' })
  })
  for (const child of folder.children) sortTree(child)
}
