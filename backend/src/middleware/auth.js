const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_in_production'
const JWT_EXPIRES = process.env.JWT_EXPIRES || '7d'

/**
 * Sign a JWT for a user.
 */
function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES })
}

/**
 * Express middleware: verifies the Bearer token or httpOnly cookie.
 * Attaches req.user = { id, email, role } on success.
 */
function requireAuth(req, res, next) {
  const token =
    (req.headers.authorization || '').replace('Bearer ', '') ||
    req.cookies?.token

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required' })
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET)
    next()
  } catch (err) {
    const message = err.name === 'TokenExpiredError'
      ? 'Session expired — please log in again'
      : 'Invalid token'
    return res.status(401).json({ success: false, message })
  }
}

/**
 * Role-based access control middleware.
 * Usage: requireRole('admin') or requireRole('admin', 'seller')
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' })
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Insufficient permissions' })
    }
    next()
  }
}

module.exports = { signToken, requireAuth, requireRole }
