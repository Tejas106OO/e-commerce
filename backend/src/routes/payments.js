const express = require('express')
const { requireAuth } = require('../middleware/auth')
const { paymentRateLimiter } = require('../middleware/rateLimiter')
const { createRazorpayOrder, verifyPayment } = require('../controllers/paymentController')
const router = express.Router()

router.use(requireAuth)
router.post('/create-order', paymentRateLimiter, createRazorpayOrder)
router.post('/verify',       paymentRateLimiter, verifyPayment)

module.exports = router
