import { afterEach, describe, expect, it, vi } from 'vitest'
import { helpText, parseArgs, run, version } from '../src/cli.js'

describe('parseArgs', () => {
  it('treats the first positional as the command', () => {
    expect(parseArgs(['serve']).command).toBe('serve')
    expect(parseArgs([]).command).toBeUndefined()
  })

  it('parses a value flag given as separate tokens', () => {
    expect(parseArgs(['--config', 'a.js']).config).toBe('a.js')
  })

  it('parses a value flag given with an equals sign', () => {
    expect(parseArgs(['--config=a.js']).config).toBe('a.js')
  })

  it('resolves short aliases', () => {
    expect(parseArgs(['-c', 'a.js']).config).toBe('a.js')
    expect(parseArgs(['-h']).help).toBe(true)
    expect(parseArgs(['-v']).version).toBe(true)
  })

  it('parses the root flag', () => {
    expect(parseArgs(['--root', 'packages/ui']).root).toBe('packages/ui')
  })

  it('parses boolean and negated flags', () => {
    expect(parseArgs(['--open']).open).toBe(true)
    expect(parseArgs(['--no-open']).open).toBe(false)
  })

  it('keeps the command alongside its flags in any order', () => {
    const parsed = parseArgs(['serve', '--config', 'a.js'])
    expect(parsed.command).toBe('serve')
    expect(parsed.config).toBe('a.js')
  })

  it('collects arguments after a bare double dash', () => {
    expect(parseArgs(['serve', '--', '--raw']).command).toBe('serve')
    expect(parseArgs(['serve', '--', '--raw'])._).toContain('--raw')
  })

  it('throws when a value flag is missing its value', () => {
    expect(() => parseArgs(['--config'])).toThrow(/missing value/)
  })
})

describe('version', () => {
  it('is a non-empty string', () => {
    expect(typeof version).toBe('string')
    expect(version.length).toBeGreaterThan(0)
  })
})

describe('helpText', () => {
  it('documents usage and the serve command', () => {
    const text = helpText()
    expect(text).toMatch(/Usage/)
    expect(text).toMatch(/serve/)
    expect(text).toMatch(/--config/)
  })
})

describe('run', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    process.exitCode = 0
  })

  it('prints help for --help without an error code', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})
    await run(['--help'])
    expect(log).toHaveBeenCalled()
    expect(log.mock.calls[0][0]).toMatch(/Usage/)
    expect(process.exitCode).toBeFalsy()
  })

  it('prints the version for --version', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})
    await run(['--version'])
    expect(log).toHaveBeenCalledWith(version)
  })

  it('reports an error for an unknown command', async () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {})
    await run(['frobnicate'])
    expect(err.mock.calls[0][0]).toMatch(/unknown command/)
    expect(process.exitCode).toBe(1)
  })

  it('reports parse errors without throwing', async () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {})
    await run(['--config'])
    expect(err).toHaveBeenCalled()
    expect(process.exitCode).toBe(1)
  })
})
