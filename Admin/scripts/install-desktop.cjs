process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const { spawnSync } = require("node:child_process");

const result = spawnSync("npm", ["install"], {
  stdio: "inherit",
  env: process.env,
  shell: true,
});

process.exit(result.status ?? 1);
