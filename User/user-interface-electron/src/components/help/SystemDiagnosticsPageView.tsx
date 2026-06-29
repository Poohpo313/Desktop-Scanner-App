import { LoaderCircle, Check, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppStatusBar } from "../layout/AppStatusBar";
import { ConsolePageHeader } from "../layout/ConsolePageHeader";
import { getConsolePageSubtitle, getConsolePageTitle } from "../layout/consolePageMeta";
import { useDevices } from "../../context/DevicesContext";
import { useSession } from "../../context/SessionContext";
import {
  buildDiagnosticsResult,
  runAllDiagnosticTests,
  type DiagnosticCheckResult,
} from "../devices/runDeviceDiagnostics";
import { DIAGNOSTIC_TESTS, type DiagnosticTestId } from "../devices/diagnosticsData";
import type { ManagedDevice } from "../devices/devicesData";
import "../../styles/dashboard.css";
import "../../styles/system-diagnostics-page.css";

type SystemCheckId = "online" | "sync" | "scanner" | DiagnosticTestId;
type CheckStatus = "pending" | "running" | "passed" | "failed";

type SystemCheck = {
  id: SystemCheckId;
  title: string;
  description: string;
};

const SYSTEM_CHECKS: SystemCheck[] = [
  {
    id: "online",
    title: "Online Services",
    description: "Verify connection to the Bukolabs online gateway.",
  },
  {
    id: "sync",
    title: "Sync Service",
    description: "Check whether background sync is available.",
  },
  {
    id: "scanner",
    title: "Scanner Detection",
    description: "Detect scanners and printers available on this workstation.",
  },
  ...DIAGNOSTIC_TESTS.map((test) => ({
    id: test.id,
    title: test.title,
    description: test.description,
  })),
];

function initialStatuses(): Record<SystemCheckId, CheckStatus> {
  return SYSTEM_CHECKS.reduce(
    (accumulator, check) => {
      accumulator[check.id] = "pending";
      return accumulator;
    },
    {} as Record<SystemCheckId, CheckStatus>,
  );
}

function initialDetails(): Record<SystemCheckId, string> {
  return SYSTEM_CHECKS.reduce(
    (accumulator, check) => {
      accumulator[check.id] = check.description;
      return accumulator;
    },
    {} as Record<SystemCheckId, string>,
  );
}

function pickDiagnosticDevice(devices: ManagedDevice[]): ManagedDevice | null {
  const connected = devices.find((device) => device.status === "connected");
  if (connected) return connected;
  return devices[0] ?? null;
}

