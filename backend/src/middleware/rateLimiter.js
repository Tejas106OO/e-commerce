const rateLimit = require('express-rate-limit')

const windowMs = 15 * 60 * 1000 // 15 minutes

/** Global limiter — applied to all routes */
const globalRateLimiter = rateLimit({
  windowMs,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests — please try again later' }
})

/** Strict limiter for auth endpoints (login/register) */
const authRateLimiter = rateLimit({
  windowMs,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many auth attempts — please wait 15 minutes' },
  skipSuccessfulRequests: true  // only count failures
})

/** Strict limiter for payment endpoints */
const paymentRateLimiter = rateLimit({
  windowMs,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many payment requests' }
})

module.exports = { globalRateLimiter, authRateLimiter, paymentRateLimiter }
