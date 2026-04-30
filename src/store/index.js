import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAppStore = defineStore('app', () => {
  const workspacePath = ref(null)
  const workspaceName = ref(null)
  const recentWorkspaces = ref(JSON.parse(localStorage.getItem('canonic:recentWorkspaces') || '[]'))
  const files = ref([])
  const currentFile = ref(null)
  const currentContent = ref('')
  const branches = ref([])
  const currentBranch = ref('main')
  const commitLog = ref([])
  const comments = ref([])
  const isDirty = ref(false)
  const isLoading = ref(false)
  const shareInfo = ref(null)
  const searchResults = ref([])
  const config = ref(null)
  const sidebarTab = ref('files') // 'files' | 'search' | 'peers'
  const rightPanelTab = ref('comments') // 'comments' | 'ai' | 'history'

  // Demo mode — config loaded at runtime from public/demo/config.json
  const isDemoMode = ref(false)
  const demoPeers = ref([])
  const _demoComments = ref({}) // keyed by file path

  const api = window.canonic

  async function loadConfig() {
    config.value = await api.config.read()
    return config.value
  }

  async function saveConfig(newConfig) {
    const result = await api.config.write(newConfig)
    if (result.success) config.value = result.config
    return result
  }

  async function openWorkspace(chosenPath, template = 'blank') {
    isLoading.value = true
    try {
      const result = await api.workspace.init(chosenPath, template)
      if (result.error) throw new Error(result.error)
      workspacePath.value = result.path
      workspaceName.value = chosenPath.split('/').pop()
      const recent = recentWorkspaces.value.filter(w => w.path !== chosenPath)
      recent.unshift({ path: chosenPath, name: workspaceName.value, openedAt: Date.now() })
      recentWorkspaces.value = recent.slice(0, 8)
      localStorage.setItem('canonic:recentWorkspaces', JSON.stringify(recentWorkspaces.value))
      currentFile.value = null
      currentContent.value = ''
      comments.value = []
      await refreshFiles()
      await refreshBranches()
    } finally {
      isLoading.value = false
    }
  }

  async function renameFile(oldPath, newName) {
    if (!workspacePath.value) return
    const dir = oldPath.includes('/') ? oldPath.split('/').slice(0, -1).join('/') : ''
    const newPath = dir ? `${dir}/${newName}.md` : `${newName}.md`
    const content = await api.files.read(workspacePath.value, oldPath)
    await api.files.write(workspacePath.value, newPath, content)
    await api.files.delete(workspacePath.value, oldPath)
    // If it was open, switch to new path
    if (currentFile.value === oldPath) {
      currentFile.value = newPath
    }
    await refreshFiles()
    return newPath
  }

  async function refreshFiles() {
    if (!workspacePath.value) return
    files.value = await api.files.list(workspacePath.value)
  }

  async function openFile(filePath) {
    if (!workspacePath.value) return
    const content = await api.files.read(workspacePath.value, filePath)
    currentFile.value = filePath
    currentContent.value = content || ''
    isDirty.value = false
    await loadComments()
    await loadCommitLog()
    // Index for search
    if (content) {
      api.search.index(workspacePath.value, filePath, content)
    }
  }

  async function saveFile(content) {
    if (!workspacePath.value || !currentFile.value) return
    await api.files.write(workspacePath.value, currentFile.value, content)
    currentContent.value = content
    isDirty.value = false
    api.search.index(workspacePath.value, currentFile.value, content)
  }

  async function createFile(name) {
    if (!workspacePath.value) return
    const filePath = await api.files.newDoc(workspacePath.value, name)
    await refreshFiles()
    await openFile(filePath)
    return filePath
  }

  async function commitFile(message) {
    if (!workspacePath.value || !currentFile.value) return
    const result = await api.git.commit(workspacePath.value, currentFile.value, message)
    if (result.success) {
      await loadCommitLog()
    }
    return result
  }

  async function refreshBranches() {
    if (!workspacePath.value) return
    const result = await api.git.branches(workspacePath.value)
    branches.value = result.branches || []
    currentBranch.value = result.current || 'main'
  }

  async function createBranch(name) {
    if (!workspacePath.value) return
    const result = await api.git.createBranch(workspacePath.value, name)
    if (result.success) {
      await refreshBranches()
      if (currentFile.value) await openFile(currentFile.value)
    }
    return result
  }

  async function checkoutBranch(name) {
    if (!workspacePath.value) return
    const result = await api.git.checkout(workspacePath.value, name)
    if (result.success) {
      currentBranch.value = name
      if (currentFile.value) await openFile(currentFile.value)
    }
    return result
  }

  async function mergeBranch(fromBranch, message) {
    if (!workspacePath.value) return
    const result = await api.git.merge(workspacePath.value, fromBranch, message)
    if (result.success) {
      await refreshBranches()
      await refreshFiles()
    }
    return result
  }

  async function loadCommitLog() {
    if (!workspacePath.value || !currentFile.value) return
    commitLog.value = await api.git.log(workspacePath.value, currentFile.value)
  }

  async function loadComments() {
    if (!currentFile.value) return
    const docId = currentFile.value.replace(/\//g, '_')
    const saved = await api.comments.get(docId) || []
    // Merge in demo comments for this file if demo mode is on
    if (isDemoMode.value) {
      const demoForFile = _demoComments.value[currentFile.value] || []
      // Stamp timestamps dynamically so they look recent
      const now = Date.now()
      const stamped = demoForFile.map((c, i) => ({
        ...c,
        createdAt: c.createdAt || new Date(now - (i + 1) * 3600000 * 2).toISOString()
      }))
      const savedIds = new Set(saved.map(c => c.id))
      const newDemo = stamped.filter(c => !savedIds.has(c.id))
      comments.value = [...saved, ...newDemo]
    } else {
      comments.value = saved
    }
  }

  async function addComment(comment) {
    comments.value.push(comment)
    await persistComments()
  }

  async function resolveComment(commentId) {
    const c = comments.value.find(c => c.id === commentId)
    if (c) c.resolved = true
    await persistComments()
  }

  async function deleteComment(commentId) {
    comments.value = comments.value.filter(c => c.id !== commentId)
    await persistComments()
  }

  async function persistComments() {
    if (!currentFile.value) return
    const docId = currentFile.value.replace(/\//g, '_')
    await api.comments.save(docId, JSON.parse(JSON.stringify(comments.value)))
  }

  async function enableDemoMode() {
    // Load config from public/demo/config.json — not bundled, editable without rebuild
    const cfg = await fetch('/demo/config.json').then(r => r.json())
    const defaultPath = await api.workspace.getDefault()
    const parent = defaultPath.replace(/\/[^/]+$/, '')
    const demoPath = `${parent}/${cfg.workspaceName}`

    _demoComments.value = cfg.comments || {}
    demoPeers.value = cfg.peers || []
    isDemoMode.value = true

    await openWorkspace(demoPath, cfg.template || 'pm-framework')
  }

  function disableDemoMode() {
    isDemoMode.value = false
    demoPeers.value = []
    _demoComments.value = {}
    comments.value = comments.value.filter(c => !c.isDemo)
  }

  async function startShare(options) {
    if (!workspacePath.value || !currentFile.value) return
    const result = await api.share.start(workspacePath.value, currentFile.value, options)
    if (result.success) shareInfo.value = result
    return result
  }

  async function stopShare() {
    if (!currentFile.value) return
    await api.share.stop(currentFile.value)
    shareInfo.value = null
  }

  async function searchDocs(query) {
    const results = await api.search.query(query, workspacePath.value)
    searchResults.value = results
    return results
  }

  return {
    workspacePath, workspaceName, recentWorkspaces,
    files, currentFile, currentContent, branches, currentBranch,
    commitLog, comments, isDirty, isLoading, shareInfo, searchResults, config,
    sidebarTab, rightPanelTab,
    isDemoMode, demoPeers,
    loadConfig, saveConfig,
    openWorkspace, refreshFiles, openFile, saveFile, createFile, renameFile,
    commitFile, refreshBranches, createBranch, checkoutBranch, mergeBranch,
    loadCommitLog, loadComments, addComment, resolveComment, deleteComment,
    startShare, stopShare, searchDocs,
    enableDemoMode, disableDemoMode
  }
})
