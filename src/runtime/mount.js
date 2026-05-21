import { createApp, h, ref } from 'vue'
import { createStoryContext, STORY_KEY } from './context.js'
import { Variant } from './Variant.js'

/**
 * @typedef {import('./context.js').StoryMeta} StoryMeta
 * @typedef {import('./controls.js').ControlState} ControlState
 */

/**
 * Result of inspecting a story file without displaying it.
 *
 * @typedef {object} HarvestResult
 * @property {StoryMeta|null} meta The registered subject, if `defineStory` was called.
 * @property {string[]} variants Variant names in declaration order.
 * @property {Error|null} error An error thrown while the story file was mounted.
 */

/**
 * Mount a story file once with no active variant to read its metadata.
 *
 * @param {import('vue').Component} component The story file component.
 * @returns {HarvestResult}
 */
export function harvestStory(component) {
  const context = createStoryContext(ref(null))
  const host = document.createElement('div')
  const app = createApp(component)
  app.config.errorHandler = () => {}
  app.config.warnHandler = () => {}
  app.component('Variant', Variant)
  app.provide(STORY_KEY, context)

  let error = null
  try {
    app.mount(host)
  } catch (cause) {
    error = cause instanceof Error ? cause : new Error(String(cause))
  }

  const result = {
    meta: context.meta.value,
    variants: context.variants.value.slice(),
    error,
  }
  try {
    app.unmount()
  } catch {}
  return result
}

/**
 * Mount a single variant of a story file in its own Vue app.
 *
 * @param {import('vue').Component} component The story file component.
 * @param {string} variant The variant to render.
 * @param {Element} el The element to mount into.
 * @param {{ onError?: (error: unknown) => void, controls?: ControlState }} [options]
 * @returns {import('vue').App} The app. Call `unmount()` to tear it down.
 */
export function mountStoryVariant(component, variant, el, options = {}) {
  const context = createStoryContext(ref(variant), options.controls ?? null)
  const app = createApp(component)
  app.config.errorHandler = (cause) => options.onError?.(cause)
  app.component('Variant', Variant)
  app.provide(STORY_KEY, context)
  app.mount(el)
  return app
}

/**
 * Mount a subject component directly, for a story that registered a subject
 * but declared no variants. Control overrides are applied to the subject.
 *
 * @param {import('vue').Component} component The subject component.
 * @param {Element} el The element to mount into.
 * @param {{ onError?: (error: unknown) => void, controls?: ControlState }} [options]
 * @returns {import('vue').App} The app. Call `unmount()` to tear it down.
 */
export function mountSubject(component, el, options = {}) {
  const root = {
    render() {
      const overrides = options.controls ? { ...options.controls.overrides } : {}
      return h(component, overrides)
    },
  }
  const app = createApp(root)
  app.config.errorHandler = (cause) => options.onError?.(cause)
  app.mount(el)
  return app
}