export function SystemDiagnosticsPageView() {
  const navigate = useNavigate();
  const { session } = useSession();
  const { devices } = useDevices();
  const [running, setRunning] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [healthy, setHealthy] = useState<boolean | null>(null);
  const [statuses, setStatuses] = useState(initialStatuses);
  const [details, setDetails] = useState(initialDetails);

  const diagnosticDevice = useMemo(() => pickDiagnosticDevice(devices), [devices]);

  async function runSystemChecks() {
    setRunning(true);
    setSummary(null);
    setHealthy(null);
    setStatuses(initialStatuses());
    setDetails(initialDetails());

    const setCheck = (id: SystemCheckId, status: CheckStatus, detail: string) => {
      setStatuses((current) => ({ ...current, [id]: status }));
      setDetails((current) => ({ ...current, [id]: detail }));
    };

    setCheck("online", "running", "Checking online gateway...");
    try {
      const gatewayStatus = await window.bukolabs?.gateway?.checkAvailable();
      if (gatewayStatus?.reachable) {
        setCheck(
          "online",
          "passed",
          `Online gateway is reachable at ${gatewayStatus.url}.`,
        );
      } else {
        setCheck(
          "online",
          "failed",
          gatewayStatus?.url
            ? `Could not reach the gateway at ${gatewayStatus.url}. Update the server address in Settings.`
            : "Could not reach the online gateway. Check the server address and network connection.",
        );
      }
    } catch {
      setCheck("online", "failed", "Could not check the online gateway.");
    }

    setCheck("sync", "running", "Checking sync service...");
    try {
      const syncStatus = (await window.bukolabs?.sync.status()) as
        | { online?: boolean; pending?: number; error?: string }
        | undefined;
      if (syncStatus?.online) {
        setCheck(
          "sync",
          "passed",
          syncStatus.pending
            ? `Sync service is online with ${syncStatus.pending} pending item(s).`
            : "Sync service is online and ready.",
        );
      } else {
        setCheck("sync", "failed", syncStatus?.error ?? "Sync service is unavailable in the current session.");
      }
    } catch {
      setCheck("sync", "failed", "Sync service could not be checked.");
    }

    setCheck("scanner", "running", "Scanning for devices...");
    try {
      const response = await window.bukolabs?.scanner.listDevices();
      const count = response?.devices?.filter((device) => device.id !== "local-default-scanner").length ?? 0;
      if (count > 0) {
        setCheck("scanner", "passed", `${count} scanner/printer device(s) detected on this workstation.`);
      } else {
        setCheck("scanner", "failed", "No scanners or printers were detected on this workstation.");
      }
    } catch {
      setCheck("scanner", "failed", "Scanner detection failed.");
    }

    if (!diagnosticDevice) {
      for (const test of DIAGNOSTIC_TESTS) {
        setCheck(test.id, "failed", "No managed device is available for device-level diagnostics.");
      }
      setSummary("System checks completed, but no managed device is available for scanner diagnostics.");
      setHealthy(false);
      setRunning(false);
      return;
    }

    const collected: DiagnosticCheckResult[] = [];
    await runAllDiagnosticTests(
      diagnosticDevice,
      (result) => {
        collected.push(result);
        setCheck(
          result.id,
          result.passed ? "passed" : "failed",
          result.detail,
        );
      },
      (testId) => {
        setCheck(testId, "running", "Running diagnostic test...");
      },
    );

    const deviceSummary = buildDiagnosticsResult(collected);
    setSummary(
      session.displayName
        ? `${deviceSummary.message} Signed in as ${session.displayName}.`
        : deviceSummary.message,
    );
    setHealthy(deviceSummary.healthy);
    setRunning(false);
  }

  return (
    <div className="dashboard console-page">
      <ConsolePageHeader
        title={getConsolePageTitle("System Diagnostics")}
        subtitle={getConsolePageSubtitle("System Diagnostics")}
      />

      <div className="system-diagnostics-page">
        <section className="system-diagnostics-page__intro">
          <h2>System Diagnostics</h2>
          <p>
            Run a full health check for this workstation, online services, sync, scanner detection,
            and the currently selected managed device.
          </p>
          {diagnosticDevice ? (
            <p className="system-diagnostics-page__device">
              Target device: <strong>{diagnosticDevice.name}</strong>
            </p>
          ) : (
            <p className="system-diagnostics-page__device system-diagnostics-page__device--warning">
              No managed device found. Add a device first for complete scanner diagnostics.
            </p>
          )}
        </section>

        <section className="system-diagnostics-page__checks">
          <ul className="system-diagnostics-page__list">
            {SYSTEM_CHECKS.map((check) => {
              const status = statuses[check.id];
              return (
                <li key={check.id} className="system-diagnostics-page__item">
                  <div className="system-diagnostics-page__item-copy">
                    <strong>{check.title}</strong>
                    <span>{details[check.id]}</span>
                  </div>
                  <span className={`system-diagnostics-page__status system-diagnostics-page__status--${status}`}>
                    {status === "running" ? (
                      <LoaderCircle className="system-diagnostics-page__spinner" strokeWidth={2} />
                    ) : status === "passed" ? (
                      <Check strokeWidth={2.2} />
                    ) : status === "failed" ? (
                      <X strokeWidth={2.2} />
                    ) : (
                      "Pending"
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>

        {summary ? (
          <section
            className={`system-diagnostics-page__summary${
              healthy ? " system-diagnostics-page__summary--ok" : " system-diagnostics-page__summary--warn"
            }`}
          >
            {summary}
          </section>
        ) : null}

        <div className="system-diagnostics-page__actions">
          <button type="button" className="system-diagnostics-page__btn system-diagnostics-page__btn--secondary" onClick={() => navigate("/help")}>
            Back to Help
          </button>
          <button
            type="button"
            className="system-diagnostics-page__btn system-diagnostics-page__btn--primary"
            disabled={running}
            onClick={() => void runSystemChecks()}
          >
            {running ? "Running Diagnostics..." : "Run System Diagnostics"}
          </button>
        </div>
      </div>

      <AppStatusBar />
    </div>
  );
}
