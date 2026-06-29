import { Info, X } from "lucide-react";

type ScanOfflineNoticeProps = {
  message: string;
  onDismiss: () => void;
};

export function ScanOfflineNotice({ message, onDismiss }: ScanOfflineNoticeProps) {
  return (
    <div className="scan-offline-notice" role="status">
      <Info className="scan-offline-notice__icon" strokeWidth={2} aria-hidden="true" />
      <p className="scan-offline-notice__text">{message}</p>
      <button type="button" className="scan-offline-notice__close" onClick={onDismiss} aria-label="Dismiss">
        <X className="h-4 w-4" strokeWidth={2} />
      </button>
    </div>
  );
}
