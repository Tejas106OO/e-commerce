/**
 * Utility functions for input sanitization and XSS prevention.
 */

/**
 * Escapes unsafe HTML characters to prevent XSS/injection attacks.
 * @param {string} str Unsanitized input string
 * @returns {string} Sanitized safe string
 */
export function sanitizeInput(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Strips HTML tags entirely from a string.
 * @param {string} str HTML string
 * @returns {string} Plain text string
 */
export function stripHtml(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/<[^>]*>/g, '');
}
