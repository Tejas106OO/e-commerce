const bcrypt = require('bcryptjs')
const { query } = require('../config/db')
const { signToken } = require('../middleware/auth')

const SALT_ROUNDS = 12

/**
 * POST /api/auth/register
 */
async function register(req, res, next) {
  try {
    const { name, email, password, role } = req.body

    // Check existing user
    const existing = await query('SELECT id FROM users WHERE email = $1', [email])
    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'Email already registered' })
    }

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS)

    const { rows } = await query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, created_at`,
      [name, email, password_hash, role || 'customer']
    )

    const user = rows[0]
    const token = signToken({ id: user.id, email: user.email, role: user.role })

    res
      .cookie('token', token, {
        httpOnly: true, secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000
      })
      .status(201)
      .json({ success: true, token, user })
  } catch (err) { next(err) }
}

/**
 * POST /api/auth/login
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body

    const { rows } = await query(
      'SELECT id, name, email, role, password_hash, is_active FROM users WHERE email = $1',
      [email]
    )

    const user = rows[0]
    if (!user || !user.is_active) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' })
    }

    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' })
    }

    const token = signToken({ id: user.id, email: user.email, role: user.role })
    const { password_hash: _, ...safeUser } = user

    res
      .cookie('token', token, {
        httpOnly: true, secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000
      })
      .json({ success: true, token, user: safeUser })
  } catch (err) { next(err) }
}

/**
 * POST /api/auth/logout
 */
function logout(_req, res) {
  res.clearCookie('token').json({ success: true, message: 'Logged out' })
}

/**
 * GET /api/auth/me
 */
async function me(req, res, next) {
  try {
    const { rows } = await query(
      `SELECT id, name, email, phone, role, avatar_url, created_at
       FROM users WHERE id = $1`,
      [req.user.id]
    )
    if (!rows[0]) return res.status(404).json({ success: false, message: 'User not found' })
    res.json({ success: true, user: rows[0] })
  } catch (err) { next(err) }
}

/**
 * PATCH /api/auth/me
 */
async function updateProfile(req, res, next) {
  try {
    const { name, phone } = req.body
    const { rows } = await query(
      `UPDATE users SET name = COALESCE($1, name), phone = COALESCE($2, phone)
       WHERE id = $3
       RETURNING id, name, email, phone, role`,
      [name, phone, req.user.id]
    )
    res.json({ success: true, user: rows[0] })
  } catch (err) { next(err) }
}

module.exports = { register, login, logout, me, updateProfile }
