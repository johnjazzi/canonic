<template>
  <div class="editor-wrapper">
    <div class="editor-topbar">
      <h1 class="doc-title">{{ docTitle }}</h1>
      <div class="topbar-actions">
        <span v-if="store.isDirty" class="unsaved-label">Unsaved</span>
        <button class="action-btn" @click="save" :disabled="!store.isDirty">Save</button>
      </div>
    </div>

    <div class="editor-scroll">
      <div class="editor-content" ref="editorContentEl" @mouseup="onMouseUp">
        <MilkdownProvider :key="store.currentFile">
          <MilkdownEditor
            :content="store.currentContent"
            :comments="store.comments"
            @update="onContentUpdate"
          />
        </MilkdownProvider>
      </div>
    </div>

    <!-- Selection comment popover -->
    <div
      v-if="selectionPopover.visible && !commentInput.visible"
      class="comment-popover"
      :style="{ top: selectionPopover.y + 'px', left: selectionPopover.x + 'px' }"
    >
      <button class="popover-btn" @click="openCommentInput">
        <MessageSquarePlus :size="13" />
        Add comment
      </button>
    </div>

    <!-- Inline comment input -->
    <div
      v-if="commentInput.visible"
      class="comment-input-box"
      :style="{ top: selectionPopover.y + 'px', left: selectionPopover.x + 'px' }"
      @click.stop
      @mousedown.stop
    >
      <div class="comment-quoted">
        <span class="comment-quote-bar" />
        <span class="comment-quote-text">{{ truncateQuote(selectionPopover.text) }}</span>
      </div>
      <textarea
        ref="commentTextareaEl"
        v-model="commentInput.text"
        class="comment-textarea"
        placeholder="Add a comment…"
        rows="3"
        @keydown.ctrl.enter="submitComment"
        @keydown.meta.enter="submitComment"
        @keydown.esc="cancelComment"
      />
      <div class="comment-input-actions">
        <span class="comment-input-hint">⌘↩ to submit</span>
        <button class="comment-cancel-btn" @click="cancelComment">Cancel</button>
        <button class="comment-submit-btn" @click="submitComment" :disabled="!commentInput.text.trim()">Comment</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { MilkdownProvider } from '@milkdown/vue'
import { useAppStore } from '../../store'
import { v4 as uuidv4 } from 'uuid'
import { MessageSquarePlus } from 'lucide-vue-next'
import MilkdownEditor from './MilkdownEditor.vue'

const store = useAppStore()
const editorContentEl = ref(null)
const commentTextareaEl = ref(null)
const localContent = ref('')

const selectionPopover = ref({ visible: false, x: 0, y: 0, text: '' })
const commentInput = ref({ visible: false, text: '' })

const docTitle = computed(() => {
  if (!store.currentFile) return ''
  return store.currentFile.split('/').pop().replace('.md', '')
})

// Keep localContent in sync when store changes (file switch)
watch(() => store.currentContent, (val) => {
  localContent.value = val || ''
}, { immediate: true })

function onContentUpdate(markdown) {
  localContent.value = markdown
  if (markdown !== store.currentContent) {
    store.isDirty = true
  }
}

async function save() {
  await store.saveFile(localContent.value)
}

// Auto-save every 30s when dirty
let autoSaveTimer = null
watch(() => store.isDirty, (dirty) => {
  if (dirty) {
    clearTimeout(autoSaveTimer)
    autoSaveTimer = setTimeout(() => save(), 30000)
  }
})

function onMouseUp() {
  if (commentInput.value.visible) return
  const selection = window.getSelection()
  if (!selection || selection.isCollapsed || !selection.toString().trim()) {
    selectionPopover.value.visible = false
    return
  }

  const selectedText = selection.toString().trim()
  const range = selection.getRangeAt(0)
  const rect = range.getBoundingClientRect()
  const wrapperRect = editorContentEl.value.getBoundingClientRect()

  selectionPopover.value = {
    visible: true,
    x: Math.max(0, rect.left - wrapperRect.left),
    y: rect.top - wrapperRect.top - 44,
    text: selectedText
  }
}

function truncateQuote(text, len = 80) {
  return text.length > len ? text.slice(0, len) + '…' : text
}

async function openCommentInput() {
  commentInput.value = { visible: true, text: '' }
  await nextTick()
  commentTextareaEl.value?.focus()
}

function cancelComment() {
  commentInput.value = { visible: false, text: '' }
  selectionPopover.value.visible = false
}

function submitComment() {
  const text = commentInput.value.text.trim()
  if (!text) return

  store.addComment({
    id: uuidv4(),
    author: store.config?.displayName || 'You',
    type: 'selection',
    anchor: { quotedText: selectionPopover.value.text },
    text,
    resolved: false,
    createdAt: new Date().toISOString()
  })

  cancelComment()
}

onMounted(() => {
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 's') {
      e.preventDefault()
      if (store.isDirty) save()
    }
  })
})
</script>

<style scoped>
.editor-wrapper {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
  position: relative;
}

.editor-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 48px 12px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.doc-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  letter-spacing: -0.01em;
}

.topbar-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.unsaved-label {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.action-btn {
  padding: 5px 14px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.8125rem;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.action-btn:hover:not(:disabled) { background: var(--bg-hover); color: var(--text-primary); }
.action-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.editor-scroll {
  flex: 1;
  overflow-y: auto;
}

.editor-content {
  max-width: 720px;
  margin: 0 auto;
  padding: 32px 48px 80px;
  position: relative;
  min-height: 100%;
}

.comment-popover {
  position: absolute;
  z-index: 100;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 4px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.3);
}

.popover-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: var(--text-primary);
  font-size: 0.8125rem;
  cursor: pointer;
  white-space: nowrap;
}

