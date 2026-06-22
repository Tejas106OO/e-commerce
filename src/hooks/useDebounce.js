import { useState, useEffect } from 'react'

/**
 * Delays updating the returned value until `delay` ms after the last change.
 * Prevents API calls on every keystroke in search inputs.
 *
 * @param {any}    value - The value to debounce
 * @param {number} delay - Milliseconds to wait (default 300ms)
 * @returns {any}  The debounced value
 *
 * @example
 * const debouncedQuery = useDebounce(searchQuery, 300)
 * useEffect(() => { fetchResults(debouncedQuery) }, [debouncedQuery])
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}
