INSERT INTO roles (role_name)
SELECT 'user' WHERE NOT EXISTS (SELECT 1 FROM roles WHERE role_name = 'user');

INSERT INTO roles (role_name)
SELECT 'admin' WHERE NOT EXISTS (SELECT 1 FROM roles WHERE role_name = 'admin');

INSERT INTO roles (role_name)
SELECT 'superadmin' WHERE NOT EXISTS (SELECT 1 FROM roles WHERE role_name = 'superadmin');
