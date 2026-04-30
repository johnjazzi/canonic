<template>
  <div v-if="store.trashItems.length > 0" class="trash-bin">
    <div class="trash-header" @click="open = !open">
      <ChevronRight :size="11" class="chevron" :class="open && 'open'" />
      <Trash2 :size="12" class="trash-icon" />
      <span class="trash-label">Trash</span>
      <span class="trash-count">{{ store.trashItems.length }}</span>
    </div>
    <template v-if="open">
      <div
        v-for="item in store.trashItems"
        :key="item.id"
        class="trash-item"
        @mouseenter="hoveredId = item.id"
        @mouseleave="hoveredId = null"
      >
        <Folder v-if="item.isDirectory" :size="11" class="item-icon" />
        <FileText v-else :size="11" class="item-icon" />
        <span class="item-name" :title="item.originalPath">{{ itemName(item) }}</span>
        <div v-if="hoveredId === item.id" class="item-actions">
          <button class="trash-btn" title="Restore" @click.stop="restore(item.id)">
            <RotateCcw :size="10" />
          </button>
          <button class="trash-btn trash-btn-danger" title="Delete permanently" @click.stop="purge(item.id)">
            <X :size="10" />
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAppStore } from '../../store'
import { ChevronRight, Trash2, FileText, Folder, RotateCcw, X } from 'lucide-vue-next'

const store = useAppStore()
const open = ref(false)
const hoveredId = ref(null)

function itemName(item) {
  return item.originalPath.split('/').pop()
}

async function restore(id) {
  await store.restoreFromTrash(id)
}

async function purge(id) {
  await store.purgeTrashItem(id)
}
</script>

<style scoped>
.trash-bin {
  border-top: 1px solid var(--border);
  padding: 4px 0;
}

.trash-header {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  user-select: none;
}

.trash-header:hover { color: var(--text-secondary); }

.chevron { transition: transform 0.15s; flex-shrink: 0; }
.chevron.open { transform: rotate(90deg); }
.trash-icon { flex-shrink: 0; }
.trash-label { flex: 1; }
.trash-count {
  background: var(--bg-hover);
  border-radius: 8px;
  padding: 0 5px;
  font-size: 0.7rem;
  font-weight: 500;
}

.trash-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px 4px 28px;
  font-size: 0.8125rem;
  color: var(--text-muted);
  cursor: default;
}

.item-icon { flex-shrink: 0; }

.item-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-style: italic;
}

.item-actions {
  display: flex;
  gap: 1px;
  flex-shrink: 0;
}

.trash-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 3px;
  border: none;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  transition: background 0.1s, color 0.1s;
}

.trash-btn:hover { background: var(--bg-active); color: var(--text-primary); }
.trash-btn-danger:hover { background: rgba(239,68,68,0.15); color: #f87171; }
</style>
