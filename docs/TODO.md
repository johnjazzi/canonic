# Canonic — Product TODO

---

## Bugs
- [x] **a bunch of stuff doesnt work.** fix it, make no mistakes. all the versioning and commit stuff. we version, commit, branch by document not by workspace. none of it is refreshing as i choose different documents.
- [x] **cant move files from directory to directory**
- [x] cant delete documents
- [x] **can't create directory**
- [x] **can't delete directory**
- [x] **cant change filename from title**
- [x] **Comment highlights not rendered in editor** — comments are stored and shown in CommentsPanel but the `anchor.quotedText` is never highlighted in the document. Need to apply ProseMirror decorations after `store.comments` loads: scan the doc for each `quotedText`, create a `Decoration.inline` highlight span, and update decorations when comments change or the file switches. Clicking a highlight should scroll the panel to the matching comment. *(Editor.vue + MilkdownEditor.vue — ProseMirror DecorationSet)*

---

## Features

- [x] **create branches or versions per doc** per-doc branch manifest; fork/merge scoped to individual documents; version tagging with named snapshots.
- [ ] **add a terminal** in the ui that lets you run cli commands for the workspace.
- [ ] **[AI AGENT] kick off claude code** be able start/continue claude code session with the changes you made to the doucment. i.e. hey I changed this requirements can you update the app to reflect it? 
- [x] **show commits** checkpoint commits per file with history panel; uncommitted/unsaved indicators; branch/merge shown in history; inline diff on click (changed lines only).
- [ ] **Usage logging** — explicitly turned off by default; user prompted at setup to opt-in/out. Track key interactions to improve UX.
- [ ] **Collapsible sidebar** — toggle button collapses left sidebar to icon-only strip (~40px); persist state in localStorage. *(MainLayout + FileTree, UI only)*
- [x] **Create directories** — "New folder" in FileTree header + inline in TreeNode; rename/delete/move all work on directory nodes. Soft-delete trash bin with restore + permanent delete.
- [x] **Move folders into other folders** — expand move functionality to support nesting directories within other directories.
- [x] **Drag and drop support** — make files and folders drag/droppable in the FileTree for intuitive reorganization.
- [ ] **Shared / connected documents in browser** — peer docs section with display name, last-synced timestamp, online/offline indicator; clicking opens read-only from `~/.canonic/peers/`; refresh triggers `git fetch`. *(PeersPanel + peer sync in share.js + mDNS in main.js)*
- [ ] **Sharing version radio** — when sharing a doc or workspace, let the user choose what the recipient sees: *Current WIP* (live file on disk), *Last committed* (HEAD of current branch), or *Main only* (always the `main` branch). Stored in `sharingDefaults` config and overridable per-share in ShareModal. *(ShareModal + share.js + config)*
- [ ] **Pre-index workspace docs on every AI call** — gather full text of every `.md` file, pass as `<workspace>` XML block in system prompt (~500 tokens/file, cap ~80k total). *(AIChat.vue — expand `docContext`)*
- [ ] **Agent reads docs on demand (tool use)** — expose `read_document` tool; input `{ "path": "..." }`; result fetched via `files:read` IPC. *(AIChat.vue tool-use loop)*
- [ ] **Agent web search** — `web_search` tool calling Brave/Tavily from main process; results quoted with source URLs; per-session toggle for privacy. *(electron/main.js + AIChat.vue tool-use loop)*
- [ ] **Agent inline insertions** — structured suggestion `{ type: "insert", afterLine: N, content: "..." }` rendered as ghost diff line; accept/dismiss. *(AIChat.vue + Editor.vue + store)*
- [ ] **Agent line change suggestions** — `{ type: "change", line: N, original: "...", suggested: "..." }` shown as inline diff; accept replaces line. *(AIChat.vue + Editor.vue diff overlay)*
- [ ] **Agent comments** — agent posts `{ type: "comment", anchor: { quotedText: "..." }, text: "..." }` into CommentsPanel attributed as "Claude · suggestion"; resolvable; not re-suggested once resolved. *(AIChat.vue + store.addComment() + CommentsPanel)*
- [ ] **Agent usage stats** — message count + token estimate (chars/4) in compact bar; warn near 80k; use real `usage` field from `message_stop` event long-term. *(AIChat.vue — partially done)*
- [ ] **Agent abilities UI** — "Agent tools" section in AI panel; toggle switches per capability; "Indexed N documents" status indicator. *(AIChat.vue + store)*

---

## Updates & Deployment
- [x] **Manual update check** — "Check for Updates" button in Settings > Profile.
- [x] **Periodic update checks** — Check every 4 hours while app is running.
- [x] **Ask before close** — Prompt to "Update and Close" if a download is ready.
- [x] **Interactive download** — Prompt user to start download when update is available (rather than always silent).
- [x] **Download progress** — Show progress bar/status in the update banner.

---

## Completed

- [x] Basic workspace setup + git backend (isomorphic-git)
- [x] PM Framework template
- [x] HAL2001 theme
- [x] AI chat (thinking partner, not content generator) routed through main process
- [x] Milkdown WYSIWYG editor
- [x] Lucide icons throughout
- [x] Settings modal with cleanup/uninstall
- [x] Auto-update via electron-updater (production builds)
- [x] GitHub repo at https://github.com/johnjazzi/canonic
- [x] Canonical logo in UI
- [x] Inline comments (selection + line-anchored) persisted to `~/.canonic/comments/`
- [x] Search with workspace isolation
- [x] Demo mode with config-driven peer data (`public/demo/config.json`)
- [x] Comprehensive test suite (unit + integration, 60 tests)
- [X] **[tech]** reffactor the /components so its not all flat. Put them in folders.
