// @vitest-environment jsdom
import { nextTick } from 'vue'
import { describe, expect, it } from 'vitest'
import ButtonStory from '../examples/forms/Button.story.vue'
import { coerceSeed, createControlState } from '../src/runtime/controls.js'
import { mountStoryVariant } from '../src/runtime/mount.js'

describe('coerceSeed', () => {
  it('treats a valueless attribute as true for toggles', () => {
    expect(coerceSeed('', 'toggle')).toBe(true)
  })

  it('passes a real boolean through for toggles', () => {
    expect(coerceSeed(false, 'toggle')).toBe(false)
  })

  it('coerces strings to numbers for number controls', () => {
    expect(coerceSeed('25', 'number')).toBe(25)
  })

  it('returns undefined for an unparseable number', () => {
    expect(coerceSeed('abc', 'number')).toBeUndefined()
  })
})

describe('control overrides', () => {
  it('discovers seed props and applies overrides to the subject', async () => {
    const el = document.createElement('div')
    const controls = createControlState()
    const app = mountStoryVariant(ButtonStory, 'Primary', el, { controls })
    await nextTick()

    expect(controls.seeds.value.variant).toBe('primary')
    expect(el.querySelector('button').className).toContain('btn-primary')

    controls.overrides.variant = 'ghost'
    await nextTick()
    expect(el.querySelector('button').className).toContain('btn-ghost')

    app.unmount()
  })

  it('falls back to the seed value when an override is removed', async () => {
    const el = document.createElement('div')
    const controls = createControlState()
    const app = mountStoryVariant(ButtonStory, 'Loading', el, { controls })
    await nextTick()

    controls.overrides.loading = false
    await nextTick()
    expect(el.querySelector('button').disabled).toBe(false)

    delete controls.overrides.loading
    await nextTick()
    expect(el.querySelector('button').disabled).toBe(true)

    app.unmount()
  })
})
