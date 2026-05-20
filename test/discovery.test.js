import { once } from 'node:events'
import { rmSync } from 'node:fs'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { defaults } from '../src/config.js'
import { buildStoryTree, discoverStories, watchStories } from '../src/discovery.js'
import { cleanupTrees, makeTree, writeInto } from './util.js'

afterEach(cleanupTrees)

/**
 * @param {string} root
 * @param {string[]} [exclude]
 */
function configFor(root, exclude = []) {
  return {
    root,
    stories: [...defaults.stories],
    exclude: [...defaults.exclude, ...exclude],
  }
}

const STORY = '<script setup></script><template></template>'

describe('discoverStories', () => {
  it('finds story files of every supported format', async () => {
    const root = makeTree({
      'Button.story.vue': STORY,
      'Counter.story.js': 'export default {}',
      'Input.story.ts': 'export default {}',
    })
    const stories = await discoverStories(configFor(root))
    expect(stories.map((s) => s.name)).toEqual(['Button', 'Counter', 'Input'])
    expect(stories.map((s) => s.format)).toEqual(['vue', 'js', 'ts'])
  })

  it('ignores files that are not story files', async () => {
    const root = makeTree({
      'Button.story.vue': STORY,
      'Button.vue': STORY,
      'helpers.js': 'export default {}',
      'README.md': '# hello',
    })
    const stories = await discoverStories(configFor(root))
    expect(stories).toHaveLength(1)
    expect(stories[0].name).toBe('Button')
  })

  it('excludes node_modules by default', async () => {
    const root = makeTree({
      'Real.story.vue': STORY,
      'node_modules/pkg/Bad.story.vue': STORY,
    })
    const stories = await discoverStories(configFor(root))
    expect(stories.map((s) => s.name)).toEqual(['Real'])
  })

  it('honors custom exclude globs', async () => {
    const root = makeTree({
      'Keep.story.vue': STORY,
      'drafts/Skip.story.vue': STORY,
    })
    const stories = await discoverStories(configFor(root, ['**/drafts/**']))
    expect(stories.map((s) => s.name)).toEqual(['Keep'])
  })

  it('returns stories sorted by id with POSIX relative paths', async () => {
    const root = makeTree({
      'z/Last.story.vue': STORY,
      'a/First.story.vue': STORY,
    })
    const stories = await discoverStories(configFor(root))
    expect(stories.map((s) => s.relPath)).toEqual([
      'a/First.story.vue',
      'z/Last.story.vue',
    ])
    expect(stories[0].id).toBe('a/First.story.vue')
  })

  it('returns an empty array when nothing matches', async () => {
    const root = makeTree({ 'plain.txt': '' })
    expect(await discoverStories(configFor(root))).toEqual([])
  })
})

describe('buildStoryTree', () => {
  it('groups stories into folders by directory', () => {
    const tree = buildStoryTree([
      { relPath: 'forms/Button.story.vue', name: 'Button' },
      { relPath: 'forms/Input.story.vue', name: 'Input' },
      { relPath: 'Divider.story.vue', name: 'Divider' },
    ])
    expect(tree.map((n) => n.type)).toEqual(['folder', 'story'])
    const forms = tree[0]
    expect(forms.label).toBe('forms')
    expect(forms.children.map((n) => n.label)).toEqual(['Button', 'Input'])
  })

  it('nests folders to any depth', () => {
    const tree = buildStoryTree([
      { relPath: 'a/b/c/Deep.story.vue', name: 'Deep' },
    ])
    const story = tree[0].children[0].children[0].children[0]
    expect(story.type).toBe('story')
    expect(story.label).toBe('Deep')
  })

  it('sorts folders before stories, each group alphabetically', () => {
    const tree = buildStoryTree([
      { relPath: 'Zeta.story.vue', name: 'Zeta' },
      { relPath: 'widgets/W.story.vue', name: 'W' },
      { relPath: 'Alpha.story.vue', name: 'Alpha' },
    ])
    expect(tree.map((n) => n.type)).toEqual(['folder', 'story', 'story'])
    expect(tree.map((n) => n.label)).toEqual(['widgets', 'Alpha', 'Zeta'])
  })

  it('returns an empty array for no stories', () => {
    expect(buildStoryTree([])).toEqual([])
  })
})

describe('watchStories', () => {
  it('reports added, changed, and removed story files', async () => {
    const root = makeTree({ 'Existing.story.vue': STORY })
    const config = configFor(root)

    const events = []
    const watcher = watchStories(config, {
      onAdd: (s) => events.push(['add', s.relPath]),
      onChange: (s) => events.push(['change', s.relPath]),
      onRemove: (s) => events.push(['remove', s.relPath]),
    })

    const seen = (kind) =>
      events.some((e) => e[0] === kind && e[1] === 'New.story.vue')

    try {
      await once(watcher, 'ready')

      writeInto(root, 'New.story.vue', STORY)
      await waitFor(() => seen('add'))

      writeInto(root, 'New.story.vue', `${STORY}<!-- edit -->`)
      await waitFor(() => seen('change'))

      rmSync(join(root, 'New.story.vue'))
      await waitFor(() => seen('remove'))
    } finally {
      await watcher.close()
    }

    expect(events).toContainEqual(['add', 'New.story.vue'])
    expect(events).toContainEqual(['change', 'New.story.vue'])
    expect(events).toContainEqual(['remove', 'New.story.vue'])
  }, 15000)

  it('does not report non-story files', async () => {
    const root = makeTree({ 'Existing.story.vue': STORY })
    const events = []
    const watcher = watchStories(configFor(root), {
      onAdd: (s) => events.push(s.relPath),
    })

    try {
      await once(watcher, 'ready')
      writeInto(root, 'notes.txt', 'hello')
      writeInto(root, 'Trigger.story.vue', STORY)
      await waitFor(() => events.length > 0)
    } finally {
      await watcher.close()
    }

    expect(events).toEqual(['Trigger.story.vue'])
  }, 15000)
})

/**
 * @param {() => boolean} predicate
 * @param {number} [timeout]
 */
async function waitFor(predicate, timeout = 8000) {
  const start = Date.now()
  while (!predicate()) {
    if (Date.now() - start > timeout) throw new Error('waitFor timed out')
    await new Promise((resolve) => setTimeout(resolve, 25))
  }
}
