import "../../../styles/import-progress-modal.css";

type DocumentSaveProgressModalProps = {
  ocrEnabled?: boolean;
};

export function DocumentSaveProgressModal({ ocrEnabled = false }: DocumentSaveProgressModalProps) {
  return (
    <div className="import-progress-backdrop" role="presentation">
      <section
        className="import-progress-modal"
        role="alertdialog"
        aria-modal="true"
        aria-live="polite"
        aria-busy="true"
        aria-label="Save in progress"
      >
        <div className="import-progress-modal__spinner" aria-hidden="true" />
        <h2 className="import-progress-modal__title">Please wait — saving your document…</h2>
        <p className="import-progress-modal__text">
          {ocrEnabled
            ? "Your scan is being written to disk and OCR text is being prepared. This may take a moment."
            : "Your scan is being written to disk. This may take a moment for large files."}
        </p>
      </section>
    </div>
  );
}
