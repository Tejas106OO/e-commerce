const { query } = require('../config/db')

/** GET /api/admin/stats */
async function getDashboardStats(req, res, next) {
  try {
    const [users, products, orders, revenue] = await Promise.all([
      query("SELECT COUNT(*) FROM users WHERE role = 'customer'"),
      query('SELECT COUNT(*) FROM products WHERE is_active = TRUE'),
      query("SELECT COUNT(*) FROM orders WHERE status != 'cancelled'"),
      query("SELECT COALESCE(SUM(total),0) AS total FROM orders WHERE payment_status = 'paid'")
    ])
    res.json({
      success: true,
      stats: {
        customers:  parseInt(users.rows[0].count),
        products:   parseInt(products.rows[0].count),
        orders:     parseInt(orders.rows[0].count),
        revenue:    parseFloat(revenue.rows[0].total) / 100
      }
    })
  } catch (err) { next(err) }
}

/** GET /api/admin/users */
async function getUsers(req, res, next) {
  try {
    const { page = 1, role, search } = req.query
    const PAGE = 20
    const conditions = []
    const params = []
    let idx = 1
    if (role) { conditions.push(`role = $${idx++}`); params.push(role) }
    if (search) { conditions.push(`(name ILIKE $${idx} OR email ILIKE $${idx++})`); params.push(`%${search}%`) }
    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : ''
    const offset = (Number(page) - 1) * PAGE
    const { rows } = await query(
      `SELECT id, name, email, role, is_active, created_at FROM users ${where} ORDER BY created_at DESC LIMIT ${PAGE} OFFSET ${offset}`,
      params
    )
    res.json({ success: true, users: rows })
  } catch (err) { next(err) }
}

/** PATCH /api/admin/users/:id */
async function updateUser(req, res, next) {
  try {
    const { role, is_active } = req.body
    const { rows } = await query(
      `UPDATE users SET role = COALESCE($1, role), is_active = COALESCE($2, is_active) WHERE id = $3 RETURNING id, name, email, role, is_active`,
      [role, is_active, req.params.id]
    )
    res.json({ success: true, user: rows[0] })
  } catch (err) { next(err) }
}

/** GET /api/admin/orders */
async function getAllOrders(req, res, next) {
  try {
    const { status, page = 1 } = req.query
    const PAGE = 25
    const params = []
    let where = ''
    if (status) { where = 'WHERE o.status = $1'; params.push(status) }
    const offset = (Number(page) - 1) * PAGE
    const { rows } = await query(
      `SELECT o.id, o.order_number, o.status, o.payment_status,
              o.total / 100.0 AS total, o.created_at,
              u.name AS customer_name, u.email AS customer_email
       FROM orders o JOIN users u ON o.user_id = u.id
       ${where} ORDER BY o.created_at DESC LIMIT ${PAGE} OFFSET ${offset}`,
      params
    )
    res.json({ success: true, orders: rows })
  } catch (err) { next(err) }
}

/** PATCH /api/admin/orders/:id/status */
async function updateOrderStatus(req, res, next) {
  try {
    const { status } = req.body
    const { rows } = await query(
      `UPDATE orders SET status = $1 WHERE id = $2 RETURNING id, order_number, status`,
      [status, req.params.id]
    )
    res.json({ success: true, order: rows[0] })
  } catch (err) { next(err) }
}

/** DELETE /api/admin/products/:id */
async function deleteProduct(req, res, next) {
  try {
    await query('UPDATE products SET is_active = FALSE WHERE id = $1', [req.params.id])
    res.json({ success: true, message: 'Product deactivated' })
  } catch (err) { next(err) }
}

/** PATCH /api/admin/reviews/:id */
async function moderateReview(req, res, next) {
  try {
    const { is_approved } = req.body
    await query('UPDATE reviews SET is_approved = $1 WHERE id = $2', [is_approved, req.params.id])
    res.json({ success: true })
  } catch (err) { next(err) }
}

module.exports = { getDashboardStats, getUsers, updateUser, getAllOrders, updateOrderStatus, deleteProduct, moderateReview }
