import { ref, shallowRef } from 'vue'

/**
 * Injection key shared by `defineStory`, the `Variant` component, and the host
 * app. All three must import this exact module so the Symbol identity matches.
 */
export const STORY_KEY = Symbol('vitrine:story')

/**
 * The subject of a story, registered by `defineStory`.
 *
 * @typedef {object} StoryMeta
 * @property {import('vue').Component} [component] The component under test.
 * @property {string} [title] Slash-delimited title used to group the story.
 */

/**
 * A live channel between a mounted story file and whoever mounted it.
 *
 * During a mount, `defineStory` records the subject and each `<Variant>`
 * registers its name. The host reads `meta` and `variants` afterwards. Only the
 * `<Variant>` whose name equals `activeVariant` renders its slot.
 *
 * @typedef {object} StoryContext
 * @property {import('vue').Ref<string|null>} activeVariant Name of the variant to render.
 * @property {import('vue').ShallowRef<StoryMeta|null>} meta The registered subject.
 * @property {import('vue').Ref<string[]>} variants Variant names, in declaration order.
 * @property {import('./controls.js').ControlState|null} controls Per-variant control state.
 * @property {(meta: StoryMeta) => void} setMeta
 * @property {(name: string) => void} addVariant
 */

/**
 * Create a story context.
 *
 * @param {import('vue').Ref<string|null>} activeVariant
 * @param {import('./controls.js').ControlState|null} [controls]
 * @returns {StoryContext}
 */
export function createStoryContext(activeVariant, controls = null) {
  const meta = shallowRef(null)
  const variants = ref([])
  return {
    activeVariant,
    meta,
    variants,
    controls,
    setMeta(value) {
      meta.value = value
    },
    addVariant(name) {
      if (!variants.value.includes(name)) {
        variants.value = [...variants.value, name]
      }
    },
  }
}
