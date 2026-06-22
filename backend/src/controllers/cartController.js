const { query } = require('../config/db')

/** GET /api/cart */
async function getCart(req, res, next) {
  try {
    const { rows } = await query(`
      SELECT
        ci.id, ci.quantity, ci.size, ci.color,
        p.id AS product_id, p.name, p.images[1] AS image,
        p.price / 100.0 AS price,
        p.stock
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = $1
      ORDER BY ci.created_at
    `, [req.user.id])
    res.json({ success: true, items: rows })
  } catch (err) { next(err) }
}

/** POST /api/cart */
async function addToCart(req, res, next) {
  try {
    const { product_id, quantity = 1, size, color } = req.body

    // Validate stock
    const { rows: stock } = await query(
      'SELECT stock FROM products WHERE id = $1 AND is_active = TRUE', [product_id]
    )
    if (!stock[0]) return res.status(404).json({ success: false, message: 'Product not found' })
    if (stock[0].stock < quantity) return res.status(400).json({ success: false, message: 'Insufficient stock' })

    // Upsert cart item
    const { rows } = await query(`
      INSERT INTO cart_items (user_id, product_id, quantity, size, color)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (user_id, product_id, size, color)
      DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity, updated_at = NOW()
      RETURNING *
    `, [req.user.id, product_id, quantity, size || null, color || null])

    res.status(201).json({ success: true, item: rows[0] })
  } catch (err) { next(err) }
}

/** PATCH /api/cart/:id */
async function updateCartItem(req, res, next) {
  try {
    const { quantity } = req.body
    if (quantity < 1) {
      // Delete if 0
      await query('DELETE FROM cart_items WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id])
      return res.json({ success: true, message: 'Item removed' })
    }
    const { rows } = await query(
      'UPDATE cart_items SET quantity = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
      [quantity, req.params.id, req.user.id]
    )
    res.json({ success: true, item: rows[0] })
  } catch (err) { next(err) }
}

/** DELETE /api/cart/:id */
async function removeFromCart(req, res, next) {
  try {
    await query('DELETE FROM cart_items WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id])
    res.json({ success: true, message: 'Removed from cart' })
  } catch (err) { next(err) }
}

/** DELETE /api/cart */
async function clearCart(req, res, next) {
  try {
    await query('DELETE FROM cart_items WHERE user_id = $1', [req.user.id])
    res.json({ success: true, message: 'Cart cleared' })
  } catch (err) { next(err) }
}

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart }
