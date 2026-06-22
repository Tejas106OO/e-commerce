const { query } = require('../config/db')
const { uploadProduct } = require('../config/cloudinary')
const { cacheDel } = require('../config/redis')
const express = require('express')

/** GET /api/seller/products */
async function getSellerProducts(req, res, next) {
  try {
    const { rows } = await query(`
      SELECT p.id, p.name, p.price / 100.0 AS price, p.stock,
             p.rating_avg AS rating, p.review_count AS reviews,
             p.is_active, p.images[1] AS image, c.name AS category
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.seller_id = $1
      ORDER BY p.created_at DESC
    `, [req.user.id])
    res.json({ success: true, products: rows })
  } catch (err) { next(err) }
}

/** GET /api/seller/stats */
async function getSellerStats(req, res, next) {
  try {
    const [products, orders, revenue] = await Promise.all([
      query('SELECT COUNT(*) FROM products WHERE seller_id = $1 AND is_active = TRUE', [req.user.id]),
      query(`SELECT COUNT(DISTINCT o.id) FROM orders o
             JOIN order_items oi ON oi.order_id = o.id
             JOIN products p ON oi.product_id = p.id
             WHERE p.seller_id = $1 AND o.payment_status = 'paid'`, [req.user.id]),
      query(`SELECT COALESCE(SUM(oi.price * oi.quantity), 0) AS total
             FROM order_items oi JOIN products p ON oi.product_id = p.id
             JOIN orders o ON oi.order_id = o.id
             WHERE p.seller_id = $1 AND o.payment_status = 'paid'`, [req.user.id])
    ])
    res.json({
      success: true,
      stats: {
        products: parseInt(products.rows[0].count),
        orders:   parseInt(orders.rows[0].count),
        revenue:  parseFloat(revenue.rows[0].total) / 100
      }
    })
  } catch (err) { next(err) }
}

/** POST /api/seller/products */
async function createProduct(req, res, next) {
  try {
    const { name, description, price, original_price, stock, category_id, sizes, colors, specs } = req.body
    const images = req.files?.map(f => f.path) || []

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now()

    const { rows } = await query(`
      INSERT INTO products
        (seller_id, category_id, name, slug, description, price, original_price, stock, images, sizes, colors, specs)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      RETURNING id, name, price / 100.0 AS price
    `, [
      req.user.id, category_id, name, slug, description,
      Math.round(price * 100), Math.round((original_price || price) * 100),
      stock, images,
      Array.isArray(sizes) ? sizes : JSON.parse(sizes || '[]'),
      Array.isArray(colors) ? colors : JSON.parse(colors || '[]'),
      typeof specs === 'object' ? specs : JSON.parse(specs || '{}')
    ])

    await cacheDel(['categories'])
    res.status(201).json({ success: true, product: rows[0] })
  } catch (err) { next(err) }
}

/** PATCH /api/seller/products/:id */
async function updateProduct(req, res, next) {
  try {
    const { name, description, price, stock, is_active } = req.body
    const { rows } = await query(`
      UPDATE products
      SET name = COALESCE($1, name),
          description = COALESCE($2, description),
          price = COALESCE($3, price),
          stock = COALESCE($4, stock),
          is_active = COALESCE($5, is_active),
          updated_at = NOW()
      WHERE id = $6 AND seller_id = $7
      RETURNING id, name, price / 100.0 AS price, stock, is_active
    `, [name, description, price ? Math.round(price * 100) : null, stock, is_active, req.params.id, req.user.id])

    if (!rows[0]) return res.status(404).json({ success: false, message: 'Product not found' })
    await cacheDel([`product:${req.params.id}`])
    res.json({ success: true, product: rows[0] })
  } catch (err) { next(err) }
}

/** GET /api/seller/orders */
async function getSellerOrders(req, res, next) {
  try {
    const { rows } = await query(`
      SELECT DISTINCT o.id, o.order_number, o.status, o.created_at,
             o.total / 100.0 AS total, u.name AS customer_name
      FROM orders o
      JOIN order_items oi ON oi.order_id = o.id
      JOIN products p ON oi.product_id = p.id
      JOIN users u ON o.user_id = u.id
      WHERE p.seller_id = $1
      ORDER BY o.created_at DESC
    `, [req.user.id])
    res.json({ success: true, orders: rows })
  } catch (err) { next(err) }
}

module.exports = { getSellerProducts, getSellerStats, createProduct, updateProduct, getSellerOrders }
