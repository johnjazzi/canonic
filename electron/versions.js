const fs = require('fs')
const path = require('path')

function getVersionsPath(workspacePath) {
  return path.join(workspacePath, '.canonic', 'versions.json')
}

function readAll(workspacePath) {
  const p = getVersionsPath(workspacePath)
  if (!fs.existsSync(p)) return {}
  try { return JSON.parse(fs.readFileSync(p, 'utf-8')) } catch { return {} }
}

function writeAll(workspacePath, data) {
  const p = getVersionsPath(workspacePath)
  const dir = path.dirname(p)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf-8')
}

function list(workspacePath, filePath) {
  return readAll(workspacePath)[filePath] || []
}

function save(workspacePath, filePath, name, oid, message) {
  const all = readAll(workspacePath)
  if (!all[filePath]) all[filePath] = []
  all[filePath] = all[filePath].filter(v => v.name !== name)
  all[filePath].unshift({ name, oid, message: message || '', createdAt: new Date().toISOString() })
  writeAll(workspacePath, all)
  return all[filePath]
}

function remove(workspacePath, filePath, versionName) {
  const all = readAll(workspacePath)
  if (all[filePath]) all[filePath] = all[filePath].filter(v => v.name !== versionName)
  writeAll(workspacePath, all)
}

module.exports = { list, save, remove }
