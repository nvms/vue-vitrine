import { cloneVNode, isVNode, reactive, ref } from 'vue'

/**
 * Per-variant control state, shared between the controls panel (in the host
 * app) and the `Variant` component (in the canvas's per-variant app).
 *
 * @typedef {object} ControlState
 * @property {Record<string, unknown>} overrides Reactive prop overrides, written by the panel.
 * @property {import('vue').Ref<Record<string, unknown>>} seeds Literal props discovered on the subject.
 * @property {(seed: Record<string, unknown>) => void} reportSeed
 */

/**
 * Create a fresh control state for one variant.
 *
 * @returns {ControlState}
 */
export function createControlState() {
  const overrides = reactive({})
  const seeds = ref({})
  return {
    overrides,
    seeds,
    reportSeed(seed) {
      if (!shallowEqual(seeds.value, seed)) seeds.value = seed
    },
  }
}

/**
 * @param {Record<string, unknown>} a
 * @param {Record<string, unknown>} b
 * @returns {boolean}
 */
function shallowEqual(a, b) {
  const keysA = Object.keys(a)
  const keysB = Object.keys(b)
  if (keysA.length !== keysB.length) return false
  return keysA.every((key) => a[key] === b[key])
}

/**
 * Walk a variant's rendered vnodes and merge control overrides onto every
 * vnode whose type is the subject component. The literal props on the first
 * subject vnode are reported back as the seed values.
 *
 * @param {*} children The vnodes returned by a variant's default slot.
 * @param {import('vue').Component} subject The component under test.
 * @param {Record<string, unknown>} overrides Props to merge onto the subject.
 * @param {(seed: Record<string, unknown>) => void} reportSeed
 * @returns {*} The transformed vnodes.
 */
export function applyControls(children, subject, overrides, reportSeed) {
  const state = { seeded: false }
  return mapNodes(children, subject, overrides, reportSeed, state)
}

/**
 * @param {*} node
 * @param {import('vue').Component} subject
 * @param {Record<string, unknown>} overrides
 * @param {(seed: Record<string, unknown>) => void} reportSeed
 * @param {{ seeded: boolean }} state
 * @returns {*}
 */
function mapNodes(node, subject, overrides, reportSeed, state) {
  if (Array.isArray(node)) {
    return node.map((child) =>
      mapNodes(child, subject, overrides, reportSeed, state),
    )
  }
  if (!isVNode(node)) return node

  if (node.type === subject) {
    if (!state.seeded) {
      state.seeded = true
      reportSeed({ ...(node.props ?? {}) })
    }
    return cloneVNode(node, overrides)
  }

  if (Array.isArray(node.children)) {
    const mapped = mapNodes(
      node.children,
      subject,
      overrides,
      reportSeed,
      state,
    )
    return cloneVNode(node, null, mapped)
  }

  return node
}

/**
 * Coerce a raw literal prop value (read from a vnode) into the value a control
 * widget expects.
 *
 * @param {unknown} value
 * @param {'toggle'|'number'|'text'|'select'|'json'} kind
 * @returns {unknown}
 */
export function coerceSeed(value, kind) {
  if (kind === 'toggle') {
    if (value === '' || value === true || value === 'true') return true
    if (value === false || value === 'false') return false
    return Boolean(value)
  }
  if (kind === 'number') {
    const number = typeof value === 'number' ? value : Number(value)
    return Number.isNaN(number) ? undefined : number
  }
  if (kind === 'text' || kind === 'select') {
    return value == null ? undefined : String(value)
  }
  return value
}
