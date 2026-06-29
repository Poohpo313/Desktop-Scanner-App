require("dotenv").config();
const { Client } = require("pg");
const argon2 = require("argon2");

async function main() {
  const client = new Client({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || "bukolabs_online",
  });
  await client.connect();
  const { rows } = await client.query(`
    SELECT a.admin_id, a.username, a.account_status, r.role_name,
           a.pin_hash, a.failed_login_attempts, a.locked_until
    FROM admins a
    JOIN roles r ON r.role_id = a.role_id
    WHERE r.role_name = 'superadmin'
    ORDER BY a.admin_id
  `);
  for (const row of rows) {
    const prefix = row.pin_hash ? String(row.pin_hash).slice(0, 12) : null;
    let verify = null;
    if (row.pin_hash?.startsWith("$argon2")) {
      try {
        verify = await argon2.verify(row.pin_hash, "123456");
      } catch {
        verify = false;
      }
    }
    console.log({
      adminId: row.admin_id,
      username: row.username,
      status: row.account_status,
      pinPrefix: prefix,
      pin123456: verify,
      failed: row.failed_login_attempts,
      lockedUntil: row.locked_until,
    });
  }
  await client.end();
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
