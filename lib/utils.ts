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
 * Format a "DD/MM/YYYY" or "DD/MM/YYYY HH:MM" date string into a human-readable format.
 * @param dateStr - Date string in DD/MM/YYYY or DD/MM/YYYY HH:MM format
 * @param options - Intl.DateTimeFormatOptions (defaults to full date with weekday)
 */
export function formatDate(
  dateStr: string,
  options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
): string {
  const date = parseLocalDate(dateStr)
  return date.toLocaleDateString('en-US', options)
}

/**
 * Format a DD/MM/YYYY date string without weekday.
 */
export function formatDateShort(dateStr: string): string {
  return formatDate(dateStr, { year: 'numeric', month: 'long', day: 'numeric' })
}

/**
 * Returns the ceremonial title for a contestant based on gender.
 * Male → "King", Female → "Queen"
 */
export function genderTitle(gender: string): string {
  return gender === 'Male' ? 'King' : 'Queen'
}

/**
 * Returns Tailwind classes for a rank badge (1st = gold, 2nd = silver, 3rd = bronze).
 */
export function rankBadgeClasses(index: number): string {
  if (index === 0) return 'bg-gold-500 text-burgundy-900'
  if (index === 1) return 'bg-gray-200 text-gray-700'
  if (index === 2) return 'bg-amber-500 text-white'
  return 'bg-gray-100 text-gray-500'
}

/**
 * Parse a "DD/MM/YYYY" or "DD/MM/YYYY HH:MM" date string into a local-time Date object.
 * Single shared helper — prevents duplicated parsing logic across API routes and components.
 */
export function parseLocalDate(dateStr: string): Date {
  const [datePart, timePart] = dateStr.split(' ')
  const [day, month, year] = datePart.split('/').map(Number)
  if (timePart) {
    const [hours, minutes] = timePart.split(':').map(Number)
    return new Date(year, month - 1, day, hours, minutes)
  }
  return new Date(year, month - 1, day)
}
