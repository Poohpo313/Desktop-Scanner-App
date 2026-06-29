import "../../styles/import-progress-modal.css";

type ImportProgressModalProps = {
  fileCount?: number;
};

export function ImportProgressModal({ fileCount }: ImportProgressModalProps) {
  const label =
    fileCount && fileCount > 1
      ? `Please wait — importing ${fileCount} files…`
      : "Please wait — importing file…";

  return (
    <div className="import-progress-backdrop" role="presentation">
      <section
        className="import-progress-modal"
        role="alertdialog"
        aria-modal="true"
        aria-live="polite"
        aria-busy="true"
        aria-label="Import in progress"
      >
        <div className="import-progress-modal__spinner" aria-hidden="true" />
        <h2 className="import-progress-modal__title">{label}</h2>
        <p className="import-progress-modal__text">
          Files are being copied into your storage folder and indexed for search. This may take a
          moment for large PDFs.
        </p>
      </section>
    </div>
  );
}
