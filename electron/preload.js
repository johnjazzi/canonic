const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('canonic', {
  // Config
  config: {
    read: () => ipcRenderer.invoke('config:read'),
    write: (config) => ipcRenderer.invoke('config:write', config),
    exists: () => ipcRenderer.invoke('config:exists'),
    validate: (config) => ipcRenderer.invoke('config:validate', config)
  },

  // Workspace
  workspace: {
    openDialog: () => ipcRenderer.invoke('workspace:open-dialog'),
    init: (path, template) => ipcRenderer.invoke('workspace:init', path, template),
    getDefault: () => ipcRenderer.invoke('workspace:get-default'),
    openDirectoryDialog: () => ipcRenderer.invoke('dialog:open-directory')
  },

  // Files
  files: {
    list: (workspacePath) => ipcRenderer.invoke('files:list', workspacePath),
    read: (workspacePath, filePath) => ipcRenderer.invoke('files:read', workspacePath, filePath),
    write: (workspacePath, filePath, content) => ipcRenderer.invoke('files:write', workspacePath, filePath, content),
    delete: (workspacePath, filePath) => ipcRenderer.invoke('files:delete', workspacePath, filePath),
    newDoc: (workspacePath, fileName) => ipcRenderer.invoke('files:new', workspacePath, fileName)
  },

  // Git
  git: {
    commit: (workspacePath, filePath, message) => ipcRenderer.invoke('git:commit', workspacePath, filePath, message),
    log: (workspacePath, filePath) => ipcRenderer.invoke('git:log', workspacePath, filePath),
    branches: (workspacePath) => ipcRenderer.invoke('git:branches', workspacePath),
    createBranch: (workspacePath, name) => ipcRenderer.invoke('git:create-branch', workspacePath, name),
    checkout: (workspacePath, name) => ipcRenderer.invoke('git:checkout', workspacePath, name),
    merge: (workspacePath, from, message) => ipcRenderer.invoke('git:merge', workspacePath, from, message),
    diff: (workspacePath, filePath, oid) => ipcRenderer.invoke('git:diff', workspacePath, filePath, oid),
    readCommit: (workspacePath, filePath, oid) => ipcRenderer.invoke('git:read-commit', workspacePath, filePath, oid),
    status: (workspacePath) => ipcRenderer.invoke('git:status', workspacePath)
  },

  // Comments
  comments: {
    get: (docId) => ipcRenderer.invoke('comments:get', docId),
    save: (docId, comments) => ipcRenderer.invoke('comments:save', docId, comments)
  },

  // Search
  search: {
    query: (query, workspacePath) => ipcRenderer.invoke('search:query', query, workspacePath),
    index: (workspacePath, filePath, content) => ipcRenderer.invoke('search:index', workspacePath, filePath, content)
  },

  // Sharing
  share: {
    start: (workspacePath, filePath, options) => ipcRenderer.invoke('share:start', workspacePath, filePath, options),
    stop: (filePath) => ipcRenderer.invoke('share:stop', filePath),
    openLink: (url) => ipcRenderer.invoke('share:open-link', url),
    openShared: (url, token) => ipcRenderer.invoke('peers:open-shared', url, token)
  },

  // Peers
  peers: {
    list: () => ipcRenderer.invoke('peers:list')
  },

  // Cleanup / Uninstall
  cleanup: {
    resetConfig: () => ipcRenderer.invoke('cleanup:reset-config'),
    deleteWorkspace: (path) => ipcRenderer.invoke('cleanup:delete-workspace', path),
    getPaths: () => ipcRenderer.invoke('cleanup:get-paths')
  },

  // Updates
  update: {
    check: () => ipcRenderer.invoke('update:check'),
    install: () => ipcRenderer.invoke('update:install'),
    onAvailable: (cb) => ipcRenderer.on('update:available', (_, info) => cb(info)),
    onDownloaded: (cb) => ipcRenderer.on('update:downloaded', (_, info) => cb(info))
  },

  // AI (proxied through main process to avoid CORS)
  ai: {
    chat: (params) => ipcRenderer.invoke('ai:chat', params),
    onChunk: (cb) => ipcRenderer.on('ai:chunk', (_, text) => cb(text)),
    onDone: (cb) => ipcRenderer.on('ai:done', () => cb()),
    onError: (cb) => ipcRenderer.on('ai:error', (_, msg) => cb(msg)),
    removeListeners: () => {
      ipcRenderer.removeAllListeners('ai:chunk')
      ipcRenderer.removeAllListeners('ai:done')
      ipcRenderer.removeAllListeners('ai:error')
    }
  }
})
