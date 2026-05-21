import { describe, expect, it } from 'vitest'
import { buildTitleTree } from '../src/runtime/tree.js'

/**
 * @param {string} id
 * @param {string} title
 * @param {string[]} [variants]
 */
function record(id, title, variants = ['Default']) {
  return { id, name: id, title, variants }
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
    expect(forms.children.every((node) => node.type === 'story')).toBe(true)
  })

  it('gives a story its variants as children', () => {
    const tree = buildTitleTree([
      record('a', 'Forms/Button', ['Primary', 'Ghost', 'Loading']),
    ])
    const story = tree[0].children[0]
    expect(story.type).toBe('story')
    expect(story.single).toBe(false)
    expect(story.children.map((node) => node.label)).toEqual([
      'Primary',
      'Ghost',
      'Loading',
    ])
    expect(story.children[0]).toMatchObject({
      type: 'variant',
      storyId: 'a',
      variant: 'Primary',
    })
  })

  it('marks a story with one variant as single', () => {
    const tree = buildTitleTree([record('a', 'Layout/Divider', ['Default'])])
    expect(tree[0].children[0].single).toBe(true)
  })

  it('keeps variant order, never sorting it', () => {
    const tree = buildTitleTree([record('a', 'Set/X', ['Zeta', 'Alpha'])])
    expect(tree[0].children[0].children.map((node) => node.label)).toEqual([
      'Zeta',
      'Alpha',
    ])
  })

  it('nests folders to any depth', () => {
    const tree = buildTitleTree([record('x', 'a/b/c/Deep')])
    const story = tree[0].children[0].children[0].children[0]
    expect(story.type).toBe('story')
    expect(story.label).toBe('Deep')
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
    const tree = buildTitleTree([
      { id: 'p', name: 'Loose', title: '', variants: ['Default'] },
    ])
    expect(tree[0].type).toBe('story')
    expect(tree[0].label).toBe('Loose')
  })
})
