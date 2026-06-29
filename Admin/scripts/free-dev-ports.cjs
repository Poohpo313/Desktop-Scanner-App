const { spawnSync } = require("node:child_process");

const PORTS = [5174, 5175, 5176, 5177, 5178, 5179];

for (const port of PORTS) {
  spawnSync("npx", ["kill-port", String(port)], {
    stdio: "ignore",
    shell: true,
  });
}
