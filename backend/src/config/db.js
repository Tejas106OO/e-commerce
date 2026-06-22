/**
 * PostgreSQL connection pool using the `pg` library.
 * Uses DATABASE_URL from environment (Supabase / Neon / self-hosted Postgres).
 * Connection string format:
 *   postgresql://USER:PASSWORD@HOST:5432/DBNAME?sslmode=require
 */
const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,
  max: 20,                // max connections in pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000
})

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error:', err)
})

/**
 * Execute a parameterized query.
 * @param {string} text - SQL query string
 * @param {Array}  params - Query parameters
 * @returns {Promise<import('pg').QueryResult>}
 */
async function query(text, params) {
  const start = Date.now()
  const result = await pool.query(text, params)
  const duration = Date.now() - start
  if (process.env.LOG_QUERIES === 'true') {
    console.log(`[DB] query="${text.slice(0, 60)}..." rows=${result.rowCount} duration=${duration}ms`)
  }
  return result
}

/**
 * Get a client from the pool for transaction use.
 * Always call client.release() in a finally block.
 */
async function getClient() {
  return pool.connect()
}

module.exports = { query, getClient, pool }
