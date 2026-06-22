const { query } = require('../config/db')
const { cacheGet, cacheSet, cacheDel } = require('../config/redis')

const PAGE_SIZE = 12

/**
 * GET /api/products
 * Supports: category, brand, minPrice, maxPrice, sort, search, page, featured, deal
 */
async function getProducts(req, res, next) {
  try {
    const {
      category, brand, minPrice, maxPrice,
      sort = 'created_at_desc', search, page = 1,
      featured, deal
    } = req.query

    const cacheKey = `products:${JSON.stringify(req.query)}`
    const cached = await cacheGet(cacheKey)
    if (cached) return res.json({ success: true, ...cached, cached: true })

    // Build WHERE clauses — all parameterized to prevent SQL injection
    const conditions = ['p.is_active = TRUE']
    const params = []
    let paramIdx = 1

    if (category) {
      conditions.push(`c.slug = $${paramIdx++}`)
      params.push(category)
    }
    if (brand) {
      conditions.push(`b.name ILIKE $${paramIdx++}`)
      params.push(`%${brand}%`)
    }
    if (minPrice) {
      conditions.push(`p.price >= $${paramIdx++}`)
      params.push(Number(minPrice) * 100) // convert to paise
    }
    if (maxPrice) {
      conditions.push(`p.price <= $${paramIdx++}`)
      params.push(Number(maxPrice) * 100)
    }
    if (featured === 'true') {
      conditions.push('p.is_featured = TRUE')
    }
    if (deal === 'true') {
      conditions.push('p.is_deal = TRUE')
    }
    if (search) {
      conditions.push(`to_tsvector('english', p.name || ' ' || COALESCE(p.description,'')) @@ plainto_tsquery('english', $${paramIdx++})`)
      params.push(search)
    }

    const where = conditions.join(' AND ')

    // Sort mapping
    const sortMap = {
      price_asc: 'p.price ASC',
      price_desc: 'p.price DESC',
      rating_desc: 'p.rating_avg DESC',
      newest: 'p.created_at DESC',
      created_at_desc: 'p.created_at DESC',
      popular: 'p.review_count DESC'
    }
    const orderBy = sortMap[sort] || 'p.created_at DESC'

    const offset = (Number(page) - 1) * PAGE_SIZE

    const dataQuery = `
      SELECT
        p.id, p.name, p.slug, p.description,
        p.price / 100.0 AS price,
        p.original_price / 100.0 AS original_price,
        p.stock, p.images, p.sizes, p.colors, p.specs,
        p.rating_avg AS rating, p.review_count AS reviews,
        p.is_featured, p.is_deal,
        c.slug AS category, c.name AS category_name,
        b.name AS brand
      FROM products p
      JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE ${where}
      ORDER BY ${orderBy}
      LIMIT ${PAGE_SIZE} OFFSET ${offset}
    `

    const countQuery = `
      SELECT COUNT(*) FROM products p
      JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE ${where}
    `

    const [dataRes, countRes] = await Promise.all([
      query(dataQuery, params),
      query(countQuery, params)
    ])

    const total = parseInt(countRes.rows[0].count)
    const payload = {
      products: dataRes.rows,
      pagination: {
        page: Number(page),
        pageSize: PAGE_SIZE,
        total,
        totalPages: Math.ceil(total / PAGE_SIZE)
      }
    }

    await cacheSet(cacheKey, payload, 120) // 2-minute cache
    res.json({ success: true, ...payload })
  } catch (err) { next(err) }
}

/**
 * GET /api/products/:id
 */
async function getProductById(req, res, next) {
  try {
    const cacheKey = `product:${req.params.id}`
    const cached = await cacheGet(cacheKey)
    if (cached) return res.json({ success: true, product: cached })

    const { rows } = await query(`
      SELECT
        p.id, p.name, p.slug, p.description,
        p.price / 100.0 AS price,
        p.original_price / 100.0 AS original_price,
        p.stock, p.images, p.sizes, p.colors, p.specs,
        p.rating_avg AS rating, p.review_count AS reviews,
        p.is_featured, p.is_deal,
        c.slug AS category, c.name AS category_name,
        b.name AS brand
      FROM products p
      JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE p.id = $1 AND p.is_active = TRUE
    `, [req.params.id])

    if (!rows[0]) return res.status(404).json({ success: false, message: 'Product not found' })

    await cacheSet(cacheKey, rows[0], 300)
    res.json({ success: true, product: rows[0] })
  } catch (err) { next(err) }
}

/**
 * GET /api/products/categories
 */
async function getCategories(req, res, next) {
  try {
    const cached = await cacheGet('categories')
    if (cached) return res.json({ success: true, categories: cached })

    const { rows } = await query('SELECT * FROM categories ORDER BY name')
    await cacheSet('categories', rows, 3600)
    res.json({ success: true, categories: rows })
  } catch (err) { next(err) }
}

module.exports = { getProducts, getProductById, getCategories }
