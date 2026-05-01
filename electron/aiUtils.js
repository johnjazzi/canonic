function parseApiError(status, rawBody) {
  if (rawBody) {
    try {
      const parsed = JSON.parse(rawBody)
      const msg = parsed.error?.message || parsed.message || parsed.detail
      if (msg) return `[${status}] ${msg}`
    } catch {
      return `[${status}] ${rawBody.trim()}`
    }
  }
  return `[${status}] API error`
}

module.exports = { parseApiError }
