# Tests

## Structure

```
tests/
├── unit/
│   ├── config.test.js        — config read/write/validate (electron/config.js)
│   ├── git.test.js           — isomorphic-git wrapper (electron/git.js)
│   └── search.test.js        — inverted-index search (electron/search.js)
└── integration/
    ├── setup.test.js         — first-run setup flow: loadConfig, saveConfig, openWorkspace
    ├── documents.test.js     — CRUD documents, branch ops, commit + log via Pinia store
    ├── directories.test.js   — CRUD directories with real disk writes
    ├── ai-agent.test.js      — AI IPC bridge: streaming, toolbox (read_document, comment, search)
    └── comments.test.js      — comment store actions + IPC serialization
```

## Running

```bash
npm test                # run all tests once
npm run test:watch      # re-run on file change
npm run test:coverage   # coverage report (lcov + text)
```

## What's tested

| Area | File | Key assertions |
|---|---|---|
| Config | `unit/config.test.js` | defaults, read/write round-trip, validation rules (displayName required, apiKey optional) |
| Git | `unit/git.test.js` | workspace init, PM framework folder structure, commit + log, branch create + checkout |
| Search | `unit/search.test.js` | empty results, keyword match, excerpt highlighting, workspace isolation, re-index replaces |
| Setup flow | `integration/setup.test.js` | loadConfig null on first-run, saveConfig round-trip, openWorkspace lifecycle, error propagation, IPC payload serialization |
| Document CRUD | `integration/documents.test.js` | createFile, openFile, saveFile, renameFile, commitFile, branch create + checkout via store |
| Directory CRUD | `integration/directories.test.js` | mkdir on disk, .gitkeep, nested file write, newDoc in subdirectory, delete, list nested |
| AI agent | `integration/ai-agent.test.js` | chat() call shape, onChunk accumulation, onDone/onError, removeListeners order, streaming rebuild, read_document tool, agent comment IPC, no-key guard |
| Comments | `integration/comments.test.js` | addComment persists, resolveComment marks resolved, deleteComment removes, IPC data is plain JSON (no Proxy) |

## Adding tests

- Unit tests for Electron main-process modules go in `tests/unit/`.
- Tests that exercise the Pinia store (with a mocked `window.canonic` IPC bridge) go in `tests/integration/`.
- Do not import Electron (`electron`, `ipcRenderer`) directly in tests — mock the `window.canonic` bridge instead.
- Directory tests that need real disk I/O should use `os.tmpdir()` and clean up in `afterEach`.
