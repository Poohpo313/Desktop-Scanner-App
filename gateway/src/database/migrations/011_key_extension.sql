ALTER TABLE serial_keys
  ADD COLUMN IF NOT EXISTS duration_days INTEGER,
  ADD COLUMN IF NOT EXISTS extended_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS extension_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS extension_status VARCHAR(20),
  ADD COLUMN IF NOT EXISTS renewal_status VARCHAR(20),
  ADD COLUMN IF NOT EXISTS trial BOOLEAN NOT NULL DEFAULT false;

UPDATE serial_keys
SET duration_days = GREATEST(
  1,
  CEIL(EXTRACT(EPOCH FROM (expires_at - generated_at)) / 86400.0)::INTEGER
)
WHERE duration_days IS NULL
  AND expires_at IS NOT NULL
  AND generated_at IS NOT NULL;

CREATE TABLE IF NOT EXISTS extension_requests (
  request_id SERIAL PRIMARY KEY,
  serial_key_id INTEGER NOT NULL REFERENCES serial_keys(serial_id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  admin_id INTEGER REFERENCES admins(admin_id),
  type VARCHAR(20) NOT NULL CHECK (type IN ('extension', 'renewal')),
  requested_days INTEGER NOT NULL CHECK (requested_days > 0),
  status VARCHAR(30) NOT NULL DEFAULT 'pending_admin'
    CHECK (status IN ('pending_admin', 'pending_superadmin', 'approved', 'rejected')),
  user_note TEXT,
  admin_note TEXT,
  superadmin_note TEXT,
  requested_at TIMESTAMP NOT NULL DEFAULT NOW(),
  forwarded_at TIMESTAMP,
  resolved_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_extension_requests_status ON extension_requests(status);
CREATE INDEX IF NOT EXISTS idx_extension_requests_user ON extension_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_extension_requests_serial ON extension_requests(serial_key_id);

CREATE TABLE IF NOT EXISTS stored_notifications (
  notification_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
  admin_id INTEGER REFERENCES admins(admin_id) ON DELETE CASCADE,
  role_target VARCHAR(20) NOT NULL CHECK (role_target IN ('user', 'admin', 'superadmin')),
  company TEXT,
  department TEXT,
  event_type VARCHAR(64) NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  payload JSONB,
  read_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stored_notifications_user ON stored_notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stored_notifications_admin ON stored_notifications(admin_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stored_notifications_role ON stored_notifications(role_target, created_at DESC);
