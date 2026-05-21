import { defineComponent, inject } from 'vue'
import { STORY_KEY } from './context.js'

/**
 * A named scenario inside a `.story.vue` file.
 *
 * `Variant` registers its name with the surrounding story context and renders
 * its slot only when it is the active variant. Outside a vitrine mount it
 * renders its slot unconditionally, so a story file is still a valid component.
 */
export const Variant = defineComponent({
  name: 'Variant',
  props: {
    name: { type: String, required: true },
  },
  setup(props, { slots }) {
    const context = inject(STORY_KEY, null)
    if (context) context.addVariant(props.name)

    return () => {
      if (!context) return slots.default ? slots.default() : null
      return context.activeVariant.value === props.name && slots.default
        ? slots.default()
        : null
    }
  },
})
