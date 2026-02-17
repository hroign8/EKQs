/**
 * Escape HTML special characters to prevent XSS in email templates.
 */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * Format a DD/MM/YYYY date string into a human-readable format.
 * @param dateStr - Date string in DD/MM/YYYY format
 * @param options - Intl.DateTimeFormatOptions (defaults to full date with weekday)
 */
export function formatDate(
  dateStr: string,
  options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
): string {
  const [day, month, year] = dateStr.split('/').map(Number)
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString('en-US', options)
}

/**
 * Format a DD/MM/YYYY date string without weekday.
 */
export function formatDateShort(dateStr: string): string {
  return formatDate(dateStr, { year: 'numeric', month: 'long', day: 'numeric' })
}
