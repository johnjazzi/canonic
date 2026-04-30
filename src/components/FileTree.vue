<template>
  <div class="file-tree">
    <div class="tree-header">
      <span class="section-label">Documents</span>
      <button class="add-btn" @click="showNewDoc()" title="New document">
        <FilePlus :size="14" />
      </button>
    </div>
    <div class="tree-body">
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
  </div>
</template>

<script setup>
import { inject } from 'vue'
import { useAppStore } from '../store'
import TreeNode from './TreeNode.vue'
import { FilePlus } from 'lucide-vue-next'

const store = useAppStore()
const showNewDoc = inject('showNewDoc')
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

.empty-hint {
  padding: 12px;
  font-size: 0.8125rem;
  color: var(--text-muted);
  line-height: 1.5;
}
</style>
