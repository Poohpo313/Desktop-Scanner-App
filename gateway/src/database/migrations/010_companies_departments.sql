-- Normalized organization tables (text company/department columns remain for compatibility)

CREATE TABLE IF NOT EXISTS companies (
  company_id SERIAL PRIMARY KEY,
  company_name VARCHAR(255) NOT NULL UNIQUE,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS departments (
  department_id SERIAL PRIMARY KEY,
  department_name VARCHAR(255) NOT NULL,
  company_id INTEGER NOT NULL REFERENCES companies(company_id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (company_id, department_name)
);

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS company_id INTEGER REFERENCES companies(company_id),
  ADD COLUMN IF NOT EXISTS department_id INTEGER REFERENCES departments(department_id);

ALTER TABLE admins
  ADD COLUMN IF NOT EXISTS company_id INTEGER REFERENCES companies(company_id),
  ADD COLUMN IF NOT EXISTS assigned_department_id INTEGER REFERENCES departments(department_id);

ALTER TABLE serial_keys
  ADD COLUMN IF NOT EXISTS company_id INTEGER REFERENCES companies(company_id),
  ADD COLUMN IF NOT EXISTS department_id INTEGER REFERENCES departments(department_id);

-- Seed companies from existing text values
INSERT INTO companies (company_name)
SELECT DISTINCT TRIM(company)
FROM (
  SELECT TRIM(company) AS company FROM users WHERE company IS NOT NULL AND TRIM(company) <> ''
  UNION
  SELECT TRIM(company) FROM admins WHERE company IS NOT NULL AND TRIM(company) <> ''
  UNION
  SELECT TRIM(company) FROM serial_keys WHERE company IS NOT NULL AND TRIM(company) <> ''
) source
WHERE TRIM(company) <> ''
ON CONFLICT (company_name) DO NOTHING;

-- Seed departments under matching companies
INSERT INTO departments (department_name, company_id)
SELECT DISTINCT TRIM(source.department), c.company_id
FROM (
  SELECT TRIM(company) AS company, TRIM(department) AS department FROM users
    WHERE company IS NOT NULL AND TRIM(company) <> '' AND department IS NOT NULL AND TRIM(department) <> ''
  UNION
  SELECT TRIM(company), TRIM(department) FROM admins
    WHERE company IS NOT NULL AND TRIM(company) <> '' AND department IS NOT NULL AND TRIM(department) <> ''
  UNION
  SELECT TRIM(company), TRIM(department) FROM serial_keys
    WHERE company IS NOT NULL AND TRIM(company) <> '' AND department IS NOT NULL AND TRIM(department) <> ''
) source
INNER JOIN companies c ON LOWER(TRIM(c.company_name)) = LOWER(TRIM(source.company))
WHERE TRIM(source.department) <> ''
ON CONFLICT (company_id, department_name) DO NOTHING;

-- Backfill FK columns on users
UPDATE users u
SET company_id = c.company_id
FROM companies c
WHERE u.company_id IS NULL
  AND u.company IS NOT NULL
  AND LOWER(TRIM(c.company_name)) = LOWER(TRIM(u.company));

UPDATE users u
SET department_id = d.department_id
FROM departments d
INNER JOIN companies c ON c.company_id = d.company_id
WHERE u.department_id IS NULL
  AND u.company IS NOT NULL
  AND u.department IS NOT NULL
  AND LOWER(TRIM(c.company_name)) = LOWER(TRIM(u.company))
  AND LOWER(TRIM(d.department_name)) = LOWER(TRIM(u.department));

-- Backfill FK columns on admins
UPDATE admins a
SET company_id = c.company_id
FROM companies c
WHERE a.company_id IS NULL
  AND a.company IS NOT NULL
  AND LOWER(TRIM(c.company_name)) = LOWER(TRIM(a.company));

UPDATE admins a
SET assigned_department_id = d.department_id
FROM departments d
INNER JOIN companies c ON c.company_id = d.company_id
WHERE a.assigned_department_id IS NULL
  AND a.company IS NOT NULL
  AND a.department IS NOT NULL
  AND LOWER(TRIM(c.company_name)) = LOWER(TRIM(a.company))
  AND LOWER(TRIM(d.department_name)) = LOWER(TRIM(a.department));

-- Backfill FK columns on serial_keys
UPDATE serial_keys sk
SET company_id = c.company_id
FROM companies c
WHERE sk.company_id IS NULL
  AND sk.company IS NOT NULL
  AND LOWER(TRIM(c.company_name)) = LOWER(TRIM(sk.company));

UPDATE serial_keys sk
SET department_id = d.department_id
FROM departments d
INNER JOIN companies c ON c.company_id = d.company_id
WHERE sk.department_id IS NULL
  AND sk.company IS NOT NULL
  AND sk.department IS NOT NULL
  AND LOWER(TRIM(c.company_name)) = LOWER(TRIM(sk.company))
  AND LOWER(TRIM(d.department_name)) = LOWER(TRIM(sk.department));

CREATE INDEX IF NOT EXISTS idx_users_company_department ON users (company_id, department_id);
CREATE INDEX IF NOT EXISTS idx_admins_company_department ON admins (company_id, assigned_department_id);
CREATE INDEX IF NOT EXISTS idx_serial_keys_company_department ON serial_keys (company_id, department_id);
