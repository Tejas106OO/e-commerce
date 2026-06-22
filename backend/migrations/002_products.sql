-- ============================================================
-- Migration 002: Categories & Products
-- ============================================================

CREATE TABLE IF NOT EXISTS categories (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        VARCHAR(100) NOT NULL UNIQUE,
  name        VARCHAR(150) NOT NULL,
  icon        VARCHAR(10),
  description TEXT,
  color       VARCHAR(10),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS brands (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       VARCHAR(150) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id       UUID        REFERENCES users(id) ON DELETE SET NULL,
  category_id     UUID        NOT NULL REFERENCES categories(id),
  brand_id        UUID        REFERENCES brands(id),
  name            VARCHAR(255) NOT NULL,
  slug            VARCHAR(300) NOT NULL UNIQUE,
  description     TEXT        NOT NULL,
  price           INTEGER     NOT NULL CHECK (price >= 0),       -- stored in paise (1/100 INR)
  original_price  INTEGER     CHECK (original_price >= 0),
  stock           INTEGER     NOT NULL DEFAULT 0 CHECK (stock >= 0),
  is_active       BOOLEAN     NOT NULL DEFAULT TRUE,
  is_featured     BOOLEAN     NOT NULL DEFAULT FALSE,
  is_deal         BOOLEAN     NOT NULL DEFAULT FALSE,
  specs           JSONB,
  sizes           TEXT[]      DEFAULT '{}',
  colors          TEXT[]      DEFAULT '{}',
  images          TEXT[]      DEFAULT '{}',
  rating_avg      NUMERIC(3,2) DEFAULT 0.00 CHECK (rating_avg BETWEEN 0 AND 5),
  review_count    INTEGER     NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
