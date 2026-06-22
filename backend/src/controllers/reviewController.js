const { query } = require('../config/db')
const { cacheDel } = require('../config/redis')

/** POST /api/reviews */
async function createReview(req, res, next) {
  try {
    const { product_id, rating, title, body } = req.body

    // Check user actually purchased this product (verified review)
    const { rows: orderRows } = await query(`
      SELECT oi.id FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE oi.product_id = $1 AND o.user_id = $2 AND o.payment_status = 'paid'
      LIMIT 1
    `, [product_id, req.user.id])

    const is_verified = orderRows.length > 0

    const { rows } = await query(`
      INSERT INTO reviews (product_id, user_id, rating, title, body, is_verified)
      VALUES ($1,$2,$3,$4,$5,$6)
      ON CONFLICT (product_id, user_id)
      DO UPDATE SET rating = $3, title = $4, body = $5, updated_at = NOW()
      RETURNING *
    `, [product_id, req.user.id, rating, title, body, is_verified])

    await cacheDel(`product:${product_id}`)
    res.status(201).json({ success: true, review: rows[0] })
  } catch (err) { next(err) }
}

/** GET /api/reviews/:productId */
async function getProductReviews(req, res, next) {
  try {
    const { rows } = await query(`
      SELECT r.id, r.rating, r.title, r.body, r.is_verified, r.helpful_count, r.created_at,
             u.name AS user_name
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.product_id = $1 AND r.is_approved = TRUE
      ORDER BY r.created_at DESC
    `, [req.params.productId])
    res.json({ success: true, reviews: rows })
  } catch (err) { next(err) }
}

/** PATCH /api/reviews/:id/helpful */
async function markHelpful(req, res, next) {
  try {
    await query(
      'UPDATE reviews SET helpful_count = helpful_count + 1 WHERE id = $1',
      [req.params.id]
    )
    res.json({ success: true })
  } catch (err) { next(err) }
}

module.exports = { createReview, getProductReviews, markHelpful }
