-- ============================================================
-- Migration 006: Audit Log (tamper-evident logging)
-- ============================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id          BIGSERIAL   PRIMARY KEY,
  user_id     UUID        REFERENCES users(id) ON DELETE SET NULL,
  action      VARCHAR(100) NOT NULL,  -- e.g. 'order.created', 'user.login'
  entity_type VARCHAR(50),
  entity_id   TEXT,
  metadata    JSONB,
  ip_address  INET,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Prevent any update/delete on audit_logs (append-only)
CREATE RULE no_update_audit AS ON UPDATE TO audit_logs DO INSTEAD NOTHING;
CREATE RULE no_delete_audit AS ON DELETE TO audit_logs DO INSTEAD NOTHING;

-- Wishlist table
CREATE TABLE IF NOT EXISTS wishlists (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, product_id)
);
