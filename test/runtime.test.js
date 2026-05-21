// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import ButtonStory from '../examples/forms/Button.story.vue'
import CounterStory from '../examples/Counter.story.vue'
import DividerStory from '../examples/Divider.story.vue'
import { harvestStory, mountStoryVariant } from '../src/runtime/mount.js'

describe('harvestStory', () => {
  it('reads the subject and variant names from a story file', () => {
    const { meta, variants, error } = harvestStory(ButtonStory)
    expect(error).toBeNull()
    expect(meta.title).toBe('Forms/Button')
    expect(variants).toEqual([
      'Primary',
      'Secondary',
      'Ghost',
      'Loading',
      'Disabled',
    ])
  })

  it('reads variants from a story that uses local state', () => {
    const { meta, variants } = harvestStory(CounterStory)
    expect(meta.title).toBe('Inputs/Counter')
    expect(variants).toEqual([
      'Default',
      'Starting value',
      'Large step',
      'Bounded 0 to 5',
    ])
  })

  it('reads the subject from a single-variant story', () => {
    const { meta, variants } = harvestStory(DividerStory)
    expect(meta.title).toBe('Layout/Divider')
    expect(variants).toEqual(['Default'])
  })
})

describe('mountStoryVariant', () => {
  it('renders only the active variant', () => {
    const el = document.createElement('div')
    const app = mountStoryVariant(ButtonStory, 'Loading', el)
    expect(el.textContent).toContain('Saving')
    expect(el.textContent).not.toContain('Learn more')
    app.unmount()
  })

  it('switches content when remounted with another variant', () => {
    const el = document.createElement('div')
    let app = mountStoryVariant(ButtonStory, 'Primary', el)
    expect(el.textContent).toContain('Save changes')
    app.unmount()

    app = mountStoryVariant(ButtonStory, 'Ghost', el)
    expect(el.textContent).toContain('Learn more')
    expect(el.textContent).not.toContain('Save changes')
    app.unmount()
  })

  it('renders nothing for an unknown variant name', () => {
    const el = document.createElement('div')
    const app = mountStoryVariant(ButtonStory, 'Nonexistent', el)
    expect(el.textContent.trim()).toBe('')
    app.unmount()
  })
})
