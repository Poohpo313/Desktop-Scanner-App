/**
 * Resets the default superadmin PIN and clears login lockout.
 * Usage: node scripts/reset-superadmin-pin.js [pin]
 * Default PIN: 123456
 */
const { execFileSync } = require("child_process");
const path = require("path");

const repoRoot = path.join(__dirname, "..");
const argon2 = require(path.join(repoRoot, "node_modules", "argon2"));

const envFile = path.join(repoRoot, "backend-modules", "shared", ".env.online");
const fs = require("fs");

function readEnvValue(key) {
  if (!fs.existsSync(envFile)) return null;
  const match = fs.readFileSync(envFile, "utf8").match(new RegExp(`^${key}=(.+)$`, "m"));
  return match?.[1]?.trim() ?? null;
}

async function main() {
  const pin = process.argv[2] || "123456";
  if (!/^\d{6}$/.test(pin)) {
    console.error("PIN must be exactly 6 digits.");
    process.exit(1);
  }

  const password = readEnvValue("DB_PASSWORD");
  const user = readEnvValue("DB_USER") || "postgres";
  const host = readEnvValue("DB_HOST") || "localhost";
  const port = readEnvValue("DB_PORT") || "5432";
  const database = readEnvValue("DB_NAME") || "bukolabs_online";

  if (!password) {
    console.error("Missing DB_PASSWORD in backend-modules/shared/.env.online");
    process.exit(1);
  }

  const pinHash = await argon2.hash(pin, { type: argon2.argon2id });
  const sql = `
UPDATE admins
SET pin_hash = '${pinHash.replace(/'/g, "''")}',
    failed_login_attempts = 0,
    locked_until = NULL,
    account_status = 'active'
WHERE username = 'superadmin';
`;

  const psqlCandidates = [
    "C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe",
    "C:\\Program Files\\PostgreSQL\\17\\bin\\psql.exe",
    "C:\\Program Files\\PostgreSQL\\16\\bin\\psql.exe",
  ];
  const psqlExe = psqlCandidates.find((candidate) => fs.existsSync(candidate));
  if (!psqlExe) {
    console.error("psql.exe not found.");
    process.exit(1);
  }

  execFileSync(
    psqlExe,
    ["-h", host, "-p", port, "-U", user, "-d", database, "-v", "ON_ERROR_STOP=1", "-c", sql.trim()],
    {
      env: { ...process.env, PGPASSWORD: password },
      stdio: "inherit",
    }
  );

  console.log("");
  console.log("Superadmin PIN reset complete.");
  console.log(`Username: superadmin`);
  console.log(`PIN: ${pin}`);
  console.log(`Database: ${database} (admins.pin_hash)`);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
