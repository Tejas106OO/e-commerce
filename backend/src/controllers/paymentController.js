const Razorpay = require('razorpay')
const crypto = require('crypto')
const { query } = require('../config/db')

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
})

/**
 * POST /api/payments/create-order
 * Creates a Razorpay order for a given LUXE order.
 */
async function createRazorpayOrder(req, res, next) {
  try {
    const { order_id } = req.body

    const { rows } = await query(
      'SELECT total, order_number FROM orders WHERE id = $1 AND user_id = $2',
      [order_id, req.user.id]
    )
    if (!rows[0]) return res.status(404).json({ success: false, message: 'Order not found' })

    const order = rows[0]
    const razorpayOrder = await razorpay.orders.create({
      amount: parseInt(order.total), // amount in paise
      currency: 'INR',
      receipt: order.order_number,
      notes: { luxe_order_id: order_id }
    })

    // Store Razorpay order ID
    await query(
      'UPDATE orders SET razorpay_order_id = $1 WHERE id = $2',
      [razorpayOrder.id, order_id]
    )

    res.json({
      success: true,
      razorpay_order_id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key_id: process.env.RAZORPAY_KEY_ID
    })
  } catch (err) { next(err) }
}

/**
 * POST /api/payments/verify
 * Verifies the Razorpay HMAC signature to prevent payment fraud.
 */
async function verifyPayment(req, res, next) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id } = req.body

    // HMAC-SHA256 verification
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex')

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed' })
    }

    // Mark order as paid
    await query(`
      UPDATE orders
      SET payment_status = 'paid',
          status = 'processing',
          razorpay_payment_id = $1
      WHERE id = $2 AND user_id = $3
    `, [razorpay_payment_id, order_id, req.user.id])

    res.json({ success: true, message: 'Payment verified — order confirmed' })
  } catch (err) { next(err) }
}

module.exports = { createRazorpayOrder, verifyPayment }
