const { ZodError } = require('zod')

/**
 * Middleware factory that validates req.body against a Zod schema.
 * Returns 400 with field-level error details on failure.
 */
function validate(schema) {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body)
      next()
    } catch (err) {
      if (err instanceof ZodError) {
        const errors = err.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message
        }))
        return res.status(400).json({ success: false, message: 'Validation failed', errors })
      }
      next(err)
    }
  }
}

module.exports = { validate }
