-- ============================================================
-- Migration 007: Performance Indexes
-- ============================================================

-- Products: most common query patterns
CREATE INDEX IF NOT EXISTS idx_products_category   ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_price      ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_rating     ON products(rating_avg DESC);
CREATE INDEX IF NOT EXISTS idx_products_featured   ON products(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_products_active     ON products(is_active)   WHERE is_active   = TRUE;
CREATE INDEX IF NOT EXISTS idx_products_seller     ON products(seller_id);

-- Full-text search on product name + description
CREATE INDEX IF NOT EXISTS idx_products_fts
  ON products USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- Orders
CREATE INDEX IF NOT EXISTS idx_orders_user        ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status      ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created     ON orders(created_at DESC);

-- Reviews
CREATE INDEX IF NOT EXISTS idx_reviews_product    ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user       ON reviews(user_id);

-- Cart
CREATE INDEX IF NOT EXISTS idx_cart_user          ON cart_items(user_id);

-- Audit
CREATE INDEX IF NOT EXISTS idx_audit_user         ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_created      ON audit_logs(created_at DESC);
