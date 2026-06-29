-- Default super admin account (PIN: 123456). Change immediately after first login.
INSERT INTO admins (username, password_hash, pin_hash, role_id, account_status, first_name, last_name)
SELECT
  'superadmin',
  '$argon2id$v=19$m=65536,t=3,p=4$65GHU391NOkbpez1qAsRrg$S7/xo1Xto5ga2qMb56e+1tfjwwLJNhN687UFF385W8o',
  '$argon2id$v=19$m=65536,t=3,p=4$65GHU391NOkbpez1qAsRrg$S7/xo1Xto5ga2qMb56e+1tfjwwLJNhN687UFF385W8o',
  (SELECT role_id FROM roles WHERE role_name = 'superadmin' LIMIT 1),
  'active',
  'Super',
  'Admin'
WHERE NOT EXISTS (SELECT 1 FROM admins WHERE username = 'superadmin');
