<template>
  <div class="peers-panel">
    <div class="panel-header">
      <span class="section-label">Shared with me</span>
    </div>

    <div class="peers-list">
      <div v-for="peer in store.demoPeers" :key="peer.id" class="peer-group">
        <div class="peer-header">
          <div class="peer-avatar">{{ peer.name.split(' ').map(n => n[0]).join('') }}</div>
          <div class="peer-info">
            <span class="peer-name">{{ peer.name }}</span>
            <span class="peer-role">{{ peer.role }}</span>
          </div>
          <div class="peer-status" :class="peer.online ? 'online' : 'offline'">
            <span class="status-dot"></span>
            <span class="status-label">{{ peer.online ? 'Online' : peer.lastSeen }}</span>
          </div>
        </div>

        <div class="peer-workspace-name">{{ peer.workspaceName }}</div>

        <div class="peer-files">
          <button
            v-for="file in peer.files"
            :key="file.path"
            class="peer-file"
            @click="openPeerFile(peer, file)"
          >
            <FileText :size="13" />
            <span>{{ file.name }}</span>
            <span class="read-only-badge">read-only</span>
          </button>
        </div>
      </div>

      <div v-if="!store.demoPeers.length" class="empty-hint">
        No shared workspaces yet. When someone shares docs with you, they'll appear here.
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAppStore } from '../../store'
import { FileText } from 'lucide-vue-next'

const store = useAppStore()

function openPeerFile(peer, file) {
  // In a real app this would clone/fetch from the peer's tunnel
  // In demo mode, we just show a toast-like state
  alert(`In production, "${file.name}" from ${peer.name}'s workspace would open here in read-only mode, cloned via their sharing link.`)
}
</script>

<style scoped>
.peers-panel {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}

.panel-header {
  display: flex;
  align-items: center;
  padding: 8px 12px;
}

.section-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
}

.peers-list {
  flex: 1;
  overflow-y: auto;
  padding: 4px 0 12px;
}

.peer-group {
  margin-bottom: 20px;
}

.peer-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
}

.peer-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--accent-muted);
  color: var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.6875rem;
  font-weight: 700;
  flex-shrink: 0;
}

.peer-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1px;
  overflow: hidden;
}

.peer-name {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-primary);
}

.peer-role {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.peer-status {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.online .status-dot { background: #22c55e; }
.offline .status-dot { background: var(--text-muted); }

.status-label {
  font-size: 0.6875rem;
  color: var(--text-muted);
}

.peer-workspace-name {
  font-size: 0.75rem;
  color: var(--text-muted);
  padding: 0 12px 4px 48px;
  font-style: italic;
}

.peer-files {
  display: flex;
  flex-direction: column;
  gap: 1px;
  padding: 0 6px;
}

.peer-file {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 6px 5px 42px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.8125rem;
  cursor: pointer;
  text-align: left;
  width: 100%;
  transition: background 0.12s;
}

.peer-file:hover { background: var(--bg-hover); color: var(--text-primary); }

.peer-file span:nth-child(2) {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.read-only-badge {
  font-size: 0.625rem;
  color: var(--text-muted);
  background: var(--bg-hover);
  padding: 1px 5px;
  border-radius: 3px;
  flex-shrink: 0;
}

.empty-hint {
  padding: 16px 12px;
  font-size: 0.8125rem;
  color: var(--text-muted);
  line-height: 1.5;
}
</style>
