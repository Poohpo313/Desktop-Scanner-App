const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");

function findViteBin() {
  const candidates = [
    path.join(repoRoot, "node_modules", "vite", "bin", "vite.js"),
    path.join(repoRoot, "Admin", "node_modules", "vite", "bin", "vite.js"),
    path.join(repoRoot, "SuperAdmin", "node_modules", "vite", "bin", "vite.js"),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  try {
    return require.resolve("vite/bin/vite.js", { paths: [repoRoot] });
  } catch {
    throw new Error(
      "vite is not installed. Run:\n  npm install -w admin-interface-react -w super-admin-interface-react",
    );
  }
}

const viteBin = findViteBin();
const args = process.argv.slice(2);
const result = spawnSync(process.execPath, [viteBin, ...args], {
  stdio: "inherit",
  cwd: process.cwd(),
});

process.exit(result.status ?? 1);
