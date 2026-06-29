-- Primary workstation per user + nested unauthorized secondary devices
ALTER TABLE devices
  ADD COLUMN IF NOT EXISTS is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS parent_device_id INTEGER REFERENCES devices(device_id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS warning_note TEXT;

CREATE INDEX IF NOT EXISTS idx_devices_parent ON devices(parent_device_id);
CREATE INDEX IF NOT EXISTS idx_devices_assigned_primary
  ON devices(assigned_user, is_primary)
  WHERE is_primary = TRUE;

-- Existing workstation rows become primary when they are the only device for a user.
UPDATE devices d
SET is_primary = TRUE
WHERE d.device_type = 'workstation'
  AND d.parent_device_id IS NULL
  AND NOT EXISTS (
    SELECT 1
    FROM devices other
    WHERE other.assigned_user = d.assigned_user
      AND other.device_id <> d.device_id
      AND other.device_type = 'workstation'
  );
