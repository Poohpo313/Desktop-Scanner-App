ALTER TABLE admins ADD COLUMN IF NOT EXISTS departments TEXT[] DEFAULT '{}';

CREATE TABLE IF NOT EXISTS user_concerns (
  concern_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
  username VARCHAR(100) NOT NULL,
  concern_type VARCHAR(50) NOT NULL,
  category VARCHAR(100) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  email VARCHAR(255),
  rating INTEGER,
  company VARCHAR(255),
  department VARCHAR(255),
  status VARCHAR(30) DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_concerns_status ON user_concerns(status);
CREATE INDEX IF NOT EXISTS idx_user_concerns_company ON user_concerns(company);
CREATE INDEX IF NOT EXISTS idx_user_concerns_created_at ON user_concerns(created_at DESC);
