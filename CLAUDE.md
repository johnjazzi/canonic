# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start Electron app in development (Vite + Electron concurrently)
npm run build        # Production build → dist-electron/
npm test             # Run test suite (Vitest)
npm run test:watch   # Watch mode
```

Tests live in `tests/`. Run a single test file: `npx vitest run tests/git.test.js`.

## Architecture

**Two-process Electron app.** The renderer (Vue 3/Vite in `src/`) communicates with the main process (`electron/`) exclusively via IPC — the `window.canonic` object injected by `electron/preload.js`. Never import Electron APIs directly in `src/`.

**Git is the storage backend.** Every workspace is a bare git repo on disk. `electron/git.js` wraps `isomorphic-git` (pure JS, no git binary). All versioning — commits, branches, merge, diff, log — goes through this module. Documents are `.md` files; the `.canonic/` sidecar directory holds comments and named versions outside git history.

**State lives in Pinia (`src/store/index.js`).** One flat store. Key state groups:
- Workspace: `workspacePath`, `files`, `currentFile`, `currentContent`, `isDirty`
- Git: `commitLog`, `branches`, `currentBranch`, `docVersions`
- Collaboration: `comments`, `shareInfo`, `peers`
- UI: `sidebarTab`, `rightPanelTab`, `isDemoMode`

All async operations (file I/O, git, comments) are store actions that call `window.canonic.*` IPC handlers.

**Component layout:**
- `src/components/layout/` — shell (MainLayout, SetupScreen, BranchMenu)
- `src/components/editor/` — Milkdown WYSIWYG editor + comment highlight decorations
- `src/components/panels/` — right panel tabs: CommentsPanel, AIChat, HistoryPanel
- `src/components/sidebar/` — left panel: FileTree, PeersPanel, SearchPanel
- `srctml/components/modals/` — CommitModal, SaveVersionModal, ForkDocModal, ShareModal, etc.

**IPC surface (preload.js → main.js handlers):**
- `files:list/read/write/delete/newDoc` — workspace file operations
- `git:init/commit/log/diff/branches/checkout/createBranch/merge/readCommit` — all git ops
- `versions:list/save/delete` — named version snapshots (`.canonic/versions.json`)
- `comments:get/save` — comment persistence (`.canonic/comments/<docId>.json`)
- `share:start/stop` — Cloudflare tunnel via bundled `cloudflared`
- `search:index/query` — FlexSearch full-text index (in-memory, re-indexed on open/save)
- `ai:chat` — streams Claude API responses from main process (keeps API key out of renderer)
- `config:read/write` — user config at `~/.canonic/config.json`

**Demo mode** (`store.enableDemoMode()`): loads `public/demo/config.json`, opens a workspace using a named template, injects mock peer data and comments into the store. The demo config drives which template creates the workspace files and which quoted-text anchors get demo comments.

**Sharing** uses a bundled `cloudflared` binary (in `electron/resources/`) to open a Cloudflare Tunnel. Token auth validates recipients. Local network sharing uses mDNS.

**AI sidebar** streams from Claude API via `ai:chat` IPC. The system prompt is tuned to ask questions and challenge assumptions rather than write content. Document context is passed on every message.

## Key conventions

- Versions and commits are **per-document**, not per-workspace. `commitLog` and `docVersions` always reflect the currently open file.
- Comments use `anchor.quotedText` (selection) or `anchor.lineNumber` (line) — the quotedText anchor survives minor edits and is used for ProseMirror decoration matching.
- `isDirty` is set by the editor on any content change and cleared on save or file switch. Auto-save fires after 30 seconds of dirtiness.
- Branch names must pass git's naming rules (no spaces, no `~^:?*[\\`). Validation is in `ForkDocModal.vue`.
