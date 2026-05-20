import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'

const created = new Set()

/**
 * Create a temporary directory tree from a map of relative paths to file contents.
 *
 * @param {Record<string, string>} files
 * @returns {string} The absolute path to the temporary directory.
 */
export function makeTree(files) {
  const dir = mkdtempSync(join(tmpdir(), 'vitrine-test-'))
  created.add(dir)
  for (const [rel, content] of Object.entries(files)) {
    const abs = join(dir, rel)
    mkdirSync(dirname(abs), { recursive: true })
    writeFileSync(abs, content)
  }
  return dir
}

/**
 * Write a single file into an existing tree.
 *
 * @param {string} dir
 * @param {string} rel
 * @param {string} content
 * @returns {string} The absolute path written.
 */
export function writeInto(dir, rel, content) {
  const abs = join(dir, rel)
  mkdirSync(dirname(abs), { recursive: true })
  writeFileSync(abs, content)
  return abs
}

/** Remove every temporary directory created during the test run. */
export function cleanupTrees() {
  for (const dir of created) {
    rmSync(dir, { recursive: true, force: true })
  }
  created.clear()
}
