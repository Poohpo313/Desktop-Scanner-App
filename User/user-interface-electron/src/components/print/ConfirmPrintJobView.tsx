import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDocuments } from "../../context/DocumentsContext";
import { ScanModalShell } from "../scan/offline/modals/ScanModalShell";
import {
  DEFAULT_PRINT_SETTINGS,
  DEMO_LOCAL_FILE_NAME,
  type PrintCompletedState,
  type PrintFlowState,
} from "./printFlow";
import "../../styles/print-flow.css";
import "../../styles/scan-offline.css";

export function ConfirmPrintJobView() {
  const navigate = useNavigate();
  const location = useLocation();
  const { documents } = useDocuments();
  const flowState = location.state as PrintFlowState | null;
  const [printing, setPrinting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!flowState?.source) {
      navigate("/print", { replace: true });
    }
  }, [flowState, navigate]);

  if (!flowState?.source) return null;

  const settings = flowState.settings ?? DEFAULT_PRINT_SETTINGS;

  const selectedDocument =
    flowState.source === "documents" && flowState.selectedDocumentId
      ? documents.find((doc) => doc.id === flowState.selectedDocumentId)
      : undefined;

  const fileName =
    flowState.source === "local"
      ? flowState.localFileName ?? DEMO_LOCAL_FILE_NAME
      : selectedDocument?.fileName ?? "Untitled_Scan.pdf";

  const documentPath =
    flowState.localFilePath ??
    (flowState.source === "local" ? flowState.localFilePath : selectedDocument?.savePath);

  const pages =
    flowState.source === "local"
      ? flowState.localFilePages ?? 1
      : selectedDocument?.pages ?? 1;

  function handleBack() {
    navigate("/print/settings", { state: flowState });
  }

  async function handlePrintNow() {
    setPrinting(true);
    setError(null);

    try {
      if (!window.bukolabs?.print?.start) {
        throw new Error("Printing is unavailable. Restart the desktop app and try again.");
      }

      const result = (await window.bukolabs.print.start({
        printerId: settings.printerId,
        documentPath,
        settings: {
          copies: settings.copies,
          paperSize: settings.paperSize,
          colorMode: settings.colorMode,
        },
      })) as { success?: boolean; message?: string };

      if (result.success === false) {
        throw new Error(result.message ?? "Print failed");
      }

      const completedState: PrintCompletedState = {
        fileName,
        selectedDocumentId: flowState!.selectedDocumentId,
        returnTo: flowState!.returnTo,
      };

      navigate("/print/completed", { state: completedState });
    } catch (printError) {
      setError(
        printError instanceof Error ? printError.message : "Unable to send the document to the printer.",
      );
    } finally {
      setPrinting(false);
    }
  }

  return (
    <div className="print-flow-page" data-screen="confirm-print-job">
      {printing ? (
        <div className="print-progress-backdrop" role="status" aria-live="polite" aria-busy="true">
          <div className="print-progress-card">
            <div className="scan-panel__spinner" aria-hidden="true" />
            <h2 className="print-progress-card__title">Printing…</h2>
            <p className="print-progress-card__desc">
              Your document is being sent to {settings.printerName}. This screen will continue when the
              printer queue finishes.
            </p>
          </div>
        </div>
      ) : null}

      <ScanModalShell
        title="Confirm Print Job"
        subtitle="Review the selected file and printer settings before sending it to the printer."
        onClose={handleBack}
        footer={
          <>
            <button type="button" className="scan-btn scan-btn--outline" onClick={handleBack} disabled={printing}>
              Back
            </button>
            <button
              type="button"
              className="scan-btn scan-btn--primary"
              onClick={() => void handlePrintNow()}
              disabled={printing}
            >
              {printing ? "Printing…" : "Print Now"}
            </button>
          </>
        }
      >
        {error ? <p className="print-flow-error">{error}</p> : null}

        <dl className="scan-summary-list scan-summary-list--compact print-confirm-summary">
          <div>
            <dt>File</dt>
            <dd>{fileName}</dd>
          </div>
          <div>
            <dt>Printer</dt>
            <dd>{settings.printerName}</dd>
          </div>
          <div>
            <dt>Pages</dt>
            <dd>{pages}</dd>
          </div>
          <div>
            <dt>Copies</dt>
            <dd>{settings.copies}</dd>
          </div>
          <div>
            <dt>Paper Size</dt>
            <dd>{settings.paperSize}</dd>
          </div>
          <div>
            <dt>Color Mode</dt>
            <dd>{settings.colorMode}</dd>
          </div>
        </dl>
      </ScanModalShell>
    </div>
  );
}
