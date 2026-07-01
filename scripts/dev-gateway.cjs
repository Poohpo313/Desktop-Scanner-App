const http = require("node:http");
const { spawnSync } = require("node:child_process");
const {
  isPortListening,
  killListeningPids,
  stopGatewayScheduledTask,
} = require("./kill-port.js");

const PORT = 3000;
const HEALTH_URL = `http://127.0.0.1:${PORT}/api/v1/health`;

function checkGatewayHealth() {
  return new Promise((resolve) => {
    const request = http.get(HEALTH_URL, (response) => {
      response.resume();
      resolve(response.statusCode === 200);
    });
    request.on("error", () => resolve(false));
    request.setTimeout(2500, () => {
      request.destroy();
      resolve(false);
    });
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  if (await checkGatewayHealth()) {
    console.log(`Gateway is already running at http://localhost:${PORT}/api/v1`);
    console.log("Use that instance for Admin, SuperAdmin, and User apps.");
    console.log(
      "To run watch mode instead, stop the background service (Admin PowerShell): npm run stop:gateway-service",
    );
    return;
  }

  if (isPortListening(PORT)) {
    console.log(`Port ${PORT} is in use. Attempting to free it for local dev...`);
    killListeningPids(PORT);
    stopGatewayScheduledTask();
    await sleep(1500);
    killListeningPids(PORT);
  }

  if (isPortListening(PORT)) {
    console.error(`\nPort ${PORT} is still in use and could not be freed automatically.`);
    console.error("It is usually the BukolabsGateway background task (runs as SYSTEM).");
    console.error("\nOption A — stop the service (PowerShell as Administrator):");
    console.error("  npm run stop:gateway-service");
    console.error("\nOption B — use the gateway that is already listening on :3000 if it responds:");
    console.error(`  ${HEALTH_URL}`);
    process.exit(1);
  }

  const result = spawnSync("npm", ["run", "start:dev", "-w", "@bukolabs/gateway"], {
    stdio: "inherit",
    shell: true,
    env: process.env,
  });
  process.exit(result.status ?? 1);
}

void main();
