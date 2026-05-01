# Drag and Drop File Tree — Design Spec

**Date:** 2026-04-30
**Status:** Approved

## Overview

Add drag-and-drop support to the file tree so users can move files and folders by dragging them onto a target folder or the workspace root. Reordering within a folder is out of scope — sort order stays alphabetical.

## State

A new composable `src/composables/useDragDrop.js` exposes two refs shared across all `TreeNode` instances and `FileTree`:

- `draggingItem` — `{ path, type }` of the item currently being dragged; `null` when idle
- `dragTarget` — path string of the folder being hovered as a drop target; `""` (empty string) means workspace root; `null` means no valid target is active

Both refs reset to `null`/`null` on drop or `dragend`.

## TreeNode Changes

**Drag source:**
- Add `draggable="true"` to the `.tree-node` div
- `dragstart`: set `draggingItem = { path: item.path, type: item.type }`. If the item is a folder, prevent dropping it into any of its own descendants (checked by testing whether `dragTarget` starts with `item.path + "/"`).
- `dragend`: clear both `draggingItem` and `dragTarget`

**Drop target (folders only):**
- `dragover`: if `item.type === 'directory'` and a drag is active, set `dragTarget = item.path` and call `e.preventDefault()` to signal a valid drop
- `dragleave`: clear `dragTarget` — guarded so it only clears when leaving the node itself, not when entering a child element (use `relatedTarget` check)
- `drop`: execute the move (see Move Logic), then clear state

**No-ops:**
- Dropping onto the item's current parent directory
- Dropping a folder onto itself or any of its descendants

## FileTree Changes

- The `.tree-body` div gets `dragover` and `drop` handlers
- `dragover`: if a drag is active and the event target is the tree-body itself (not a child node), set `dragTarget = ""` and call `e.preventDefault()`
- `drop`: execute move to workspace root, clear state
- Visual: `.tree-body` gets a CSS highlight class when `dragTarget === ""`

## Move Logic

| Item type | Call |
|-----------|------|
| File | `store.moveFile(item.path, targetDir)` (existing store action) |
| Directory | `window.canonic.files.move(workspacePath, oldPath, newPath)` then `store.refreshFiles()` |

`targetDir` is `dragTarget` (the drop target folder path, or `""` for root). The new path for a directory drop is `targetDir ? targetDir + "/" + item.name : item.name`.

## Visual Feedback

- Hovered folder node: CSS class `.drag-over` applied when `dragTarget === item.path` — subtle background highlight distinct from normal hover
- Root drop zone: `.tree-body` gets `.drag-over-root` class when `dragTarget === ""`
- The node being dragged gets `.dragging` class (reduced opacity) via `draggingItem?.path === item.path`
- No custom drag ghost — browser default is fine

## Error Handling

Move failures (e.g. name collision) surface via the existing store error flow. No special DnD-specific error UI needed.

## Acceptance Criteria

1. A file dragged onto a folder moves into that folder
2. A folder dragged onto another folder becomes a child of the target
3. A file or folder dragged to the root drop zone (empty tree-body area) moves to workspace root
4. Dropping onto the item's current parent is a no-op
5. Dropping a folder onto itself or any of its own descendants is prevented
6. The dragged node shows reduced opacity while dragging
7. Hovering over a valid folder target highlights that folder
8. Hovering over the root drop zone highlights the tree-body
9. After a drop the tree refreshes and shows the item in its new location
10. If a move fails the tree stays unchanged

## Out of Scope

- Reordering within a folder (alphabetical sort stays)
- Multi-select drag
- Drag from outside the app (OS file drop)
- Future: sort by last updated date (tracked separately)
