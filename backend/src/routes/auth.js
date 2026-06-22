const express = require('express')
const { requireAuth } = require('../middleware/auth')
const { authRateLimiter } = require('../middleware/rateLimiter')
const { validate } = require('../middleware/validate')
const { registerSchema, loginSchema } = require('../validators/auth')
const { register, login, logout, me, updateProfile } = require('../controllers/authController')

const router = express.Router()

router.post('/register', authRateLimiter, validate(registerSchema), register)
router.post('/login',    authRateLimiter, validate(loginSchema),    login)
router.post('/logout',   requireAuth, logout)
router.get('/me',        requireAuth, me)
router.patch('/me',      requireAuth, updateProfile)

module.exports = router
