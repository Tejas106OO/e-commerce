-- ============================================================
-- Migration 005: Reviews
-- ============================================================

CREATE TABLE IF NOT EXISTS reviews (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating      SMALLINT    NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title       VARCHAR(200),
  body        TEXT,
  is_verified BOOLEAN     NOT NULL DEFAULT FALSE, -- purchased the item
  is_approved BOOLEAN     NOT NULL DEFAULT TRUE,  -- admin moderation
  helpful_count INTEGER   NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (product_id, user_id)  -- one review per product per user
);

CREATE TRIGGER reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Automatically update product rating stats on review insert/update/delete
CREATE OR REPLACE FUNCTION refresh_product_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products
  SET
    rating_avg   = (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE product_id = COALESCE(NEW.product_id, OLD.product_id) AND is_approved = TRUE),
    review_count = (SELECT COUNT(*) FROM reviews WHERE product_id = COALESCE(NEW.product_id, OLD.product_id) AND is_approved = TRUE)
  WHERE id = COALESCE(NEW.product_id, OLD.product_id);
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_review_change
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION refresh_product_rating();
