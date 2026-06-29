/**
 * Deletes all serial keys from the online database.
 * Usage: node scripts/cleanup-serial-keys.js
 */
const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const repoRoot = path.join(__dirname, "..");
const envFile = path.join(repoRoot, "backend-modules", "shared", ".env.online");
const migrationFile = path.join(
  repoRoot,
  "backend-modules",
  "shared",
  "migrations",
  "online",
  "006_serial_key_metadata.postgres.sql"
);

function readEnvValue(key) {
  if (!fs.existsSync(envFile)) return null;
  const match = fs.readFileSync(envFile, "utf8").match(new RegExp(`^${key}=(.+)$`, "m"));
  return match?.[1]?.trim() ?? null;
}

function findPsql() {
  const candidates = [
    "C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe",
    "C:\\Program Files\\PostgreSQL\\17\\bin\\psql.exe",
    "C:\\Program Files\\PostgreSQL\\16\\bin\\psql.exe",
  ];
  return candidates.find((candidate) => fs.existsSync(candidate));
}

function runSql(psqlExe, connection, sql) {
  execFileSync(
    psqlExe,
    ["-h", connection.host, "-p", connection.port, "-U", connection.user, "-d", connection.database, "-v", "ON_ERROR_STOP=1", "-c", sql.trim()],
    {
      env: { ...process.env, PGPASSWORD: connection.password },
      stdio: "inherit",
    }
  );
}

function main() {
  const password = readEnvValue("DB_PASSWORD");
  const user = readEnvValue("DB_USER") || "postgres";
  const host = readEnvValue("DB_HOST") || "localhost";
  const port = readEnvValue("DB_PORT") || "5432";
  const database = readEnvValue("DB_NAME") || "bukolabs_online";

  if (!password) {
    console.error("Missing DB_PASSWORD in backend-modules/shared/.env.online");
    process.exit(1);
  }

  const psqlExe = findPsql();
  if (!psqlExe) {
    console.error("psql.exe not found.");
    process.exit(1);
  }

  const connection = { host, port, user, password, database };

  if (fs.existsSync(migrationFile)) {
    console.log("Ensuring serial_keys metadata columns exist...");
    runSql(psqlExe, connection, fs.readFileSync(migrationFile, "utf8"));
  }

  console.log("Deleting all serial keys...");
  runSql(psqlExe, connection, "DELETE FROM serial_keys;");

  console.log("");
  console.log("Serial keys cleanup complete.");
  console.log(`Database: ${database}`);
}

main();
