import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'fs'
import os from 'os'
import path from 'path'

const tmpDir = path.join(os.tmpdir(), `canonic-search-test-${process.pid}`)
process.env.CANONIC_CONFIG_DIR = tmpDir

const search = await import('../../electron/search.js')

const WS = '/fake/workspace'

describe('search', () => {
  beforeEach(() => {
    fs.mkdirSync(tmpDir, { recursive: true })
    search.clearIndex?.()
  })

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  })

  it('returns empty results for unknown query', async () => {
    const results = await search.search('nonexistent', WS)
    expect(results).toEqual([])
  })

  it('indexes a document and finds it by keyword', async () => {
    await search.index(WS, 'vision/product-vision.md', '# Product Vision\n\nWe will dominate the market.')
    const results = await search.search('dominate', WS)
    expect(results.length).toBeGreaterThan(0)
    expect(results[0].filePath).toBe('vision/product-vision.md')
  })

  it('highlights matched terms in excerpt', async () => {
    await search.index(WS, 'notes.md', '# Notes\n\nThis is a remarkable idea.')
    const results = await search.search('remarkable', WS)
    expect(results[0].excerpt).toMatch(/<mark>/)
  })

  it('limits results to the queried workspace', async () => {
    await search.index(WS, 'doc.md', 'unique-canonic-term')
    const results = await search.search('unique-canonic-term', '/other/workspace')
    expect(results).toEqual([])
  })

  it('re-indexing a file replaces old content', async () => {
    await search.index(WS, 'doc.md', 'original content alpha')
    await search.index(WS, 'doc.md', 'updated content beta')
    const oldResults = await search.search('alpha', WS)
    const newResults = await search.search('beta', WS)
    expect(oldResults).toEqual([])
    expect(newResults.length).toBeGreaterThan(0)
  })
})
