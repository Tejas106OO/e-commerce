/**
 * Resilient API Client with Retry Logic (Exponential Backoff) and Circuit Breaker pattern.
 * Designed to provide graceful degradation and high availability for network calls.
 */

const CIRCUIT_STATES = {
  CLOSED: 'CLOSED', // Normal operation: requests pass through
  OPEN: 'OPEN',     // Failure state: requests fail immediately
  HALF_OPEN: 'HALF_OPEN' // Recovery test state: single request allowed
}

class ResilientApiClient {
  constructor(config = {}) {
    this.failureThreshold = config.failureThreshold || 5 // failures before opening circuit
    this.cooldownPeriod = config.cooldownPeriod || 10000 // ms before testing recovery (10s)
    this.maxRetries = config.maxRetries || 3 // retries per request
    this.baseDelay = config.baseDelay || 1000 // base backoff delay (1s)

    // Circuit Breaker State
    this.state = CIRCUIT_STATES.CLOSED
    this.failuresCount = 0
    this.lastFailureTime = null
  }

  /**
   * Performs a fetch request with retries, exponential backoff, and circuit breaker.
   * @param {string} url Request URL
   * @param {object} options Fetch options
   * @param {any} fallbackData Cached or mock data returned when the call fails
   * @returns {Promise<any>}
   */
  async request(url, options = {}, fallbackData = null) {
    this._checkCircuitState()

    if (this.state === CIRCUIT_STATES.OPEN) {
      console.warn(`Circuit Breaker is OPEN. Blocking request to ${url}. Returning fallback.`)
      if (fallbackData !== null) return fallbackData
      throw new Error(`Circuit Breaker is OPEN for ${url}`)
    }

    let attempt = 0
    while (attempt <= this.maxRetries) {
      try {
        const response = await fetch(url, options)
        if (!response.ok) {
          // Retry on server errors (5xx)
          if (response.status >= 500) {
            throw new Error(`Server returned error: ${response.status}`)
          }
          // Do not retry on client errors (4xx)
          const data = await response.json()
          this._onSuccess()
          return data
        }

        const data = await response.json()
        this._onSuccess()
        return data

      } catch (error) {
        attempt++
        console.warn(`API request attempt ${attempt} failed for ${url}:`, error.message)

        if (attempt > this.maxRetries) {
          this._onFailure()
          if (fallbackData !== null) {
            console.log(`All retries exhausted. Returning cached/mock fallback data for ${url}`)
            return fallbackData
          }
          throw error
        }

        // Exponential Backoff delay: baseDelay * 2^(attempt-1)
        const delay = this.baseDelay * Math.pow(2, attempt - 1)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  _checkCircuitState() {
    if (this.state === CIRCUIT_STATES.OPEN && this.lastFailureTime) {
      const now = Date.now()
      if (now - this.lastFailureTime > this.cooldownPeriod) {
        this.state = CIRCUIT_STATES.HALF_OPEN
        console.log('Circuit Breaker transitioned to HALF_OPEN. Testing recovery...')
      }
    }
  }

  _onSuccess() {
    this.failuresCount = 0
    if (this.state === CIRCUIT_STATES.HALF_OPEN || this.state === CIRCUIT_STATES.OPEN) {
      this.state = CIRCUIT_STATES.CLOSED
      console.log('Circuit Breaker returned to CLOSED. Recovery successful.')
    }
  }

  _onFailure() {
    this.failuresCount++
    this.lastFailureTime = Date.now()

    if (this.state === CIRCUIT_STATES.CLOSED && this.failuresCount >= this.failureThreshold) {
      this.state = CIRCUIT_STATES.OPEN
      console.error(`Circuit Breaker tripped to OPEN. Failure count reached threshold (${this.failuresCount}).`)
    } else if (this.state === CIRCUIT_STATES.HALF_OPEN) {
      this.state = CIRCUIT_STATES.OPEN
      console.error('Circuit Breaker test failed. Trip back to OPEN immediately.')
    }
  }
}

export const client = new ResilientApiClient()
