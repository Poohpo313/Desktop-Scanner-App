import { Check, FolderOpen, X } from "lucide-react";

type DocumentSaveSuccessToastProps = {
  onClose: () => void;
  onOpenFolder?: () => void;
  label?: string;
  title?: string;
  description?: string;
};

export function DocumentSaveSuccessToast({
  onClose,
  onOpenFolder,
  label = "DOCUMENTS SAVE",
  title = "Documents saved successfully",
  description = "Your save mode, folder settings, and file naming preferences were updated.",
}: DocumentSaveSuccessToastProps) {
  return (
    <div className="scan-save-toast-wrap" role="status" aria-live="polite">
      <p className="scan-save-toast__label">{label}</p>
      <div className="scan-save-toast">
        <span className="scan-save-toast__icon-wrap" aria-hidden="true">
          <Check className="scan-save-toast__icon-check" strokeWidth={3} />
        </span>
        <div className="scan-save-toast__body">
          <strong className="scan-save-toast__title">{title}</strong>
          <p className="scan-save-toast__desc">{description}</p>
          {onOpenFolder ? (
            <button type="button" className="scan-save-toast__action" onClick={onOpenFolder}>
              <FolderOpen className="h-4 w-4" strokeWidth={2} />
              Open Folder
            </button>
          ) : null}
        </div>
        <button
          type="button"
          className="scan-save-toast__close"
          onClick={onClose}
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
