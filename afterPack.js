const fs = require('fs')
const path = require('path')

exports.default = async function ({ appOutDir, packager }) {
  const src = path.join(__dirname, 'node_modules', 'call-bind-apply-helpers')
  const productName = packager.appInfo.productName

  // appOutDir contains Canonic.app on mac — navigate into the bundle
  const dest = path.join(
    appOutDir,
    `${productName}.app`,
    'Contents',
    'Resources',
    'app',
    'node_modules',
    'call-bind-apply-helpers'
  )

  if (!fs.existsSync(dest)) {
    copyDirSync(src, dest)
    console.log('[afterPack] copied call-bind-apply-helpers to', dest)
  }
}

function copyDirSync(src, dest) {
  fs.mkdirSync(dest, { recursive: true })
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name)
    const d = path.join(dest, entry.name)
    entry.isDirectory() ? copyDirSync(s, d) : fs.copyFileSync(s, d)
  }
}
