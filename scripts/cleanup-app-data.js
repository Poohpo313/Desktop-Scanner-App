/**
 * Clears transactional app data for a fresh start.
 * Keeps roles, superadmin account, and system_config.
 *
 * Usage:
 *   node scripts/cleanup-app-data.js
 *   node scripts/cleanup-app-data.js --online-only
 *   node scripts/cleanup-app-data.js --offline-only
 *   node scripts/cleanup-app-data.js --skip-client
 */
const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const repoRoot = path.join(__dirname, "..");

const ONLINE_TABLES = [
  "revocation_requests",
  "user_concerns",
  "recovery_requests",
  "refresh_tokens",
  "activity_logs",
  "cloud_sync",
  "scan_history",
  "documents",
  "folders",
  "devices",
  "serial_keys",
  "users",
  "backups",
];

const OFFLINE_TABLES = [
  "activity_logs",
  "cloud_sync",
  "scan_history",
  "documents",
  "folders",
  "devices",
  "serial_keys",
  "users",
];

const ELECTRON_USER_DATA_DIRS = [
  "user-interface-electron",
  "Desktop Scanner App",
  "io.bukolabs.desktop-scanner",
];

function readEnvValue(envFile, key) {
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
    [
      "-h",
      connection.host,
      "-p",
      connection.port,
      "-U",
      connection.user,
      "-d",
      connection.database,
      "-v",
      "ON_ERROR_STOP=1",
      "-c",
      sql.trim(),
    ],
    {
      env: { ...process.env, PGPASSWORD: connection.password },
      stdio: "inherit",
    },
  );
}

function tableExists(psqlExe, connection, tableName) {
  const sql = `SELECT to_regclass('public.${tableName}') IS NOT NULL AS exists;`;
  const output = execFileSync(
    psqlExe,
    [
      "-h",
      connection.host,
      "-p",
      connection.port,
      "-U",
      connection.user,
      "-d",
      connection.database,
      "-t",
      "-A",
      "-c",
      sql,
    ],
    {
      env: { ...process.env, PGPASSWORD: connection.password },
      encoding: "utf8",
    },
  )
    .trim()
    .toLowerCase();

  return output === "t" || output === "true";
}

function deleteFromTables(psqlExe, connection, tables) {
  for (const table of tables) {
    if (!tableExists(psqlExe, connection, table)) {
      console.log(`  skip ${table} (table not found)`);
      continue;
    }

    console.log(`  delete from ${table}`);
    runSql(psqlExe, connection, `DELETE FROM ${table};`);
  }
}

function removePathIfExists(targetPath, label) {
  if (!fs.existsSync(targetPath)) return false;

  const stat = fs.statSync(targetPath);
  if (stat.isDirectory()) {
    fs.rmSync(targetPath, { recursive: true, force: true });
  } else {
    fs.unlinkSync(targetPath);
  }

  console.log(`  removed ${label}`);
  return true;
}

function cleanupElectronClientState() {
  const appData = process.env.APPDATA;
  if (!appData) {
    console.log("Skipping desktop client cleanup (APPDATA not set).");
    return;
  }

  console.log("Cleaning desktop client local state:");
  let touched = false;

  for (const dirName of ELECTRON_USER_DATA_DIRS) {
    const userDataDir = path.join(appData, dirName);
    if (!fs.existsSync(userDataDir)) continue;

    touched =
      removePathIfExists(path.join(userDataDir, "auth-sessions.json"), `${dirName}/auth-sessions.json`) ||
      touched;
    touched =
      removePathIfExists(path.join(userDataDir, "Local Storage"), `${dirName}/Local Storage`) || touched;
    touched =
      removePathIfExists(path.join(userDataDir, "Session Storage"), `${dirName}/Session Storage`) ||
      touched;
    touched = removePathIfExists(path.join(userDataDir, "documents"), `${dirName}/documents`) || touched;
  }

  if (!touched) {
    console.log("  no desktop client state found (app may not have been run on this machine)");
  } else {
    console.log("Desktop client local state cleared.");
  }
}

