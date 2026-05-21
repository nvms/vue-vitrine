import { getCurrentInstance, inject } from 'vue'
import { STORY_KEY } from './context.js'

/**
 * @typedef {import('./context.js').StoryMeta} StoryMeta
 */

/**
 * Register the subject of a story file.
 *
 * Call this once in the `<script setup>` block of a `.story.vue` file. It
 * records the component under test and the story's title with the surrounding
 * vitrine context. Called outside a vitrine mount it is a no-op, so a story file
 * remains a plain Vue component.
 *
 * @param {StoryMeta} options
 * @returns {StoryMeta}
 */
export function defineStory(options) {
  const context = getCurrentInstance() ? inject(STORY_KEY, null) : null
  if (context) {
    context.setMeta({ component: options.component, title: options.title })
  }
  return options
}