.popover-btn:hover { background: var(--bg-hover); }

.comment-input-box {
  position: absolute;
  z-index: 101;
  width: 280px;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 10px;
  box-shadow: 0 6px 24px rgba(0,0,0,0.4);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.comment-quoted {
  display: flex;
  align-items: flex-start;
  gap: 7px;
}

.comment-quote-bar {
  width: 3px;
  min-height: 16px;
  background: var(--accent);
  border-radius: 2px;
  flex-shrink: 0;
  margin-top: 2px;
}

.comment-quote-text {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-style: italic;
  line-height: 1.4;
  word-break: break-word;
}

.comment-textarea {
  width: 100%;
  background: var(--bg-base);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 7px 9px;
  color: var(--text-primary);
  font-size: 0.8375rem;
  font-family: 'Inter', sans-serif;
  resize: none;
  outline: none;
  line-height: 1.5;
  box-sizing: border-box;
  transition: border-color 0.15s;
}

.comment-textarea:focus { border-color: var(--accent-muted); }
.comment-textarea::placeholder { color: var(--text-muted); }

.comment-input-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.comment-input-hint {
  font-size: 0.7rem;
  color: var(--text-muted);
  margin-right: auto;
}

.comment-cancel-btn {
  padding: 4px 10px;
  border-radius: 5px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-muted);
  font-size: 0.8rem;
  cursor: pointer;
}

.comment-cancel-btn:hover { background: var(--bg-hover); color: var(--text-primary); }

.comment-submit-btn {
  padding: 4px 12px;
  border-radius: 5px;
  border: none;
  background: var(--accent);
  color: white;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
}

.comment-submit-btn:hover:not(:disabled) { opacity: 0.85; }
.comment-submit-btn:disabled { opacity: 0.4; cursor: not-allowed; }
</style>

<!-- Global: style the Milkdown / ProseMirror editor to match HAL2001 theme -->
<style>
.milkdown {
  background: transparent !important;
  box-shadow: none !important;
  padding: 0 !important;
}

.milkdown .ProseMirror {
  outline: none;
  font-family: 'Inter', -apple-system, sans-serif;
  font-size: 0.9375rem;
  line-height: 1.8;
  color: var(--text-primary);
  caret-color: var(--accent);
  min-height: 60vh;
}

.milkdown .ProseMirror h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 1.5em 0 0.5em;
  letter-spacing: -0.02em;
  line-height: 1.2;
  border-bottom: 1px solid var(--border);
  padding-bottom: 0.3em;
}

.milkdown .ProseMirror h2 {
  font-size: 1.35rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 1.4em 0 0.4em;
  letter-spacing: -0.01em;
  line-height: 1.3;
}

.milkdown .ProseMirror h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 1.2em 0 0.3em;
}

.milkdown .ProseMirror h4,
.milkdown .ProseMirror h5,
.milkdown .ProseMirror h6 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin: 1em 0 0.25em;
}

.milkdown .ProseMirror p {
  margin: 0 0 1em;
  color: var(--text-primary);
}

.milkdown .ProseMirror strong {
  font-weight: 600;
  color: var(--text-primary);
}

.milkdown .ProseMirror em {
  color: var(--text-secondary);
  font-style: italic;
}

.milkdown .ProseMirror code {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.85em;
  background: var(--bg-hover);
  color: var(--secondary);
  padding: 2px 5px;
  border-radius: 4px;
  border: 1px solid var(--border);
}

.milkdown .ProseMirror pre {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 16px;
  overflow-x: auto;
  margin: 1em 0;
}

.milkdown .ProseMirror pre code {
  background: none;
  border: none;
  padding: 0;
  font-size: 0.875rem;
  color: var(--text-primary);
}

.milkdown .ProseMirror ul,
.milkdown .ProseMirror ol {
  padding-left: 1.75em;
  margin: 0.5em 0 1em;
}

.milkdown .ProseMirror li {
  margin: 0.25em 0;
  color: var(--text-primary);
}

.milkdown .ProseMirror li p { margin: 0; }

.milkdown .ProseMirror blockquote {
  border-left: 3px solid var(--accent-muted);
  padding-left: 1em;
  margin: 1em 0;
  color: var(--text-secondary);
  font-style: italic;
}

.milkdown .ProseMirror hr {
  border: none;
  border-top: 1px solid var(--border);
  margin: 2em 0;
}

.milkdown .ProseMirror a {
  color: var(--accent);
  text-decoration: underline;
  text-underline-offset: 2px;
}

/* Comment highlights */
.comment-highlight {
  background: rgba(251, 191, 36, 0.18);
  border-bottom: 2px solid rgba(251, 191, 36, 0.7);
  border-radius: 2px;
  cursor: pointer;
  transition: background 0.15s;
}

.comment-highlight:hover {
  background: rgba(251, 191, 36, 0.35);
}

.demo-highlight {
  background: rgba(139, 92, 246, 0.15);
  border-bottom: 2px solid rgba(139, 92, 246, 0.6);
}

.demo-highlight:hover {
  background: rgba(139, 92, 246, 0.28);
}

.agent-highlight {
  background: rgba(74, 222, 128, 0.15);
  border-bottom: 2px solid rgba(74, 222, 128, 0.6);
}

.agent-highlight:hover {
  background: rgba(74, 222, 128, 0.28);
}

/* Placeholder */
.milkdown .ProseMirror.ProseMirror-empty::before {
  content: 'Start writing…';
  color: var(--text-muted);
  pointer-events: none;
  position: absolute;
}

/* Selection */
.milkdown .ProseMirror ::selection {
  background: rgba(74, 122, 155, 0.3);
}
</style>
