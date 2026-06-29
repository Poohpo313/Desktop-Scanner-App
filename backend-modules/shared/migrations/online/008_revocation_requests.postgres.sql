CREATE TABLE IF NOT EXISTS revocation_requests (
  request_id SERIAL PRIMARY KEY,
  request_type VARCHAR(20) NOT NULL CHECK (request_type IN ('key', 'device')),
  target_id INTEGER NOT NULL,
  reason TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  requested_by INTEGER REFERENCES admins(admin_id),
  resolved_by INTEGER REFERENCES admins(admin_id),
  created_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_revocation_requests_status ON revocation_requests(status);
CREATE INDEX IF NOT EXISTS idx_revocation_requests_type ON revocation_requests(request_type);
