-- ============================================================
-- Migration 001: Users
-- Roles: customer | seller | admin
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(150) NOT NULL,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT        NOT NULL,
  phone         VARCHAR(20),
  role          VARCHAR(20)  NOT NULL DEFAULT 'customer'
                  CHECK (role IN ('customer', 'seller', 'admin')),
  avatar_url    TEXT,
  is_active     BOOLEAN     NOT NULL DEFAULT TRUE,
  email_verified BOOLEAN    NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS addresses (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label      VARCHAR(50) NOT NULL DEFAULT 'Home',
  street     TEXT        NOT NULL,
  city       VARCHAR(100) NOT NULL,
  state      VARCHAR(100) NOT NULL,
  pincode    VARCHAR(10) NOT NULL,
  is_default BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
