<template>
  <div class="branch-menu" @keydown.esc="$emit('close')">
    <div class="menu-section">
      <p class="menu-label">Switch branch</p>
      <button
        v-for="branch in store.branches"
        :key="branch"
        :class="['branch-item', branch === store.currentBranch && 'active']"
        @click="switchBranch(branch)"
      >
        <GitBranch :size="12" />
        {{ branch }}
        <Check v-if="branch === store.currentBranch" :size="12" style="margin-left: auto" />
      </button>
    </div>

    <div class="menu-divider" />

    <div class="menu-section">
      <p class="menu-label">New branch</p>
      <div class="new-branch-input">
        <input
          v-model="newBranchName"
          placeholder="branch-name"
          @keydown.enter="createBranch"
          @click.stop
        />
        <button @click.stop="createBranch" :disabled="!newBranchName.trim()">
          Create
        </button>
      </div>
      <p class="branch-hint">Branches off current: <strong>{{ store.currentBranch }}</strong></p>
    </div>

    <div v-if="store.branches.length > 1" class="menu-section">
      <div class="menu-divider" />
      <button class="merge-trigger" @click="showMerge = true">
        <GitMerge :size="12" />
        Merge a branch into main…
      </button>
    </div>

    <!-- Inline merge panel -->
    <div v-if="showMerge" class="merge-panel" @click.stop>
      <p class="menu-label">Merge into main</p>
      <select v-model="mergeBranch" class="merge-select">
        <option disabled value="">Select branch</option>
        <option v-for="b in otherBranches" :key="b" :value="b">{{ b }}</option>
      </select>
      <input v-model="mergeMessage" placeholder="Merge commit message (optional)" class="merge-msg" />
      <button class="merge-btn" @click="doMerge" :disabled="!mergeBranch">Merge</button>
      <p v-if="mergeError" class="merge-error">{{ mergeError }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAppStore } from '../store'
import { GitBranch, Check, GitMerge } from 'lucide-vue-next'

const emit = defineEmits(['close'])
const store = useAppStore()
const newBranchName = ref('')
const showMerge = ref(false)
const mergeBranch = ref('')
const mergeMessage = ref('')
const mergeError = ref('')

const otherBranches = computed(() => store.branches.filter(b => b !== 'main'))

async function switchBranch(branch) {
  if (branch === store.currentBranch) { emit('close'); return }
  await store.checkoutBranch(branch)
  emit('close')
}

async function createBranch() {
  const name = newBranchName.value.trim().replace(/\s+/g, '-')
  if (!name) return
  await store.createBranch(name)
  newBranchName.value = ''
  emit('close')
}

async function doMerge() {
  if (!mergeBranch.value) return
  mergeError.value = ''
  const result = await store.mergeBranch(mergeBranch.value, mergeMessage.value)
  if (result.success) {
    emit('close')
  } else {
    mergeError.value = result.conflict ? 'Merge conflict — resolve manually.' : result.error
  }
}
</script>

<style scoped>
.branch-menu {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  z-index: 200;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 6px;
  min-width: 220px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.4);
}

.menu-section { padding: 4px 0; }

.menu-label {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  padding: 4px 8px 2px;
  margin: 0;
}

.branch-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 6px 8px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.8125rem;
  cursor: pointer;
  text-align: left;
  transition: background 0.1s;
}

.branch-item:hover { background: var(--bg-hover); color: var(--text-primary); }
.branch-item.active { color: var(--text-primary); }

.menu-divider {
  height: 1px;
  background: var(--border);
  margin: 4px 0;
}

.new-branch-input {
  display: flex;
  gap: 6px;
  padding: 4px 8px;
}

.new-branch-input input {
  flex: 1;
  background: var(--bg-base);
  border: 1px solid var(--border);
  border-radius: 5px;
  padding: 5px 8px;
  color: var(--text-primary);
  font-size: 0.8rem;
  font-family: 'JetBrains Mono', monospace;
  outline: none;
}

.new-branch-input input:focus { border-color: var(--accent-muted); }

.new-branch-input button {
  padding: 5px 10px;
  border-radius: 5px;
  border: none;
  background: var(--accent);
  color: white;
  font-size: 0.8rem;
  cursor: pointer;
}

.new-branch-input button:disabled { opacity: 0.4; cursor: not-allowed; }

.branch-hint {
  font-size: 0.72rem;
  color: var(--text-muted);
  padding: 2px 8px;
  margin: 0;
}

.merge-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 6px 8px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: var(--text-muted);
  font-size: 0.8125rem;
  cursor: pointer;
  text-align: left;
}

.merge-trigger:hover { background: var(--bg-hover); color: var(--text-primary); }

.merge-panel {
  padding: 4px 8px 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.merge-select, .merge-msg {
  background: var(--bg-base);
  border: 1px solid var(--border);
  border-radius: 5px;
  padding: 6px 8px;
  color: var(--text-primary);
  font-size: 0.8rem;
  outline: none;
  width: 100%;
}

.merge-btn {
  padding: 6px;
  border-radius: 5px;
  border: none;
  background: var(--accent);
  color: white;
  font-size: 0.8rem;
  cursor: pointer;
}

.merge-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.merge-error { font-size: 0.775rem; color: var(--error); margin: 0; }
</style>
