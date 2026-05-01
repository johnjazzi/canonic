<template>
  <div class="file-tree">
    <div class="tree-header">
      <span class="section-label">Documents</span>
      <div class="header-actions">
        <button class="add-btn" @click="showNewDoc()" title="New document">
          <FilePlus :size="14" />
        </button>
        <button class="add-btn" @click="creatingFolder = true" title="New folder">
          <FolderPlus :size="14" />
        </button>
      </div>
    </div>
    <!-- New root folder input -->
    <div v-if="creatingFolder" class="new-folder-row">
      <input
        ref="folderInput"
        v-model="folderName"
        class="folder-input"
        placeholder="folder-name"
        @keydown.enter="confirmNewFolder"
        @keydown.esc="creatingFolder = false"
        @blur="confirmNewFolder"
      />
    </div>
    <div
      :class="['tree-body', dd.dragTarget.value === '' && 'drag-over-root']"
      @dragover.prevent="onRootDragOver"
      @dragleave="onRootDragLeave"
      @drop.prevent="onRootDrop"
    >
      <TreeNode
        v-for="item in store.files"
        :key="item.path"
        :item="item"
        :depth="0"
      />
      <div v-if="store.files.length === 0" class="empty-hint">
        No documents yet. Create one to get started.
      </div>
    </div>
    <TrashBin />
  </div>
</template>

<script setup>
import { ref, nextTick, inject, watch } from 'vue'
import { useAppStore } from '../../store'
import { useDragDrop } from '../../composables/useDragDrop.js'
import TreeNode from './TreeNode.vue'
import TrashBin from './TrashBin.vue'
import { FilePlus, FolderPlus } from 'lucide-vue-next'

const store = useAppStore()
const dd = useDragDrop()
const showNewDoc = inject('showNewDoc')

const creatingFolder = ref(false)
const folderName = ref('')
const folderInput = ref(null)

watch(creatingFolder, async (val) => {
  if (val) {
    folderName.value = ''
    await nextTick()
    folderInput.value?.focus()
  }
})

function onRootDragOver(e) {
  if (!dd.draggingItem.value) return
  if (e.target !== e.currentTarget && e.currentTarget.contains(e.target)) return
  if (!dd.canDrop(dd.draggingItem.value.path, '')) return
  dd.setTarget('')
}

function onRootDragLeave(e) {
  if (!e.currentTarget.contains(e.relatedTarget)) dd.clearTarget()
}

async function onRootDrop() {
  const item = dd.draggingItem.value
  dd.endDrag()
  if (!item) return
  if (!dd.canDrop(item.path, '')) return
  const newPath = dd.getNewPath(item.path, '')
  try {
    await window.canonic.files.move(store.workspacePath, item.path, newPath)
    if (store.currentFile === item.path) await store.openFile(newPath)
    await store.refreshFiles()
  } catch (err) {
    console.error('Move failed:', err)
  }
}

async function confirmNewFolder() {
  const name = folderName.value.trim()
  creatingFolder.value = false
  if (!name) return
  await store.createDirectory(name)
}
</script>

<style scoped>
.file-tree {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}

.tree-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
}

.header-actions {
  display: flex;
  gap: 2px;
}

.new-folder-row {
  padding: 4px 8px;
}

.folder-input {
  width: 100%;
  background: var(--bg-base);
  border: 1px solid var(--accent-muted);
  border-radius: 4px;
  padding: 3px 8px;
  color: var(--text-primary);
  font-size: 0.8125rem;
  font-family: inherit;
  outline: none;
  box-sizing: border-box;
}

.section-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
}

.add-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: none;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.add-btn:hover { background: var(--bg-hover); color: var(--text-primary); }

.tree-body {
  flex: 1;
  overflow-y: auto;
  padding: 4px 0;
}

.drag-over-root {
  outline: 1px dashed var(--accent-muted);
  outline-offset: -2px;
  border-radius: 4px;
}

.empty-hint {
  padding: 12px;
  font-size: 0.8125rem;
  color: var(--text-muted);
  line-height: 1.5;
}
</style>
