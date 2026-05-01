import { ref } from 'vue'

const draggingItem = ref(null) // { path, type }
const dragTarget = ref(null)   // folder path string, '' = root, null = no target

function startDrag(item) {
  draggingItem.value = item
}

function endDrag() {
  draggingItem.value = null
  dragTarget.value = null
}

function setTarget(path) {
  dragTarget.value = path
}

function clearTarget() {
  dragTarget.value = null
}

function reset() {
  draggingItem.value = null
  dragTarget.value = null
}

function itemName(itemPath) {
  return itemPath.includes('/') ? itemPath.split('/').pop() : itemPath
}

function itemParent(itemPath) {
  return itemPath.includes('/') ? itemPath.split('/').slice(0, -1).join('/') : ''
}

function canDrop(itemPath, targetPath) {
  // Prevent drop onto same parent (no-op)
  if (itemParent(itemPath) === targetPath) return false
  // Prevent dropping a folder into itself or its own descendants
  if (targetPath === itemPath || targetPath.startsWith(itemPath + '/')) return false
  return true
}

function getNewPath(itemPath, targetDir) {
  const name = itemName(itemPath)
  return targetDir === '' ? name : `${targetDir}/${name}`
}

export function useDragDrop() {
  return { draggingItem, dragTarget, startDrag, endDrag, setTarget, clearTarget, reset, canDrop, getNewPath }
}
