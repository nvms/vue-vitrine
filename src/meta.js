import * as vueComponentMeta from 'vue-component-meta'

const createCheckerByJson =
  vueComponentMeta.createCheckerByJson ??
  vueComponentMeta.default?.createCheckerByJson

/**
 * A control descriptor derived from a component's prop metadata.
 *
 * @typedef {object} ControlDescriptor
 * @property {string} name Prop name.
 * @property {string} type Human-readable type string.
 * @property {boolean} required
 * @property {string} [default] Default value as source text.
 * @property {string} description JSDoc description, empty when absent.
 * @property {ControlKind} control The widget to render.
 */

/**
 * @typedef {object} ControlKind
 * @property {'toggle'|'number'|'text'|'select'|'json'} kind
 * @property {string[]} [options] Allowed values, present when kind is 'select'.
 */

/**
 * @typedef {object} MetaService
 * @property {(file: string) => { props: ControlDescriptor[] }} describe
 * @property {() => void} invalidate
 */

/**
 * Create a metadata service backed by a single reused `vue-component-meta`
 * checker. The checker is built lazily on first use because constructing it
 * starts a TypeScript program, which is slow.
 *
 * @param {string} root Absolute project root, used to resolve types.
 * @returns {{ describe: (file: string) => { props: ControlDescriptor[] }, invalidate: () => void }}
 */
export function createMetaService(root) {
  let checker = null

  function getChecker() {
    if (!checker) {
      checker = createCheckerByJson(
        root,
        {
          include: ['**/*'],
          compilerOptions: {
            allowJs: true,
            checkJs: true,
            jsx: 'preserve',
            module: 'esnext',
            moduleResolution: 'bundler',
            target: 'esnext',
            strict: true,
            noEmit: true,
            skipLibCheck: true,
          },
          vueCompilerOptions: { target: 3.5 },
        },
        { schema: true },
      )
    }
    return checker
  }

  return {
    describe(file) {
      const meta = getChecker().getComponentMeta(file)
      const props = meta.props
        .filter((prop) => !prop.global)
        .map(toDescriptor)
      return { props }
    },
    invalidate() {
      if (checker) checker.clearCache()
    },
  }
}

/**
 * @param {object} prop A `vue-component-meta` PropertyMeta.
 * @returns {ControlDescriptor}
 */
function toDescriptor(prop) {
  return {
    name: prop.name,
    type: prop.type,
    required: prop.required,
    default: prop.default,
    description: prop.description ?? '',
    control: controlFor(prop.schema),
  }
}

/**
 * Map a `vue-component-meta` property schema to a control widget.
 *
 * Optional props wrap their real schema in an `enum` that includes
 * `undefined`, so that wrapper is unwrapped before the schema is classified.
 *
 * @param {*} schema A PropertyMetaSchema.
 * @returns {ControlKind}
 */
export function controlFor(schema) {
  let node = schema

  if (isEnum(node)) {
    const literals = enumStringValues(node)
    if (literals) return { kind: 'select', options: literals }

    const real = node.schema.filter((member) => !isNullish(member))
    if (real.length > 0 && real.every(isBooleanLiteral)) return { kind: 'toggle' }
    if (real.length === 1 && real[0] === 'number') return { kind: 'number' }
    if (real.length === 1 && real[0] === 'string') return { kind: 'text' }
    if (real.length === 1 && typeof real[0] === 'object') {
      node = real[0]
    } else {
      return { kind: 'json' }
    }
  }

  if (typeof node === 'string') {
    if (node === 'boolean') return { kind: 'toggle' }
    if (node === 'number') return { kind: 'number' }
    if (node === 'string') return { kind: 'text' }
    return { kind: 'json' }
  }

  return { kind: 'json' }
}

/**
 * @param {*} node
 * @returns {boolean}
 */
function isEnum(node) {
  return (
    typeof node === 'object' &&
    node !== null &&
    node.kind === 'enum' &&
    Array.isArray(node.schema)
  )
}

/**
 * Extract the string-literal members of an enum schema, or null when the
 * schema is not a pure union of string literals.
 *
 * @param {*} node An enum schema node.
 * @returns {string[]|null}
 */
function enumStringValues(node) {
  const values = []
  for (const member of node.schema) {
    if (typeof member !== 'string') return null
    if (isNullish(member)) continue
    const literal = member.match(/^"(.*)"$/) ?? member.match(/^'(.*)'$/)
    if (!literal) return null
    values.push(literal[1])
  }
  return values.length > 0 ? values : null
}

/**
 * @param {*} member
 * @returns {boolean}
 */
function isNullish(member) {
  return member === 'undefined' || member === 'null'
}

/**
 * @param {*} member
 * @returns {boolean}
 */
function isBooleanLiteral(member) {
  return member === 'true' || member === 'false'
}
