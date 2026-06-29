import { SCANNERS } from "../scan/offline/scanOfflineData";
import { DEFAULT_SCANNED_DOCUMENTS_ROOT } from "../search/searchFolders";
import type { ManagedDevice } from "./devicesData";
import {
  DIAGNOSTIC_TESTS,
  type DiagnosticTestId,
} from "./diagnosticsData";

const PERMISSION_PROBE_KEY = "bukolabs-diagnostics-probe";

export type DiagnosticCheckResult = {
  id: DiagnosticTestId;
  passed: boolean;
  detail: string;
};

function delay(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function matchedScanner(device: ManagedDevice) {
  return SCANNERS.find((scanner) => scanner.id === device.id);
}

async function checkConnection(device: ManagedDevice): Promise<DiagnosticCheckResult> {
  const connected = device.status === "connected";
  const hasSerial = Boolean(device.serialNumber?.trim());

  if (connected && hasSerial) {
    return {
      id: "connection",
      passed: true,
      detail: `Device is connected via ${device.connection}.`,
    };
  }

  if (!connected) {
    return {
      id: "connection",
      passed: false,
      detail: "Device is offline or not detected on this computer.",
    };
  }

  return {
    id: "connection",
    passed: false,
    detail: "Device serial number could not be verified.",
  };
}

async function checkDriver(device: ManagedDevice): Promise<DiagnosticCheckResult> {
  const driver = device.driver.trim();

  if (device.status !== "connected") {
    return {
      id: "driver",
      passed: false,
      detail: "Driver check skipped because the device is offline.",
    };
  }

  if (!driver) {
    return {
      id: "driver",
      passed: false,
      detail: "No driver is registered for this device.",
    };
  }

  const isGeneric = /generic/i.test(driver);
  if (isGeneric) {
    return {
      id: "driver",
      passed: false,
      detail: "Only a generic driver is installed. Install the manufacturer driver.",
    };
  }

  return {
    id: "driver",
    passed: true,
    detail: `${driver} is installed.`,
  };
}

async function checkScannerResponse(device: ManagedDevice): Promise<DiagnosticCheckResult> {
  if (device.status !== "connected") {
    return {
      id: "response",
      passed: false,
      detail: "Scanner did not respond because the device is offline.",
    };
  }

  const knownScanner = matchedScanner(device);
  if (knownScanner) {
    if (knownScanner.status !== "ready") {
      return {
        id: "response",
        passed: false,
        detail: `${knownScanner.name} is not responding.`,
      };
    }

    try {
      const api = window.bukolabs?.scanner;
      if (api?.getCapabilities) {
        await api.getCapabilities(knownScanner.id);
      }
    } catch {
      return {
        id: "response",
        passed: false,
        detail: "Scanner communication test failed.",
      };
    }

    return {
      id: "response",
      passed: true,
      detail: `${knownScanner.name} responded successfully.`,
    };
  }

  try {
    const api = window.bukolabs?.scanner;
    if (api?.listDevices) {
      const response = await api.listDevices();
      const devices = response?.devices ?? [];
      const match = devices.find(
        (entry) =>
          entry.id === device.id ||
          entry.name.toLowerCase() === device.name.toLowerCase(),
      );

      if (match) {
        return {
          id: "response",
          passed: true,
          detail: `${match.name} responded to the scanner service.`,
        };
      }
    }
  } catch {
    return {
      id: "response",
      passed: false,
      detail: "Scanner service could not be reached.",
    };
  }

  if (device.diagnosticsHealthy) {
    return {
      id: "response",
      passed: true,
      detail: "Scanner responded to the local device check.",
    };
  }

  return {
    id: "response",
    passed: false,
    detail: "Scanner did not respond to communication tests.",
  };
}

async function checkPaperSource(device: ManagedDevice): Promise<DiagnosticCheckResult> {
  if (device.status !== "connected") {
    return {
      id: "paper",
      passed: false,
      detail: "Paper source could not be checked while the device is offline.",
    };
  }

  const knownScanner = matchedScanner(device);
  if (knownScanner?.type.toLowerCase().includes("adf")) {
    const ready = knownScanner.status === "ready";
    return {
      id: "paper",
      passed: ready,
      detail: ready
        ? "ADF paper source is available."
        : "ADF paper source is not ready.",
    };
  }

  if (device.maxScanSize) {
    return {
      id: "paper",
      passed: true,
      detail: `Flatbed source is ready for up to ${device.maxScanSize}.`,
    };
  }

  return {
    id: "paper",
    passed: false,
    detail: "Paper source information is unavailable for this device.",
  };
}

async function checkScanPermission(): Promise<DiagnosticCheckResult> {
  try {
    const probeKey = `${PERMISSION_PROBE_KEY}-${Date.now()}`;
    localStorage.setItem(probeKey, "ok");
    const value = localStorage.getItem(probeKey);
    localStorage.removeItem(probeKey);

    if (value !== "ok") {
      return {
        id: "permission",
        passed: false,
        detail: "Application storage permission check failed.",
      };
    }

    if (!window.isSecureContext) {
      return {
        id: "permission",
        passed: false,
        detail: "Scan permissions require a secure application context.",
      };
    }

    return {
      id: "permission",
      passed: true,
      detail: "Application has permission to start scan jobs.",
    };
  } catch {
    return {
      id: "permission",
      passed: false,
      detail: "Application could not verify scanning permissions.",
    };
  }
}

async function checkStorageAccess(): Promise<DiagnosticCheckResult> {
  try {
    const filesystem = window.bukolabs?.filesystem;

    if (filesystem?.listDirectories) {
      const listing = await filesystem.listDirectories({ path: "C:\\" });
      const folders = listing?.folders ?? [];
      const hasSaveRoot = folders.some((folder) => {
        const path = String(folder.path ?? "").toLowerCase();
        const name = String(folder.name ?? "").toLowerCase();
        return (
          path === DEFAULT_SCANNED_DOCUMENTS_ROOT.toLowerCase() ||
          name === "scanned documents"
        );
      });

      if (hasSaveRoot) {
        return {
          id: "storage",
          passed: true,
          detail: `${DEFAULT_SCANNED_DOCUMENTS_ROOT} is available.`,
        };
      }
    }
  } catch {
    return {
      id: "storage",
      passed: false,
      detail: "Could not verify access to the local save folder.",
    };
  }

  return {
    id: "storage",
    passed: false,
    detail: `Could not access ${DEFAULT_SCANNED_DOCUMENTS_ROOT}.`,
  };
}

const CHECKERS: Record<
  DiagnosticTestId,
  (device: ManagedDevice) => Promise<DiagnosticCheckResult>
> = {
  connection: checkConnection,
  driver: checkDriver,
  response: checkScannerResponse,
  paper: checkPaperSource,
  permission: () => checkScanPermission(),
  storage: () => checkStorageAccess(),
};

export async function runDiagnosticTest(
  testId: DiagnosticTestId,
  device: ManagedDevice,
): Promise<DiagnosticCheckResult> {
  await delay(300);
  return CHECKERS[testId](device);
}

export async function runAllDiagnosticTests(
  device: ManagedDevice,
  onProgress: (result: DiagnosticCheckResult) => void,
  shouldContinue: () => boolean,
): Promise<DiagnosticCheckResult[]> {
  const results: DiagnosticCheckResult[] = [];

  for (const test of DIAGNOSTIC_TESTS) {
    if (!shouldContinue()) break;

    onProgress({ id: test.id, passed: false, detail: "" });

    const result = await runDiagnosticTest(test.id, device);
    if (!shouldContinue()) break;

    results.push(result);
    onProgress(result);
  }

  return results;
}

export function buildDiagnosticsResult(results: DiagnosticCheckResult[]): {
  message: string;
  healthy: boolean;
} {
  const failed = results.filter((result) => !result.passed);

  if (failed.length === 0) {
    return { message: "Diagnostics complete. No issues found.", healthy: true };
  }

  if (failed.some((result) => result.id === "connection" || result.id === "response")) {
    return {
      message: "Diagnostics found connectivity issues. Check the USB cable and power.",
      healthy: false,
    };
  }

  if (failed.some((result) => result.id === "driver")) {
    return {
      message: "Driver issue detected. Install or update the device driver.",
      healthy: false,
    };
  }

  if (failed.some((result) => result.id === "storage")) {
    return {
      message: "Storage access issue. Verify the local save folder is available.",
      healthy: false,
    };
  }

  return {
    message: failed[0]?.detail || "Diagnostics found issues that need attention.",
    healthy: false,
  };
}
