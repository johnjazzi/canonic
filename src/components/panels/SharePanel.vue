<template>
  <div class="share-panel">

    <div class="panel-section">
      <div class="section-label">
        <Share2 :size="11" />
        Share this document
      </div>
      <p class="section-desc">
        Creates a secure link served directly from your machine.
        Your file never leaves your computer.
      </p>
    </div>

    <!-- Not yet sharing -->
    <div v-if="!store.shareInfo" class="share-action">
      <button class="start-btn" @click="startShare" :disabled="loading">
        {{ loading ? 'Starting…' : 'Generate share link' }}
      </button>
      <p v-if="error" class="error-msg">{{ error }}</p>
    </div>

    <!-- Active share -->
    <div v-else class="share-active">
      <div class="status-row">
        <span class="status-dot" />
        <span class="status-label">Sharing active</span>
      </div>

      <div v-if="store.shareInfo.tunnelUrl" class="link-block">
        <span class="link-type">Internet</span>
        <div class="link-row">
          <span class="link-text">{{ store.shareInfo.tunnelUrl }}</span>
          <button class="copy-btn" @click="copy('tunnel', store.shareInfo.tunnelUrl)">
            {{ copied === 'tunnel' ? '✓' : 'Copy' }}
          </button>
        </div>
      </div>

      <div class="link-block">
        <span class="link-type">Local network</span>
        <div class="link-row">
          <span class="link-text">{{ store.shareInfo.localUrl }}</span>
          <button class="copy-btn" @click="copy('local', store.shareInfo.localUrl)">
            {{ copied === 'local' ? '✓' : 'Copy' }}
          </button>
        </div>
      </div>

      <div v-if="!store.shareInfo.tunnelUrl" class="tunnel-hint">
        <TriangleAlert :size="12" style="flex-shrink:0" />
        Internet sharing needs <code>cloudflared</code>:
        <code>brew install cloudflared</code>
      </div>

      <button class="stop-btn" @click="stopShare">Stop sharing</button>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAppStore } from '../../store'
import { Share2, TriangleAlert } from 'lucide-vue-next'

const store = useAppStore()
const loading = ref(false)
const error = ref('')
const copied = ref('')

async function startShare() {
  loading.value = true
  error.value = ''
  const result = await store.startShare({})
  loading.value = false
  if (!result.success) error.value = result.error || 'Failed to start sharing'
}

async function stopShare() {
  await store.stopShare()
}

async function copy(key, text) {
  await navigator.clipboard.writeText(text)
  copied.value = key
  setTimeout(() => { copied.value = '' }, 2000)
}
</script>

<style scoped>
.share-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding: 0 0 16px;
}

.panel-section {
  padding: 10px 12px 8px;
  border-bottom: 1px solid var(--border);
}

.section-label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  margin-bottom: 6px;
}

.section-desc {
  font-size: 0.775rem;
  color: var(--text-muted);
  line-height: 1.5;
  margin: 0;
}

.share-action {
  padding: 14px 12px;
}

.start-btn {
  width: 100%;
  padding: 8px 0;
  border-radius: 6px;
  border: none;
  background: var(--accent);
  color: white;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.15s;
}

.start-btn:hover:not(:disabled) { opacity: 0.85; }
.start-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.error-msg {
  font-size: 0.775rem;
  color: var(--error);
  margin: 8px 0 0;
}

.share-active {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.status-row {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 0.8rem;
  color: var(--success);
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--success);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.status-label { font-weight: 500; }

.link-block {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.link-type {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
}

.link-row {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--bg-base);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 6px 10px;
}

.link-text {
  flex: 1;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.7rem;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.copy-btn {
  flex-shrink: 0;
  padding: 3px 8px;
  border-radius: 4px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-muted);
  font-size: 0.72rem;
  cursor: pointer;
}

.copy-btn:hover { background: var(--bg-hover); color: var(--text-primary); }

.tunnel-hint {
  display: flex;
  align-items: flex-start;
  gap: 7px;
  padding: 8px 10px;
  background: var(--bg-base);
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 0.75rem;
  color: var(--text-muted);
  line-height: 1.5;
  flex-wrap: wrap;
}

.tunnel-hint code {
  font-family: 'JetBrains Mono', monospace;
  background: var(--bg-hover);
  padding: 1px 5px;
  border-radius: 3px;
  font-size: 0.7rem;
}

.stop-btn {
  width: 100%;
  padding: 7px 0;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-muted);
  font-size: 0.8125rem;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.stop-btn:hover { background: rgba(239,68,68,0.1); color: #f87171; border-color: rgba(239,68,68,0.3); }
</style>
