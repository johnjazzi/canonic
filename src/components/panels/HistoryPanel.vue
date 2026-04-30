<template>
  <div class="history-panel">

    <!-- Named versions -->
    <div v-if="store.docVersions.length" class="versions-section">
      <div class="section-label">
        <Tag :size="11" />
        Versions
      </div>
      <div
        v-for="v in store.docVersions"
        :key="v.name"
        class="version-item"
      >
        <div class="version-info">
          <span class="version-name">{{ v.name }}</span>
          <span v-if="v.message" class="version-note">{{ v.message }}</span>
          <div class="version-meta">
            <code class="version-oid">{{ v.oid.slice(0, 7) }}</code>
            <span class="version-time">{{ formatTime(v.createdAt) }}</span>
          </div>
        </div>
        <div class="version-actions">
          <button class="v-btn" @click="restore(v)" title="Restore this version">Restore</button>
          <button class="v-btn v-btn-danger" @click="deleteVersion(v.name)" title="Delete version">✕</button>
        </div>
      </div>
    </div>

    <!-- Commit history -->
    <div class="section-label commits-label" v-if="store.commitLog.length || store.docVersions.length">
      <GitCommitHorizontal :size="11" />
      Commits
    </div>

    <div class="history-list" v-if="store.commitLog.length > 0">
      <div
        v-for="commit in store.commitLog"
        :key="commit.oid"
        class="commit-item"
        @click="viewCommit(commit)"
        :class="{ viewing: viewingOid === commit.oid }"
      >
        <div class="commit-dot" />
        <div class="commit-info">
          <p class="commit-message">{{ commit.message }}</p>
          <div class="commit-meta">
            <span class="commit-author">{{ commit.author }}</span>
            <span class="commit-time">{{ formatTime(commit.timestamp) }}</span>
          </div>
          <code class="commit-oid">{{ commit.oid.slice(0, 7) }}</code>
          <span
            v-if="versionsByOid[commit.oid]"
            class="commit-version-badge"
            :title="versionsByOid[commit.oid].message"
          >{{ versionsByOid[commit.oid].name }}</span>
        </div>
      </div>
    </div>

    <div v-else-if="!store.docVersions.length" class="empty-history">
      <p>No commits yet.</p>
      <p class="hint">Use the commit button to save checkpoints in your document's history.</p>
    </div>

    <!-- Diff view -->
    <div v-if="diffContent" class="diff-view">
      <div class="diff-header">
        <span>Changes since {{ viewingOid?.slice(0, 7) }}</span>
        <button class="close-btn" @click="diffContent = null">✕</button>
      </div>
      <pre class="diff-content">{{ diffContent }}</pre>
    </div>

    <!-- Restore confirm -->
    <div v-if="restoreConfirm" class="restore-overlay">
      <div class="restore-box">
        <p>Restore <strong>{{ restoreConfirm.name }}</strong>?</p>
        <p class="restore-hint">This will load the document content from that version. Unsaved changes will be lost.</p>
        <div class="restore-actions">
          <button class="btn-ghost" @click="restoreConfirm = null">Cancel</button>
          <button class="btn-restore" @click="confirmRestore">Restore</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAppStore } from '../../store'
import { Tag, GitCommitHorizontal } from 'lucide-vue-next'

const store = useAppStore()
const viewingOid = ref(null)
const diffContent = ref(null)
const restoreConfirm = ref(null)

// Map oid → version so we can badge commits that have a named version
const versionsByOid = computed(() => {
  const map = {}
  for (const v of store.docVersions) {
    if (!map[v.oid]) map[v.oid] = v
  }
  return map
})

