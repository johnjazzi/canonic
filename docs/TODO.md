# Canonic — Product TODO

---

## Bugs

- [x] **Comment highlights not rendered in editor** — comments are stored and shown in CommentsPanel but the `anchor.quotedText` is never highlighted in the document. Need to apply ProseMirror decorations after `store.comments` loads: scan the doc for each `quotedText`, create a `Decoration.inline` highlight span, and update decorations when comments change or the file switches. Clicking a highlight should scroll the panel to the matching comment. *(Editor.vue + MilkdownEditor.vue — ProseMirror DecorationSet)*

---

## Features
- [ ] **add logo to electron app**  
- [ ] **[tech]** reffactor the /components so its not all flat. Put them in folders.
- [ ] **show commits** we want to be able to make checkpoint commits per file. maybe its already doing that idk. need to definitely show that there is uncommited changes. 
- [ ] **Collapsible sidebar** — toggle button collapses left sidebar to icon-only strip (~40px); persist state in localStorage. *(MainLayout + FileTree, UI only)*
- [ ] **Create directories** — "New folder" option in FileTree "+" menu; writes `.gitkeep`; rename works on directory nodes. *(FileTree + TreeNode + `files:mkdir` IPC)*
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
