import { defineComponent, inject } from 'vue'
import { STORY_KEY } from './context.js'
import { applyControls } from './controls.js'

/**
 * A named scenario inside a `.story.vue` file.
 *
 * `Variant` registers its name with the surrounding story context and renders
 * its slot only when it is the active variant. When a story has a subject and
 * a control state, the active variant's slot is rewritten so the subject
 * receives the panel's prop overrides. Outside a vitrine mount it renders its
 * slot unconditionally, so a story file is still a valid component.
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
      if (!slots.default) return null
      if (!context) return slots.default()
      if (context.activeVariant.value !== props.name) return null

      const children = slots.default()
      const subject = context.meta.value?.component
      const controls = context.controls
      if (!subject || !controls) return children

      return applyControls(
        children,
        subject,
        { ...controls.overrides },
        controls.reportSeed,
      )
    }
  },
})
