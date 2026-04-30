<template>
  <div>
    <div
      :class="['tree-node', item.type === 'file' && store.currentFile === item.path && 'active']"
      :style="{ paddingLeft: `${12 + depth * 16}px` }"
      @click="handleClick"
      @dblclick="item.type === 'file' && startRename()"
      @contextmenu.prevent="item.type === 'file' && startRename()"
    >
      <ChevronRight v-if="item.type === 'directory'" :size="12" class="chevron" :class="open && 'open'" />
      <FileText v-else :size="12" class="file-icon" />

      <!-- Inline rename input -->
      <input
        v-if="renaming"
        ref="renameInput"
        v-model="renameValue"
        class="rename-input"
        @keydown.enter.stop="confirmRename"
        @keydown.esc.stop="renaming = false"
        @blur="confirmRename"
        @click.stop
      />
      <span v-else class="node-name">{{ item.name }}</span>
      <span v-if="item.type === 'file' && isDirty && !renaming" class="dirty-dot" title="Unsaved changes" />
    </div>

    <template v-if="item.type === 'directory' && open">
      <TreeNode
        v-for="child in item.children"
        :key="child.path"
        :item="child"
        :depth="depth + 1"
      />
    </template>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { useAppStore } from '../../store'
import { ChevronRight, FileText } from 'lucide-vue-next'

const props = defineProps({
  item: Object,
  depth: Number
})

const store = useAppStore()
const open = ref(true)
const renaming = ref(false)
const renameValue = ref('')
const renameInput = ref(null)

const isDirty = computed(() =>
  store.currentFile === props.item.path && store.isDirty
)

function handleClick() {
  if (renaming.value) return
  if (props.item.type === 'directory') {
    open.value = !open.value
  } else {
    store.openFile(props.item.path)
  }
}

async function startRename() {
  renameValue.value = props.item.name
  renaming.value = true
  await nextTick()
  renameInput.value?.focus()
  renameInput.value?.select()
}

async function confirmRename() {
  const newName = renameValue.value.trim()
  renaming.value = false
  if (!newName || newName === props.item.name) return
  await store.renameFile(props.item.path, newName)
}
</script>

<style scoped>
.tree-node {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  cursor: pointer;
  border-radius: 4px;
  margin: 0 4px;
  font-size: 0.8125rem;
  color: var(--text-secondary);
  transition: background 0.1s;
  white-space: nowrap;
  overflow: hidden;
}

.tree-node:hover { background: var(--bg-hover); color: var(--text-primary); }
.tree-node.active { background: var(--bg-active); color: var(--text-primary); }

.chevron { flex-shrink: 0; transition: transform 0.15s; }
.chevron.open { transform: rotate(90deg); }
.file-icon { flex-shrink: 0; color: var(--text-muted); }

.node-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dirty-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);
  flex-shrink: 0;
}

.rename-input {
  flex: 1;
  background: var(--bg-base);
  border: 1px solid var(--accent-muted);
  border-radius: 4px;
  padding: 1px 6px;
  color: var(--text-primary);
  font-size: 0.8125rem;
  font-family: inherit;
  outline: none;
  min-width: 0;
}
</style>
