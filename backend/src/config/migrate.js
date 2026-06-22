/**
 * Database migration runner.
 * Run with: npm run migrate
 * Executes all SQL files in /migrations in numeric order.
 */
require('dotenv').config()
const fs = require('fs')
const path = require('path')
const { pool } = require('./db')

async function runMigrations() {
  console.log('🗄️  Running database migrations...\n')

  // Create migrations tracking table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id         SERIAL PRIMARY KEY,
      filename   VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    )
  `)

  const migrationsDir = path.join(__dirname, '../../migrations')
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort()

  for (const file of files) {
    const { rows } = await pool.query(
      'SELECT id FROM schema_migrations WHERE filename = $1', [file]
    )
    if (rows.length > 0) {
      console.log(`  ⏭  Skipping  ${file} (already applied)`)
      continue
    }

    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8')
    await pool.query(sql)
    await pool.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [file])
    console.log(`  ✅ Applied   ${file}`)
  }

  console.log('\n✨ All migrations complete.\n')
  await pool.end()
}

runMigrations().catch(err => {
  console.error('Migration failed:', err)
  process.exit(1)
})