function cleanupOnline(psqlExe) {
  const envFile = path.join(repoRoot, "backend-modules", "shared", ".env.online");
  const migration006 = path.join(
    repoRoot,
    "backend-modules",
    "shared",
    "migrations",
    "online",
    "006_serial_key_metadata.postgres.sql",
  );

  if (fs.existsSync(migration006)) {
    console.log("Ensuring serial_keys metadata columns exist...");
    const password = readEnvValue(envFile, "DB_PASSWORD");
    const user = readEnvValue(envFile, "DB_USER") || "postgres";
    const host = readEnvValue(envFile, "DB_HOST") || "localhost";
    const port = readEnvValue(envFile, "DB_PORT") || "5432";
    const database = readEnvValue(envFile, "DB_NAME") || "bukolabs_online";
    if (password) {
      runSql(
        psqlExe,
        { host, port, user, password, database },
        fs.readFileSync(migration006, "utf8"),
      );
    }
  }

  const password = readEnvValue(envFile, "DB_PASSWORD");
  const user = readEnvValue(envFile, "DB_USER") || "postgres";
  const host = readEnvValue(envFile, "DB_HOST") || "localhost";
  const port = readEnvValue(envFile, "DB_PORT") || "5432";
  const database = readEnvValue(envFile, "DB_NAME") || "bukolabs_online";

  if (!password) {
    throw new Error("Missing DB_PASSWORD in backend-modules/shared/.env.online");
  }

  const connection = { host, port, user, password, database };

  console.log(`Cleaning online database: ${database}`);
  deleteFromTables(psqlExe, connection, ONLINE_TABLES);

  if (tableExists(psqlExe, connection, "admins")) {
    console.log("  delete non-superadmin admins");
    runSql(
      psqlExe,
      connection,
      `DELETE FROM admins a
       USING roles r
       WHERE a.role_id = r.role_id
         AND r.role_name <> 'superadmin';`,
    );
  }

  console.log("Online cleanup complete.");
}

function cleanupOffline(psqlExe) {
  const envFile = path.join(repoRoot, "backend-modules", "shared", ".env.offline");
  const password =
    readEnvValue(envFile, "DB_PASSWORD") ||
    readEnvValue(path.join(repoRoot, "backend-modules", "shared", ".env.online"), "DB_PASSWORD");
  const user = readEnvValue(envFile, "DB_USER") || "postgres";
  const host = readEnvValue(envFile, "DB_HOST") || "localhost";
  const port = readEnvValue(envFile, "DB_PORT") || "5432";
  const database = readEnvValue(envFile, "DB_NAME") || "bukolabs_offline";

  if (!password) {
    throw new Error("Missing DB_PASSWORD in backend-modules/shared/.env.offline or .env.online");
  }

  const connection = { host, port, user, password, database };

  console.log(`Cleaning offline database: ${database}`);
  deleteFromTables(psqlExe, connection, OFFLINE_TABLES);
  console.log("Offline cleanup complete.");
}

function main() {
  const args = process.argv.slice(2);
  const onlineOnly = args.includes("--online-only");
  const offlineOnly = args.includes("--offline-only");
  const skipClient = args.includes("--skip-client");
  const runOnline = !offlineOnly;
  const runOffline = !onlineOnly;

  const psqlExe = findPsql();
  if (!psqlExe) {
    console.error("psql.exe not found.");
    process.exit(1);
  }

  console.log("");
  console.log("Bukolabs data cleanup — fresh start");
  console.log("Preserves: roles, superadmin account, system_config");
  console.log("");

  if (runOnline) cleanupOnline(psqlExe);
  if (runOffline) cleanupOffline(psqlExe);
  if (!skipClient) cleanupElectronClientState();

  console.log("");
  console.log("All requested cleanup tasks finished.");
  console.log("Tip: close and restart the User desktop app so the login screen appears.");
}

main();
