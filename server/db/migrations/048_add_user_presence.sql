ALTER TABLE portal.users
  ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_portal_users_last_seen_at
  ON portal.users(last_seen_at);