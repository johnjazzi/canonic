import { describe, it, expect, beforeEach } from 'vitest'
import { useDragDrop } from '../../src/composables/useDragDrop.js'

describe('useDragDrop composable', () => {
  let dd

  beforeEach(() => {
    dd = useDragDrop()
    dd.reset()
  })

  // State transitions
  it('starts with no dragging item or target', () => {
    expect(dd.draggingItem.value).toBeNull()
    expect(dd.dragTarget.value).toBeNull()
  })

  it('startDrag sets draggingItem', () => {
    dd.startDrag({ path: 'notes/foo.md', type: 'file' })
    expect(dd.draggingItem.value).toEqual({ path: 'notes/foo.md', type: 'file' })
  })

  it('endDrag clears both draggingItem and dragTarget', () => {
    dd.startDrag({ path: 'foo.md', type: 'file' })
    dd.setTarget('docs')
    dd.endDrag()
    expect(dd.draggingItem.value).toBeNull()
    expect(dd.dragTarget.value).toBeNull()
  })

  it('setTarget sets dragTarget', () => {
    dd.setTarget('projects')
    expect(dd.dragTarget.value).toBe('projects')
  })

  it('setTarget with empty string represents workspace root', () => {
    dd.setTarget('')
    expect(dd.dragTarget.value).toBe('')
  })

  it('clearTarget resets dragTarget to null', () => {
    dd.setTarget('docs')
    dd.clearTarget()
    expect(dd.dragTarget.value).toBeNull()
  })

  // AC4: same parent is a no-op
  it('canDrop returns false when dropping file into its current parent folder', () => {
    expect(dd.canDrop('notes/foo.md', 'notes')).toBe(false)
  })

  it('canDrop returns false when dropping root-level file onto root', () => {
    expect(dd.canDrop('foo.md', '')).toBe(false)
  })

  // AC5: prevent dropping folder onto itself or descendant
  it('canDrop returns false when dropping a folder onto itself', () => {
    expect(dd.canDrop('docs', 'docs')).toBe(false)
  })

  it('canDrop returns false when dropping a folder onto a direct descendant', () => {
    expect(dd.canDrop('docs', 'docs/archive')).toBe(false)
  })

  it('canDrop returns false when dropping a folder onto a deeply nested descendant', () => {
    expect(dd.canDrop('docs', 'docs/archive/2024')).toBe(false)
  })

  // Valid drops
  it('canDrop returns true for file moving to a different folder', () => {
    expect(dd.canDrop('notes/foo.md', 'docs')).toBe(true)
  })

  it('canDrop returns true for file moving to workspace root from a folder', () => {
    expect(dd.canDrop('notes/foo.md', '')).toBe(true)
  })

  it('canDrop returns true for folder moving into a sibling folder', () => {
    expect(dd.canDrop('archive', 'docs')).toBe(true)
  })

  it('canDrop returns true for folder moving to workspace root from a subfolder', () => {
    expect(dd.canDrop('docs/archive', '')).toBe(true)
  })

  // getNewPath helper
  it('getNewPath returns item name at root when targetDir is empty string', () => {
    expect(dd.getNewPath('notes/foo.md', '')).toBe('foo.md')
  })

  it('getNewPath places item inside target folder', () => {
    expect(dd.getNewPath('foo.md', 'docs')).toBe('docs/foo.md')
  })

  it('getNewPath works for nested source paths', () => {
    expect(dd.getNewPath('archive/2024/report.md', 'docs')).toBe('docs/report.md')
  })

  it('getNewPath works for folder moves', () => {
    expect(dd.getNewPath('archive', 'docs')).toBe('docs/archive')
  })
})
