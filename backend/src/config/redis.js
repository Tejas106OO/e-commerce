/**
 * Redis client using `ioredis`.
 * Falls back gracefully if REDIS_URL is not set (cache miss = DB fallback).
 */
const Redis = require('ioredis')

let redis = null

if (process.env.REDIS_URL) {
  redis = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
    connectTimeout: 5000
  })

  redis.on('connect', () => console.log('[Redis] Connected'))
  redis.on('error', (err) => console.error('[Redis] Error:', err.message))
} else {
  console.warn('[Redis] REDIS_URL not set — caching disabled')
}

/**
 * Get a cached value. Returns null on miss or when Redis is unavailable.
 * @param {string} key
 */
async function cacheGet(key) {
  if (!redis) return null
  try {
    const value = await redis.get(key)
    return value ? JSON.parse(value) : null
  } catch { return null }
}

/**
 * Set a cached value with TTL (seconds).
 * @param {string} key
 * @param {any} value - Will be JSON-serialized
 * @param {number} ttlSeconds
 */
async function cacheSet(key, value, ttlSeconds = 300) {
  if (!redis) return
  try {
    await redis.setex(key, ttlSeconds, JSON.stringify(value))
  } catch (err) {
    console.warn('[Redis] cacheSet failed:', err.message)
  }
}

/**
 * Delete a cached value (call on mutations).
 * @param {string|string[]} keys
 */
async function cacheDel(keys) {
  if (!redis) return
  try {
    const keyArray = Array.isArray(keys) ? keys : [keys]
    if (keyArray.length > 0) await redis.del(...keyArray)
  } catch (err) {
    console.warn('[Redis] cacheDel failed:', err.message)
  }
}

module.exports = { redis, cacheGet, cacheSet, cacheDel }
