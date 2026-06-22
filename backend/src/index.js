require('dotenv').config()
const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const morgan = require('morgan')

const { globalRateLimiter } = require('./middleware/rateLimiter')
const errorHandler = require('./middleware/errorHandler')

// Routes
const authRoutes = require('./routes/auth')
const productRoutes = require('./routes/products')
const cartRoutes = require('./routes/cart')
const orderRoutes = require('./routes/orders')
const paymentRoutes = require('./routes/payments')
const reviewRoutes = require('./routes/reviews')
const adminRoutes = require('./routes/admin')
const sellerRoutes = require('./routes/seller')

const app = express()

// ── Security headers ──────────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}))

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173').split(',')
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true)
    cb(new Error(`CORS blocked: ${origin}`))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token']
}))

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(cookieParser())

// ── Logging ───────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'))
}

// ── Global rate limiter ───────────────────────────────────────────────────────
app.use(globalRateLimiter)

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  })
})

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/seller', sellerRoutes)

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' })
})

// ── Global error handler ──────────────────────────────────────────────────────
app.use(errorHandler)

// ── Start server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`\n🚀 LUXE Backend running on http://localhost:${PORT}`)
    console.log(`   Environment : ${process.env.NODE_ENV || 'development'}`)
    console.log(`   DB Pool     : ${process.env.DATABASE_URL ? 'Connected' : 'NOT configured'}`)
    console.log(`   Redis       : ${process.env.REDIS_URL ? 'Connected' : 'NOT configured'}\n`)
  })
}

module.exports = app
