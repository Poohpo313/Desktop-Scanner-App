import { ChevronDown, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { StatusBadge } from "../dashboard/StatusBadge";
import { useWorkspaceStatus } from "../../hooks/useWorkspaceStatus";
import { resolvePreferredScannerName } from "../../lib/lastScannerStorage";
import { useDocuments } from "../../context/DocumentsContext";
import { AppErrorState } from "../common/AppErrorState";
import { ScanModalShell } from "../scan/offline/modals/ScanModalShell";
import {
  COLOR_MODE_OPTIONS,
  DEFAULT_PRINT_SETTINGS,
  PAPER_SIZE_OPTIONS,
  type PrintFlowState,
  type PrintSettingsState,
} from "./printFlow";
import "../../styles/print-flow.css";
import "../../styles/scan-offline.css";

type PrinterOption = {
  id: string;
  name: string;
  matchedScannerName?: string | null;
};

const NO_PRINTER_MESSAGE =
  "No printer was detected on this computer. Connect a printer via USB or network, then detect again.";

export function PrintSettingsView() {
  const navigate = useNavigate();
  const location = useLocation();
  const { documents } = useDocuments();
  const { scannerConnected, printerConnected } = useWorkspaceStatus();
  const flowState = location.state as PrintFlowState | null;
  const preferredScannerName = useMemo(
    () => resolvePreferredScannerName(flowState?.scannerDeviceName),
    [flowState?.scannerDeviceName],
  );
  const [printers, setPrinters] = useState<PrinterOption[]>([]);
  const [settings, setSettings] = useState<PrintSettingsState>(
    flowState?.settings ?? DEFAULT_PRINT_SETTINGS,
  );
  const [detectingPrinters, setDetectingPrinters] = useState(true);
  const [detectError, setDetectError] = useState<string | null>(null);
  const [scannerWarning, setScannerWarning] = useState<string | null>(null);

  useEffect(() => {
    if (!flowState?.source) {
      navigate("/print", { replace: true });
    }
  }, [flowState, navigate]);

  const detectPrinters = useCallback(async () => {
    setDetectingPrinters(true);
    setDetectError(null);
    setScannerWarning(null);

    if (!window.bukolabs?.print?.listPrinters) {
      setPrinters([]);
      setDetectError("Printer detection is unavailable in this environment.");
      setDetectingPrinters(false);
      return;
    }

    try {
      const result = await window.bukolabs.print.listPrinters({
        preferredScannerName,
      });
      const next = result.printers ?? [];
      setPrinters(next);

      if (next.length === 0) {
        setDetectError(
          preferredScannerName
            ? `No printer queue matched the scanner used for scanning (${preferredScannerName}). Connect the device or install its print driver, then detect again.`
            : NO_PRINTER_MESSAGE,
        );
        return;
      }

      if (result.scannerWarning) {
        setScannerWarning(result.scannerWarning);
      }

      setSettings((current) => {
        if (result.preferredPrinterId) {
          const preferred = next.find((printer) => printer.id === result.preferredPrinterId);
          if (preferred) {
            return {
              ...current,
              printerId: preferred.id,
              printerName: preferred.name,
            };
          }
        }

        const existing = next.find((printer) => printer.id === current.printerId);
        if (existing) {
          return current;
        }

        const scannerLinked = preferredScannerName
          ? next.find((printer) => printer.matchedScannerName)
          : null;

        const fallback = scannerLinked ?? next.find((printer) => !printer.name.toLowerCase().includes("pdf")) ?? next[0];
        return {
          ...current,
          printerId: fallback.id,
          printerName: fallback.name,
        };
      });
    } catch {
      setPrinters([]);
      setDetectError("Printer detection failed. Check your connection and try again.");
    } finally {
      setDetectingPrinters(false);
    }
  }, [preferredScannerName]);

  useEffect(() => {
    void detectPrinters();
  }, [detectPrinters]);

  if (!flowState?.source) return null;

  const selectedDocument =
    flowState.source === "documents" && flowState.selectedDocumentId
      ? documents.find((doc) => doc.id === flowState.selectedDocumentId)
      : undefined;

  const documentName =
    flowState.localFileName ?? selectedDocument?.fileName ?? "Selected document";

  function handleBack() {
    if (flowState.returnTo === "documents") {
      navigate("/files");
      return;
    }
    navigate("/print", { state: flowState });
  }

  function handleContinue() {
    navigate("/print/confirm", {
      state: {
        ...flowState,
        scannerDeviceId: flowState.scannerDeviceId,
        scannerDeviceName: preferredScannerName ?? flowState.scannerDeviceName,
        settings,
      },
    });
  }

  function updatePrinter(printerId: string) {
    const printer = printers.find((entry) => entry.id === printerId);
    if (!printer) return;

    setSettings((current) => ({
      ...current,
      printerId: printer.id,
      printerName: printer.name,
    }));
  }

  const showPrinterError = !detectingPrinters && (printers.length === 0 || Boolean(detectError));
  const selectedPrinter = printers.find((printer) => printer.id === settings.printerId);

  return (
    <div className="print-flow-page" data-screen="8-print-settings-overlay">
      <ScanModalShell
        title="Print Settings"
        subtitle="Choose a printer and configure how this document should be printed."
        onClose={handleBack}
        footer={
          <>
            <button type="button" className="scan-btn scan-btn--outline" onClick={handleBack}>
              Back
            </button>
            <button
              type="button"
              className="scan-btn scan-btn--primary"
              onClick={handleContinue}
              disabled={detectingPrinters || printers.length === 0}
            >
              Continue
            </button>
          </>
        }
      >
        <div className="print-settings-form">
          <div className="print-settings-status-badges">
            <StatusBadge
              label={scannerConnected ? "Scanner Connected" : "Scanner Disconnected"}
              icon="scan"
              active={scannerConnected}
            />
            <StatusBadge
              label={printerConnected ? "Printer Connected" : "Printer Disconnected"}
              icon="print"
              active={printerConnected}
            />
          </div>

          <label className="scan-field">
            <span className="scan-field__label">Document</span>
            <input
              type="text"
              className="scan-field__input scan-field__input--text scan-field__input--readonly"
              value={documentName}
              readOnly
            />
          </label>

          {showPrinterError ? (
            <AppErrorState
              variant="error"
              title="No Printer Detected"
              message={detectError ?? NO_PRINTER_MESSAGE}
              actionLabel="Detect Devices"
              onAction={() => void detectPrinters()}
            />
          ) : null}

          {!showPrinterError && scannerWarning ? (
            <AppErrorState
              variant="warning"
              title="Scanner Printer Not Found"
              message={scannerWarning}
              actionLabel="Detect Devices"
              onAction={() => void detectPrinters()}
              compact
            />
          ) : null}

          {!showPrinterError && preferredScannerName && selectedPrinter?.matchedScannerName ? (
            <p className="print-settings-match-note" role="status">
              Matched to the scanner used for this document: {selectedPrinter.name}
            </p>
          ) : null}

          <div className="print-settings-printer-field">
            <div className="print-settings-printer-field__header">
              <span className="scan-field__label">Printer</span>
              <button
                type="button"
                className={`print-settings-detect-btn${
                  detectingPrinters ? " print-settings-detect-btn--spinning" : ""
                }`}
                onClick={() => void detectPrinters()}
                disabled={detectingPrinters}
              >
                <RefreshCw className="h-4 w-4" strokeWidth={1.8} />
                {detectingPrinters ? "Detecting…" : "Detect Devices"}
              </button>
            </div>
            <div className="scan-field__select-wrap">
              <select
                className="scan-field__native-select"
                value={settings.printerId}
                onChange={(event) => updatePrinter(event.target.value)}
                disabled={detectingPrinters || printers.length === 0}
              >
                {detectingPrinters ? (
                  <option value="">Detecting installed printers…</option>
                ) : printers.length === 0 ? (
                  <option value="">No printers detected on this computer</option>
                ) : (
                  printers.map((printer) => (
                    <option key={printer.id} value={printer.id}>
                      {printer.name}
                      {printer.matchedScannerName ? " (matched scanner)" : ""}
                    </option>
                  ))
                )}
              </select>
              <ChevronDown className="scan-field__select-icon" strokeWidth={1.8} />
            </div>
          </div>

          <label className="scan-field">
            <span className="scan-field__label">Copies</span>
            <input
              type="number"
              min={1}
              max={99}
              className="scan-field__input scan-field__input--text"
              value={settings.copies}
              onChange={(event) =>
                setSettings((current) => ({
                  ...current,
                  copies: Math.max(1, Math.min(99, Number(event.target.value) || 1)),
                }))
              }
            />
          </label>

          <label className="scan-field">
            <span className="scan-field__label">Paper Size</span>
            <div className="scan-field__select-wrap">
              <select
                className="scan-field__native-select"
                value={settings.paperSize}
                onChange={(event) =>
                  setSettings((current) => ({ ...current, paperSize: event.target.value }))
                }
              >
                {PAPER_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
              <ChevronDown className="scan-field__select-icon" strokeWidth={1.8} />
            </div>
          </label>

          <label className="scan-field">
            <span className="scan-field__label">Color Mode</span>
            <div className="scan-field__select-wrap">
              <select
                className="scan-field__native-select"
                value={settings.colorMode}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    colorMode: event.target.value as PrintSettingsState["colorMode"],
                  }))
                }
              >
                {COLOR_MODE_OPTIONS.map((mode) => (
                  <option key={mode} value={mode}>
                    {mode}
                  </option>
                ))}
              </select>
              <ChevronDown className="scan-field__select-icon" strokeWidth={1.8} />
            </div>
          </label>
        </div>
      </ScanModalShell>
    </div>
  );
}
