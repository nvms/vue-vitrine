// @vitest-environment jsdom
import { nextTick } from 'vue'
import { describe, expect, it } from 'vitest'
import ButtonStory from '../examples/forms/Button.story.vue'
import Toast from '../examples/feedback/Toast.vue'
import {
  coerceSeed,
  createControlState,
  resolveControlValue,
  runtimeDefaults,
} from '../src/runtime/controls.js'
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

describe('runtimeDefaults', () => {
  it('reads default prop values from a component declaration', () => {
    const defaults = runtimeDefaults(Toast)
    expect(defaults.dismissible).toBe(true)
    expect(defaults.tone).toBe('info')
  })

  it('omits props that declare no default', () => {
    expect('message' in runtimeDefaults(Toast)).toBe(false)
  })
})

describe('resolveControlValue', () => {
  const toggle = { name: 'dismissible', control: { kind: 'toggle' } }

  it('prefers an explicit override', () => {
    const state = createControlState()
    state.overrides.dismissible = false
    expect(resolveControlValue(toggle, state, { dismissible: true })).toBe(false)
  })

  it('falls back to the literal seed value from the variant markup', () => {
    const state = createControlState()
    state.seeds.value = { dismissible: '' }
    expect(resolveControlValue(toggle, state, { dismissible: true })).toBe(true)
  })

  it('falls back to the component default with no override or seed', () => {
    const state = createControlState()
    expect(resolveControlValue(toggle, state, { dismissible: true })).toBe(true)
  })

  it('returns undefined when nothing is known', () => {
    expect(resolveControlValue(toggle, createControlState(), {})).toBeUndefined()
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
