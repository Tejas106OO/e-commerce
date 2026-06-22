/**
 * Centralised error handler.
 * Must be the LAST middleware registered in Express (4 args).
 */
function errorHandler(err, req, res, _next) {
  // Log full error in non-production
  if (process.env.NODE_ENV !== 'production') {
    console.error('[Error]', err)
  } else {
    console.error('[Error]', err.message)
  }

  // PostgreSQL unique-constraint violation
  if (err.code === '23505') {
    return res.status(409).json({ success: false, message: 'Resource already exists' })
  }
  // PostgreSQL foreign-key violation
  if (err.code === '23503') {
    return res.status(400).json({ success: false, message: 'Referenced resource not found' })
  }
  // Multer file errors
  if (err.name === 'MulterError') {
    return res.status(400).json({ success: false, message: err.message })
  }
  // JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' })
  }

  const status = err.statusCode || err.status || 500
  const message = status < 500
    ? err.message
    : process.env.NODE_ENV === 'production'
      ? 'An internal server error occurred'
      : err.message

  res.status(status).json({ success: false, message })
}

module.exports = errorHandler
