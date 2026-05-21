import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { controlFor, createMetaService } from '../src/meta.js'

const root = fileURLToPath(new URL('..', import.meta.url))

describe('controlFor', () => {
  it('maps a string-literal union to a select', () => {
    expect(
      controlFor({ kind: 'enum', type: '...', schema: ['"a"', '"b"', '"c"'] }),
    ).toEqual({ kind: 'select', options: ['a', 'b', 'c'] })
  })

  it('unwraps the optional undefined before classifying', () => {
    expect(
      controlFor({ kind: 'enum', type: '...', schema: ['undefined', '"a"', '"b"'] }),
    ).toEqual({ kind: 'select', options: ['a', 'b'] })
  })

  it('maps an optional boolean to a toggle', () => {
    expect(
      controlFor({ kind: 'enum', schema: ['undefined', 'false', 'true'] }),
    ).toEqual({ kind: 'toggle' })
  })

  it('maps an optional number to a number control', () => {
    expect(controlFor({ kind: 'enum', schema: ['undefined', 'number'] })).toEqual({
      kind: 'number',
    })
  })

  it('maps a bare string schema to a text control', () => {
    expect(controlFor('string')).toEqual({ kind: 'text' })
  })

  it('maps an object schema to a json control', () => {
    expect(controlFor({ kind: 'object', type: '{}', schema: {} })).toEqual({
      kind: 'json',
    })
  })
})

describe('createMetaService', () => {
  it('extracts select options and descriptions from a TypeScript component', () => {
    const service = createMetaService(root)
    const { props } = service.describe(`${root}examples/forms/Button.vue`)

    const variant = props.find((prop) => prop.name === 'variant')
    expect(variant.control).toEqual({
      kind: 'select',
      options: ['primary', 'secondary', 'ghost'],
    })
    expect(variant.description).toBe('Visual style of the button.')

    const disabled = props.find((prop) => prop.name === 'disabled')
    expect(disabled.control.kind).toBe('toggle')
  }, 30000)
})
