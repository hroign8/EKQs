import { escapeHtml, formatDate, formatDateShort } from './utils'

describe('escapeHtml', () => {
  it('escapes ampersands', () => {
    expect(escapeHtml('Rock & Roll')).toBe('Rock &amp; Roll')
  })

  it('escapes angle brackets', () => {
    expect(escapeHtml('<script>alert("xss")</script>')).toBe(
      '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
    )
  })

  it('escapes double quotes', () => {
    expect(escapeHtml('say "hello"')).toBe('say &quot;hello&quot;')
  })

  it('escapes single quotes', () => {
    expect(escapeHtml("it's")).toBe('it&#39;s')
  })

  it('handles all special characters together', () => {
    expect(escapeHtml('<b>"Tom & Jerry\'s"</b>')).toBe(
      '&lt;b&gt;&quot;Tom &amp; Jerry&#39;s&quot;&lt;/b&gt;'
    )
  })

  it('returns plain text unchanged', () => {
    expect(escapeHtml('Hello World 123')).toBe('Hello World 123')
  })

  it('handles empty string', () => {
    expect(escapeHtml('')).toBe('')
  })
})

describe('formatDate', () => {
  it('formats DD/MM/YYYY to a full human-readable date', () => {
    const result = formatDate('25/12/2025')
    expect(result).toContain('December')
    expect(result).toContain('25')
    expect(result).toContain('2025')
  })

  it('respects custom options', () => {
    const result = formatDate('01/06/2024', { month: 'short', day: 'numeric' })
    expect(result).toContain('Jun')
    expect(result).toContain('1')
  })

  it('handles first day of year', () => {
    const result = formatDate('01/01/2026')
    expect(result).toContain('January')
    expect(result).toContain('1')
    expect(result).toContain('2026')
  })
})

describe('formatDateShort', () => {
  it('formats without weekday', () => {
    const result = formatDateShort('15/03/2025')
    expect(result).toContain('March')
    expect(result).toContain('15')
    expect(result).toContain('2025')
    // Should not include weekday
    expect(result).not.toMatch(/Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday/)
  })
})
