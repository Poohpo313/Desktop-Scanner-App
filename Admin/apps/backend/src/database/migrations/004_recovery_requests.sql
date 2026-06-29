CREATE TABLE IF NOT EXISTS recovery_requests (
  request_id SERIAL PRIMARY KEY,
  request_type VARCHAR(40) NOT NULL,
  channel VARCHAR(20) NOT NULL,
  identifier TEXT NOT NULL,
  username TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recovery_requests_status ON recovery_requests(status);
CREATE INDEX IF NOT EXISTS idx_recovery_requests_type ON recovery_requests(request_type);
