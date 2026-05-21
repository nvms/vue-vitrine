import { computed, markRaw, ref, shallowRef } from 'vue'
import { stories as manifest } from 'virtual:vitrine-stories'
import { harvestStory } from './mount.js'
import { buildTitleTree } from './tree.js'

/**
 * A story file after it has been loaded and inspected.
 *
 * @typedef {object} StoryRecord
 * @property {string} id Stable id (the story's path relative to the project root).
 * @property {string} relPath Path relative to the project root.
 * @property {string} name File name without the `.story.{ext}` suffix.
 * @property {'vue'|'js'|'ts'} format
 * @property {string} title Slash-delimited title used to group the story.
 * @property {string[]} variants Variant names, in declaration order.
 * @property {import('vue').Component|null} component The story file component.
 * @property {import('vue').Component|null} subject The component under test.
 * @property {boolean} synthetic True when the story has a subject but no variants.
 * @property {string|null} error A load or mount error, if one occurred.
 */

const STORY_EXT = /\.story\.(vue|js|ts)$/

export const records = shallowRef(/** @type {StoryRecord[]} */ ([]))
export const tree = shallowRef(/** @type {import('./tree.js').TreeNode[]} */ ([]))
export const activeId = ref(/** @type {string|null} */ (null))
export const activeVariant = ref(/** @type {string|null} */ (null))
export const loading = ref(true)

/** The currently selected story record. */
export const activeRecord = computed(
  () => records.value.find((record) => record.id === activeId.value) ?? null,
)

/**
 * Load and inspect every story file.
 *
 * @returns {Promise<void>}
 */
export async function loadAll() {
  loading.value = true
  const built = []
  for (const entry of manifest) {
    built.push(await loadRecord(entry))
  }
  records.value = built
  tree.value = buildTitleTree(built)
  ensureSelection()
  loading.value = false
}

/**
 * Re-import a single story file and replace its record. Used by hot reload.
 *
 * @param {string} id
 * @returns {Promise<void>}
 */
export async function refreshStory(id) {
  const entry = manifest.find((item) => item.id === id)
  if (!entry) return
  const record = await loadRecord(entry, `?t=${Date.now()}`)
  records.value = records.value.map((existing) =>
    existing.id === id ? record : existing,
  )
  tree.value = buildTitleTree(records.value)
  ensureSelection()
}

/**
 * @param {string} id
 */
export function selectStory(id) {
  activeId.value = id
  const record = records.value.find((entry) => entry.id === id)
  activeVariant.value = record?.variants[0] ?? null
}

/**
 * @param {string} name
 */
export function selectVariant(name) {
  activeVariant.value = name
}

/**
 * @param {{ id: string, relPath: string, name: string, format: string, url: string, load: () => Promise<any> }} entry
 * @param {string} [bust] Optional cache-busting query appended to the import.
 * @returns {Promise<StoryRecord>}
 */
async function loadRecord(entry, bust) {
  const base = {
    id: entry.id,
    relPath: entry.relPath,
    name: entry.name,
    format: /** @type {'vue'|'js'|'ts'} */ (entry.format),
  }

  if (entry.format !== 'vue') {
    return {
      ...base,
      title: titleFromPath(entry.relPath),
      variants: [],
      component: null,
      subject: null,
      synthetic: false,
      error: 'This story uses the CSF format, which is not supported yet.',
    }
  }

  let module
  try {
    module = bust
      ? await import(/* @vite-ignore */ `${entry.url}${bust}`)
      : await entry.load()
  } catch (cause) {
    return errorRecord(base, entry, messageOf(cause))
  }

  const component = module.default
  if (!component) {
    return errorRecord(base, entry, 'Story file has no default export.')
  }

  const { meta, variants, error } = harvestStory(component)
  const subject = meta?.component ?? null
  const synthetic = variants.length === 0 && Boolean(subject)

  return {
    ...base,
    title: meta?.title?.trim() || titleFromPath(entry.relPath),
    variants: synthetic ? ['Default'] : variants,
    component: markRaw(component),
    subject: subject ? markRaw(subject) : null,
    synthetic,
    error: error ? messageOf(error) : null,
  }
}

/**
 * @param {object} base
 * @param {{ relPath: string }} entry
 * @param {string} error
 * @returns {StoryRecord}
 */
function errorRecord(base, entry, error) {
  return {
    ...base,
    title: titleFromPath(entry.relPath),
    variants: [],
    component: null,
    subject: null,
    synthetic: false,
    error,
  }
}

function ensureSelection() {
  const list = records.value
  if (list.length === 0) {
    activeId.value = null
    activeVariant.value = null
    return
  }
  if (!list.some((record) => record.id === activeId.value)) {
    activeId.value = list[0].id
  }
  const current = list.find((record) => record.id === activeId.value)
  if (!current || !current.variants.includes(activeVariant.value)) {
    activeVariant.value = current?.variants[0] ?? null
  }
}

/**
 * @param {string} relPath
 * @returns {string}
 */
function titleFromPath(relPath) {
  return relPath.replace(STORY_EXT, '')
}

/**
 * @param {unknown} value
 * @returns {string}
 */
function messageOf(value) {
  if (value instanceof Error) return value.message
  return String(value)
}
