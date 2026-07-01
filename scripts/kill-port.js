const { execSync } = require("child_process");

const port = String(process.argv[2] || "5173");

function listListeningPids(targetPort) {
  if (process.platform !== "win32") {
    return [];
  }

  try {
    const output = execSync(`netstat -ano | findstr :${targetPort}`, { encoding: "utf8" });
    const pids = new Set();

    for (const line of output.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed.includes("LISTENING")) continue;
      const parts = trimmed.split(/\s+/);
      const pid = parts[parts.length - 1];
      if (pid && /^\d+$/.test(pid) && pid !== "0") {
        pids.add(pid);
      }
    }

    return [...pids];
  } catch {
    return [];
  }
}

function killListeningPids(targetPort) {
  const killed = [];
  for (const pid of listListeningPids(targetPort)) {
    try {
      execSync(`taskkill /PID ${pid} /F`, { stdio: "ignore" });
      killed.push(pid);
    } catch {
      // Access denied for SYSTEM services — caller may need stop:gateway-service.
    }
  }
  return killed;
}

function stopGatewayScheduledTask() {
  if (process.platform !== "win32") return false;
  try {
    execSync(
      'powershell -NoProfile -Command "Stop-ScheduledTask -TaskName BukolabsGateway -ErrorAction SilentlyContinue"',
      { stdio: "ignore" },
    );
    return true;
  } catch {
    return false;
  }
}

function isPortListening(targetPort) {
  return listListeningPids(targetPort).length > 0;
}

if (require.main === module) {
  killListeningPids(port);
  if (port === "3000") {
    stopGatewayScheduledTask();
    killListeningPids(port);
  }
}

module.exports = {
  isPortListening,
  killListeningPids,
  listListeningPids,
  stopGatewayScheduledTask,
};
