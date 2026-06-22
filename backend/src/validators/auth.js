const { z } = require('zod')

const registerSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  email: z.string().email().toLowerCase(),
  password: z.string().min(8).max(72),
  role: z.enum(['customer', 'seller']).optional().default('customer')
})

const loginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1)
})

const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(8).max(72)
})

module.exports = { registerSchema, loginSchema, changePasswordSchema }
