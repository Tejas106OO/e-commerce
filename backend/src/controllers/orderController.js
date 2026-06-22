const { query, getClient } = require('../config/db')

const COUPONS = {
  'WELCOME10': { discount: 10, type: 'percentage', minOrder: 999 },
  'LUXE20':    { discount: 20, type: 'percentage', minOrder: 4999 },
  'FLAT500':   { discount: 500, type: 'flat',      minOrder: 2999 },
}

function generateOrderNumber(seq) {
  return `LX-${new Date().getFullYear()}-${String(seq).padStart(5, '0')}`
}

/** POST /api/orders */
async function createOrder(req, res, next) {
  const client = await getClient()
  try {
    await client.query('BEGIN')

    const { shipping_address, coupon_code, payment_method = 'razorpay' } = req.body

    // 1. Get cart items
    const { rows: cartItems } = await client.query(`
      SELECT ci.quantity, ci.size, ci.color,
             p.id AS product_id, p.name, p.images[1] AS image,
             p.price, p.stock
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = $1 AND p.is_active = TRUE
    `, [req.user.id])

    if (cartItems.length === 0) {
      await client.query('ROLLBACK')
      return res.status(400).json({ success: false, message: 'Cart is empty' })
    }

    // 2. Validate stock & compute subtotal (in paise)
    let subtotal = 0
    for (const item of cartItems) {
      if (item.stock < item.quantity) {
        await client.query('ROLLBACK')
        return res.status(400).json({ success: false, message: `Insufficient stock for ${item.name}` })
      }
      subtotal += item.price * item.quantity
    }

    // 3. Apply coupon
    let discount = 0
    if (coupon_code) {
      const coupon = COUPONS[coupon_code.toUpperCase()]
      if (!coupon || subtotal / 100 < coupon.minOrder) {
        await client.query('ROLLBACK')
        return res.status(400).json({ success: false, message: 'Invalid or inapplicable coupon' })
      }
      discount = coupon.type === 'percentage'
        ? Math.round(subtotal * coupon.discount / 100)
        : coupon.discount * 100
    }

    const delivery_fee = subtotal >= 199900 ? 0 : 9900 // Free above ₹1999
    const total = subtotal - discount + delivery_fee

    // 4. Get sequence
    const { rows: seq } = await client.query("SELECT nextval('order_number_seq') AS n")
    const order_number = generateOrderNumber(seq[0].n)

    // 5. Create order record
    const { rows: orderRows } = await client.query(`
      INSERT INTO orders
        (order_number, user_id, subtotal, discount, delivery_fee, total,
         coupon_code, shipping_address, payment_method, status, payment_status)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'pending','pending')
      RETURNING *
    `, [order_number, req.user.id, subtotal, discount, delivery_fee, total,
        coupon_code || null, JSON.stringify(shipping_address), payment_method])

    const order = orderRows[0]

    // 6. Insert order items & decrement stock
    for (const item of cartItems) {
      await client.query(`
        INSERT INTO order_items (order_id, product_id, name, image, price, quantity, size, color)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      `, [order.id, item.product_id, item.name, item.image, item.price, item.quantity, item.size, item.color])

      await client.query(
        'UPDATE products SET stock = stock - $1 WHERE id = $2', [item.quantity, item.product_id]
      )
    }

    // 7. Clear cart
    await client.query('DELETE FROM cart_items WHERE user_id = $1', [req.user.id])

    await client.query('COMMIT')
    res.status(201).json({ success: true, order })
  } catch (err) {
    await client.query('ROLLBACK')
    next(err)
  } finally {
    client.release()
  }
}

/** GET /api/orders */
async function getOrders(req, res, next) {
  try {
    const { rows } = await query(`
      SELECT o.id, o.order_number, o.status, o.payment_status, o.total / 100.0 AS total,
             o.created_at,
             COUNT(oi.id) AS item_count
      FROM orders o
      JOIN order_items oi ON oi.order_id = o.id
      WHERE o.user_id = $1
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `, [req.user.id])
    res.json({ success: true, orders: rows })
  } catch (err) { next(err) }
}

/** GET /api/orders/:id */
async function getOrderById(req, res, next) {
  try {
    const { rows } = await query(
      'SELECT * FROM orders WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]
    )
    if (!rows[0]) return res.status(404).json({ success: false, message: 'Order not found' })

    const { rows: items } = await query(
      'SELECT * FROM order_items WHERE order_id = $1', [req.params.id]
    )
    res.json({ success: true, order: { ...rows[0], items } })
  } catch (err) { next(err) }
}

module.exports = { createOrder, getOrders, getOrderById }
