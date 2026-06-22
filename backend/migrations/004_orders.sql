-- ============================================================
-- Migration 004: Orders & Order Items
-- ============================================================

CREATE TABLE IF NOT EXISTS orders (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number     VARCHAR(30) NOT NULL UNIQUE, -- e.g. LX-2025-00001
  user_id          UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  status           VARCHAR(30) NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending','processing','shipped','out_for_delivery','delivered','cancelled','refunded')),
  subtotal         INTEGER     NOT NULL CHECK (subtotal >= 0),
  discount         INTEGER     NOT NULL DEFAULT 0 CHECK (discount >= 0),
  delivery_fee     INTEGER     NOT NULL DEFAULT 0 CHECK (delivery_fee >= 0),
  total            INTEGER     NOT NULL CHECK (total >= 0),
  coupon_code      VARCHAR(50),
  shipping_address JSONB       NOT NULL,
  payment_status   VARCHAR(20) NOT NULL DEFAULT 'pending'
                     CHECK (payment_status IN ('pending','paid','failed','refunded')),
  payment_method   VARCHAR(30),
  razorpay_order_id   TEXT,
  razorpay_payment_id TEXT,
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID    NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id  UUID    REFERENCES products(id) ON DELETE SET NULL,
  name        VARCHAR(255) NOT NULL,  -- snapshot at time of order
  image       TEXT,
  price       INTEGER NOT NULL,       -- snapshot in paise
  quantity    INTEGER NOT NULL CHECK (quantity > 0),
  size        VARCHAR(50),
  color       VARCHAR(50)
);

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Sequence for readable order numbers
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1000;
