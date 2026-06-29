ALTER TABLE users
  ADD COLUMN IF NOT EXISTS admin_contact_name TEXT,
  ADD COLUMN IF NOT EXISTS admin_contact_email TEXT,
  ADD COLUMN IF NOT EXISTS admin_contact_phone TEXT,
  ADD COLUMN IF NOT EXISTS contact_saved_by_user BOOLEAN DEFAULT false;

ALTER TABLE serial_keys
  ADD COLUMN IF NOT EXISTS company TEXT,
  ADD COLUMN IF NOT EXISTS department TEXT;
