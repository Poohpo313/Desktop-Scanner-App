import { X } from "lucide-react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";

type ScanModalShellProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
  wide?: boolean;
  elevated?: boolean;
  usePortal?: boolean;
};

export function ScanModalShell({
  title,
  subtitle,
  children,
  footer,
  onClose,
  wide = false,
  elevated = false,
  usePortal = false,
}: ScanModalShellProps) {
  const content = (
    <div
      className={`scan-modal-backdrop${elevated ? " scan-modal-backdrop--elevated" : ""}`}
      role="presentation"
      onClick={onClose}
    >
      <div
        className={`scan-modal${wide ? " scan-modal--wide" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="scan-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="scan-modal__header">
          <div>
            <h2 id="scan-modal-title" className="scan-modal__title">
              {title}
            </h2>
            {subtitle ? <p className="scan-modal__subtitle">{subtitle}</p> : null}
          </div>
          <button type="button" className="scan-modal__close" onClick={onClose} aria-label="Close">
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>

        <div className="scan-modal__body">{children}</div>

        {footer ? <div className="scan-modal__footer">{footer}</div> : null}
      </div>
    </div>
  );

  if (usePortal) {
    return createPortal(content, document.body);
  }

  return content;
}