function formatTime(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

async function viewCommit(commit) {
  if (viewingOid.value === commit.oid) {
    viewingOid.value = null
    diffContent.value = null
    return
  }
  viewingOid.value = commit.oid
  const result = await window.canonic.git.diff(store.workspacePath, store.currentFile, commit.oid)
  if (result) diffContent.value = generateDiff(result.before, result.after)
}

function generateDiff(before, after) {
  const bl = before.split('\n')
  const al = after.split('\n')
  const lines = []
  const max = Math.max(bl.length, al.length)
  for (let i = 0; i < max; i++) {
    const b = bl[i], a = al[i]
    if (b === a) { lines.push('  ' + (b ?? '')) }
    else {
      if (b !== undefined) lines.push('- ' + b)
      if (a !== undefined) lines.push('+ ' + a)
    }
  }
  return lines.join('\n')
}

function restore(version) {
  restoreConfirm.value = version
}

async function confirmRestore() {
  if (!restoreConfirm.value) return
  await store.restoreDocVersion(restoreConfirm.value.oid)
  restoreConfirm.value = null
}

async function deleteVersion(name) {
  await store.deleteDocVersion(name)
}
</script>

<style scoped>
.history-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.section-label {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 12px 4px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  flex-shrink: 0;
}

.commits-label { padding-top: 10px; border-top: 1px solid var(--border); }

/* Versions */
.versions-section {
  flex-shrink: 0;
  border-bottom: 1px solid var(--border);
  padding-bottom: 6px;
}

.version-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 6px 12px;
  transition: background 0.12s;
}

.version-item:hover { background: var(--bg-hover); }

.version-info { flex: 1; min-width: 0; }

.version-name {
  display: inline-block;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text-primary);
  background: var(--bg-hover);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 1px 7px;
  margin-bottom: 3px;
}

.version-note {
  display: block;
  font-size: 0.775rem;
  color: var(--text-secondary);
  margin-bottom: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.version-meta {
  display: flex;
  gap: 6px;
  align-items: center;
}

.version-oid {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.7rem;
  color: var(--accent);
  background: var(--bg-surface);
  padding: 1px 4px;
  border-radius: 3px;
}

.version-time {
  font-size: 0.7rem;
  color: var(--text-muted);
}

.version-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 0.12s;
}

.version-item:hover .version-actions { opacity: 1; }

.v-btn {
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 4px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  transition: background 0.12s, color 0.12s;
}

.v-btn:hover { background: var(--bg-active); color: var(--text-primary); }
.v-btn-danger:hover { background: rgba(239,68,68,0.15); color: #f87171; border-color: rgba(239,68,68,0.3); }

/* Commits */
.history-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.commit-item {
  display: flex;
  gap: 10px;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s;
  position: relative;
}

.commit-item:hover { background: var(--bg-hover); }
.commit-item.viewing { background: var(--bg-active); }

.commit-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent);
  margin-top: 5px;
  flex-shrink: 0;
}

.commit-info { flex: 1; }

.commit-message {
  font-size: 0.8375rem;
  color: var(--text-primary);
  margin: 0 0 4px;
  font-weight: 500;
}

.commit-meta {
  display: flex;
  gap: 8px;
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-bottom: 4px;
}

.commit-oid {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.7rem;
  color: var(--text-muted);
  background: var(--bg-surface);
  padding: 1px 4px;
  border-radius: 3px;
}

.commit-version-badge {
  margin-left: 6px;
  font-size: 0.7rem;
  background: rgba(74, 122, 155, 0.2);
  color: var(--accent);
  border: 1px solid var(--accent-muted);
  padding: 1px 6px;
  border-radius: 10px;
}

.empty-history {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 24px;
  color: var(--text-muted);
  font-size: 0.875rem;
  gap: 4px;
}

.hint { font-size: 0.8rem; opacity: 0.7; }

/* Diff */
.diff-view {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--bg-base);
  border-top: 1px solid var(--border);
  max-height: 50%;
  display: flex;
  flex-direction: column;
}

.diff-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  font-size: 0.8rem;
  color: var(--text-muted);
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.close-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 0.875rem;
}

.diff-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px 12px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
  line-height: 1.6;
  color: var(--text-secondary);
  white-space: pre-wrap;
  word-break: break-all;
}

/* Restore confirm overlay */
.restore-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  z-index: 10;
}

.restore-box {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 20px;
  width: 100%;
  max-width: 260px;
}

.restore-box p {
  font-size: 0.875rem;
  color: var(--text-primary);
  margin: 0 0 8px;
}

.restore-hint {
  font-size: 0.775rem;
  color: var(--text-muted);
  line-height: 1.4;
}

.restore-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 16px;
}

.btn-ghost {
  padding: 6px 14px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.8125rem;
  cursor: pointer;
}

.btn-ghost:hover { background: var(--bg-hover); }

.btn-restore {
  padding: 6px 14px;
  border-radius: 6px;
  border: none;
  background: var(--accent);
  color: white;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
}

.btn-restore:hover { opacity: 0.85; }
</style>
