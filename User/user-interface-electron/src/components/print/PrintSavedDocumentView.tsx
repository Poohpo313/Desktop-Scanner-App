import { FileImage, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDocuments } from "../../context/DocumentsContext";
import { ScanModalShell } from "../scan/offline/modals/ScanModalShell";
import { BrowseLocalPrintFileModal } from "./BrowseLocalPrintFileModal";
import { type PrintFlowState, type PrintSource } from "./printFlow";
import "../../styles/print-saved-document.css";
import "../../styles/scan-offline.css";

export function PrintSavedDocumentView() {
  const navigate = useNavigate();
  const location = useLocation();
  const { documents } = useDocuments();
  const routeState = (location.state as Partial<PrintFlowState> | null) ?? {};

  const [source, setSource] = useState<PrintSource>(routeState.source ?? "documents");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [localFileName, setLocalFileName] = useState(routeState.localFileName ?? "");
  const [localFilePath, setLocalFilePath] = useState(routeState.localFilePath ?? "");
  const [localFilePages, setLocalFilePages] = useState(routeState.localFilePages ?? 0);
  const [showBrowseModal, setShowBrowseModal] = useState(false);

  useEffect(() => {
    if (routeState.selectedDocumentId) {
      setSelectedId(routeState.selectedDocumentId);
      setSource("documents");
      return;
    }

    if (routeState.source === "local" && routeState.localFileName) {
      setSource("local");
      setLocalFileName(routeState.localFileName);
      setLocalFilePath(routeState.localFilePath ?? "");
      setLocalFilePages(routeState.localFilePages ?? 1);
      return;
    }

    setSelectedId((current) => current ?? documents[0]?.id ?? null);
  }, [
    documents,
    routeState.localFileName,
    routeState.localFilePages,
    routeState.localFilePath,
    routeState.selectedDocumentId,
    routeState.source,
  ]);

  function handleClose() {
    if (routeState.returnTo === "scan") {
      navigate("/scan", { state: { step: "save" } });
      return;
    }

    navigate("/scan", { state: { step: "save" } });
  }

  function goToSettings(state: PrintFlowState) {
    navigate("/print/settings", { state });
  }

  function buildFlowState(overrides: Partial<PrintFlowState> & Pick<PrintFlowState, "source">): PrintFlowState {
    return {
      returnTo: routeState.returnTo,
      scannerDeviceId: routeState.scannerDeviceId,
      scannerDeviceName: routeState.scannerDeviceName,
      ...overrides,
    };
  }

  function handleContinue() {
    if (source === "local") {
      if (!localFileName) {
        setShowBrowseModal(true);
        return;
      }

      goToSettings(
        buildFlowState({
          source: "local",
          localFileName,
          localFilePath,
          localFilePages: localFilePages || 1,
        }),
      );
      return;
    }

    if (!selectedId) return;

    goToSettings(
      buildFlowState({
        source: "documents",
        selectedDocumentId: selectedId,
      }),
    );
  }

  return (
    <>
      <div className="print-saved-document-page" data-screen="print-saved-document">
        <ScanModalShell
          wide
          title="Print Saved Document"
          subtitle="Choose a scanned document already saved in your records, or browse a file from this computer."
          onClose={handleClose}
          footer={
            <>
              <button type="button" className="scan-btn scan-btn--outline" onClick={handleClose}>
                Cancel
              </button>
              <button
                type="button"
                className="scan-btn scan-btn--primary"
                onClick={handleContinue}
                disabled={source === "documents" ? !selectedId : false}
              >
                Continue
              </button>
            </>
          }
        >
          <div className="print-source-cards">
            <button
              type="button"
              className={`print-source-card${source === "documents" ? " print-source-card--active" : ""}`}
              onClick={() => setSource("documents")}
            >
              <span className="print-source-card__title">Choose from Documents</span>
              <span className="print-source-card__desc">
                Print a scanned document saved inside the application.
              </span>
            </button>
            <button
              type="button"
              className={`print-source-card${source === "local" ? " print-source-card--active" : ""}`}
              onClick={() => setSource("local")}
            >
              <span className="print-source-card__title">Browse Local File</span>
              <span className="print-source-card__desc">
                Print a PDF, image, or document from a local folder.
              </span>
            </button>
          </div>

          {source === "documents" ? (
            <div className="print-document-list">
              {documents.length === 0 ? (
                <p className="print-document-list__empty">
                  No saved documents yet. Scan and save a document first.
                </p>
              ) : (
                documents.map((doc) => {
                  const active = doc.id === selectedId;
                  const FileIcon = doc.fileType === "PDF" ? FileText : FileImage;
                  return (
                    <button
                      key={doc.id}
                      type="button"
                      className={`print-document-list__item${active ? " print-document-list__item--active" : ""}`}
                      onClick={() => setSelectedId(doc.id)}
                    >
                      <span className="print-document-list__file">
                        <FileIcon className="print-document-list__file-icon" strokeWidth={1.8} />
                        <span className="print-document-list__name">{doc.fileName}</span>
                      </span>
                      <span className="print-document-list__pages">
                        {doc.pages} {doc.pages === 1 ? "page" : "pages"}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          ) : (
            <div className="print-local-file-panel">
              {localFileName ? (
                <button
                  type="button"
                  className="print-document-list__item print-document-list__item--active print-local-file-panel__selected"
                  onClick={() => setShowBrowseModal(true)}
                >
                  <span className="print-document-list__name">{localFileName}</span>
                  <span className="print-document-list__pages">
                    {localFilePages} {localFilePages === 1 ? "page" : "pages"}
                  </span>
                </button>
              ) : (
                <p className="print-document-list__hint">
                  Select Continue to browse files on this computer.
                </p>
              )}
              <button
                type="button"
                className="scan-btn scan-btn--outline print-local-file-panel__browse"
                onClick={() => setShowBrowseModal(true)}
              >
                Browse Files
              </button>
            </div>
          )}
        </ScanModalShell>
      </div>

      {showBrowseModal ? (
        <BrowseLocalPrintFileModal
          onClose={() => setShowBrowseModal(false)}
          onApply={(file) => {
            setLocalFileName(file.name);
            setLocalFilePath(file.path);
            setLocalFilePages(file.pages);
            setShowBrowseModal(false);
            goToSettings(
              buildFlowState({
                source: "local",
                localFileName: file.name,
                localFilePath: file.path,
                localFilePages: file.pages,
              }),
            );
          }}
        />
      ) : null}
    </>
  );
}
