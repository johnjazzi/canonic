import { describe, it, expect } from 'vitest'
const { parseApiError } = require('../../electron/aiUtils.js')

describe('parseApiError', () => {
  // OpenAI / OpenRouter format
  it('extracts message from {error: {message}} shape', () => {
    const body = JSON.stringify({ error: { message: 'Invalid API key.' } })
    expect(parseApiError(401, body)).toBe('[401] Invalid API key.')
  })

  // Flat {message} format (some providers)
  it('extracts message from flat {message} shape', () => {
    const body = JSON.stringify({ message: 'Unauthorized' })
    expect(parseApiError(403, body)).toBe('[403] Unauthorized')
  })

  // Plain text body
  it('returns raw body when not JSON', () => {
    expect(parseApiError(401, 'Unauthorized')).toBe('[401] Unauthorized')
  })

  // Empty body
  it('returns generic message when body is empty', () => {
    expect(parseApiError(500, '')).toBe('[500] API error')
  })

  // JSON with no recognizable message field
  it('returns generic message when JSON has no message field', () => {
    const body = JSON.stringify({ code: 'invalid_key' })
    expect(parseApiError(401, body)).toBe('[401] API error')
  })

  // Nested detail (Mistral / some others)
  it('extracts from {detail} shape', () => {
    const body = JSON.stringify({ detail: 'API key is invalid' })
    expect(parseApiError(401, body)).toBe('[401] API key is invalid')
  })
})
