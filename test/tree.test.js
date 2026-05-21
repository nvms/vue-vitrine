import { describe, expect, it } from 'vitest'
import { buildTitleTree } from '../src/runtime/tree.js'

/**
 * @param {string} id
 * @param {string} title
 */
function record(id, title) {
  return { id, name: id, title }
}

describe('buildTitleTree', () => {
  it('groups records by their slash-delimited title', () => {
    const tree = buildTitleTree([
      record('a', 'Forms/Button'),
      record('b', 'Forms/Input'),
      record('c', 'Feedback/Toast'),
    ])
    expect(tree.map((node) => node.label)).toEqual(['Feedback', 'Forms'])
    const forms = tree.find((node) => node.label === 'Forms')
    expect(forms.children.map((node) => node.label)).toEqual(['Button', 'Input'])
  })

  it('nests folders to any depth', () => {
    const tree = buildTitleTree([record('x', 'a/b/c/Deep')])
    const leaf = tree[0].children[0].children[0].children[0]
    expect(leaf.type).toBe('story')
    expect(leaf.label).toBe('Deep')
    expect(leaf.id).toBe('x')
  })

  it('sorts folders before stories, each group alphabetically', () => {
    const tree = buildTitleTree([
      record('1', 'Zeta'),
      record('2', 'Widgets/Thing'),
      record('3', 'Alpha'),
    ])
    expect(tree.map((node) => node.type)).toEqual(['folder', 'story', 'story'])
    expect(tree.map((node) => node.label)).toEqual(['Widgets', 'Alpha', 'Zeta'])
  })

  it('falls back to the record name for an empty title', () => {
    const tree = buildTitleTree([{ id: 'p', name: 'Loose', title: '' }])
    expect(tree[0].type).toBe('story')
    expect(tree[0].label).toBe('Loose')
  })
})
