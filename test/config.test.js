import { afterEach, describe, expect, it } from 'vitest'
import { defaults, loadConfig, resolveConfigFile } from '../src/config.js'
import { cleanupTrees, makeTree } from './util.js'

afterEach(cleanupTrees)

describe('loadConfig', () => {
  it('applies defaults when no config file exists', async () => {
    const root = makeTree({ 'placeholder.txt': '' })
    const config = await loadConfig({ root })

    expect(config.root).toBe(root)
    expect(config.configFile).toBeNull()
    expect(config.stories).toEqual(defaults.stories)
    expect(config.exclude).toEqual(defaults.exclude)
    expect(config.setupFile).toBeNull()
    expect(config.server).toEqual(defaults.server)
    expect(config.vite).toEqual({})
  })

  it('loads a vitrine.config.js file', async () => {
    const root = makeTree({
      'vitrine.config.js': `export default {
        stories: ['stories/**/*.story.vue'],
        server: { port: 7000 },
      }`,
    })
    const config = await loadConfig({ root })

    expect(config.configFile).toBe(`${root}/vitrine.config.js`)
    expect(config.stories).toEqual(['stories/**/*.story.vue'])
    expect(config.server.port).toBe(7000)
    expect(config.server.host).toBe(defaults.server.host)
  })

  it('normalizes a single glob string into an array', async () => {
    const root = makeTree({
      'vitrine.config.js': `export default { stories: 'src/**/*.story.js' }`,
    })
    const config = await loadConfig({ root })
    expect(config.stories).toEqual(['src/**/*.story.js'])
  })

  it('appends user excludes to the defaults', async () => {
    const root = makeTree({
      'vitrine.config.js': `export default { exclude: ['**/fixtures/**'] }`,
    })
    const config = await loadConfig({ root })
    expect(config.exclude).toEqual([...defaults.exclude, '**/fixtures/**'])
  })

  it('resolves setupFile to an absolute path', async () => {
    const root = makeTree({
      'vitrine.config.js': `export default { setupFile: './setup.js' }`,
    })
    const config = await loadConfig({ root })
    expect(config.setupFile).toBe(`${root}/setup.js`)
  })

  it('applies server overrides from CLI flags', async () => {
    const root = makeTree({
      'vitrine.config.js': `export default { server: { port: 7000 } }`,
    })
    const config = await loadConfig({
      root,
      overrides: { port: 9000, open: true },
    })
    expect(config.server.port).toBe(9000)
    expect(config.server.open).toBe(true)
  })

  it('loads an explicit config file outside the root conventions', async () => {
    const root = makeTree({
      'custom.config.js': `export default { server: { port: 8080 } }`,
    })
    const config = await loadConfig({ root, configFile: 'custom.config.js' })
    expect(config.server.port).toBe(8080)
  })

  it('throws when an explicit config file is missing', async () => {
    const root = makeTree({ 'placeholder.txt': '' })
    await expect(loadConfig({ root, configFile: 'nope.js' })).rejects.toThrow(
      /config file not found/,
    )
  })

  it('throws when a config file has no default export', async () => {
    const root = makeTree({
      'vitrine.config.js': `export const unused = 1`,
    })
    await expect(loadConfig({ root })).rejects.toThrow(/no default export/)
  })

  it('throws when a config file exports a non-object', async () => {
    const root = makeTree({
      'vitrine.config.js': `export default ['not', 'an', 'object']`,
    })
    await expect(loadConfig({ root })).rejects.toThrow(/must export an object/)
  })
})

describe('resolveConfigFile', () => {
  it('finds vitrine.config.mjs', () => {
    const root = makeTree({ 'vitrine.config.mjs': 'export default {}' })
    expect(resolveConfigFile(root)).toBe(`${root}/vitrine.config.mjs`)
  })

  it('returns null when no config file exists', () => {
    const root = makeTree({ 'placeholder.txt': '' })
    expect(resolveConfigFile(root)).toBeNull()
  })
})
