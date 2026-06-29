-- Offline PostgreSQL schema for Electron desktop app (local replica)

CREATE TABLE IF NOT EXISTS roles (
  role_id SERIAL PRIMARY KEY,
  role_name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS users (
  user_id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  email TEXT UNIQUE,
  phone_number TEXT,
  role_id INTEGER REFERENCES roles(role_id),
  account_status VARCHAR(20) DEFAULT 'inactive',
  serial_key TEXT,
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS serial_keys (
  serial_id SERIAL PRIMARY KEY,
  serial_key VARCHAR(60) UNIQUE NOT NULL,
  assigned_to INTEGER REFERENCES users(user_id),
  status VARCHAR(20) DEFAULT 'unused',
  generated_at TIMESTAMP DEFAULT NOW(),
  used_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS folders (
  folder_id SERIAL PRIMARY KEY,
  folder_name TEXT NOT NULL,
  parent_folder_id INTEGER REFERENCES folders(folder_id),
  created_by INTEGER REFERENCES users(user_id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS documents (
  document_id SERIAL PRIMARY KEY,
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type VARCHAR(20),
  file_size BIGINT,
  file_hash TEXT,
  ocr_text TEXT,
  uploaded_by INTEGER REFERENCES users(user_id),
  folder_id INTEGER REFERENCES folders(folder_id),
  upload_date TIMESTAMP DEFAULT NOW(),
  cloud_status VARCHAR(20) DEFAULT 'unsynced',
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS scan_history (
  scan_id SERIAL PRIMARY KEY,
  document_id INTEGER REFERENCES documents(document_id),
  scanned_by INTEGER REFERENCES users(user_id),
  scanned_date TIMESTAMP DEFAULT NOW(),
  scanner_device TEXT,
  status VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS devices (
  device_id SERIAL PRIMARY KEY,
  device_name TEXT,
  device_type TEXT,
  serial_number TEXT UNIQUE,
  assigned_user INTEGER REFERENCES users(user_id),
  status VARCHAR(20) DEFAULT 'active',
  last_seen TIMESTAMP
);

CREATE TABLE IF NOT EXISTS activity_logs (
  log_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id),
  action TEXT NOT NULL,
  details JSONB,
  timestamp TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cloud_sync (
  sync_id SERIAL PRIMARY KEY,
  document_id INTEGER REFERENCES documents(document_id),
  user_id INTEGER REFERENCES users(user_id),
  device_id INTEGER REFERENCES devices(device_id),
  sync_date TIMESTAMP,
  sync_status VARCHAR(20) DEFAULT 'pending',
  error_message TEXT,
  retry_count INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_serial_keys_serial_key ON serial_keys(serial_key);
CREATE INDEX IF NOT EXISTS idx_devices_last_seen ON devices(last_seen);
CREATE INDEX IF NOT EXISTS idx_documents_file_hash ON documents(file_hash);
CREATE INDEX IF NOT EXISTS idx_documents_ocr ON documents USING GIN (to_tsvector('english', coalesce(ocr_text, '')));

INSERT INTO roles (role_name)
SELECT 'user' WHERE NOT EXISTS (SELECT 1 FROM roles WHERE role_name = 'user');
INSERT INTO roles (role_name)
SELECT 'admin' WHERE NOT EXISTS (SELECT 1 FROM roles WHERE role_name = 'admin');
INSERT INTO roles (role_name)
SELECT 'superadmin' WHERE NOT EXISTS (SELECT 1 FROM roles WHERE role_name = 'superadmin');
