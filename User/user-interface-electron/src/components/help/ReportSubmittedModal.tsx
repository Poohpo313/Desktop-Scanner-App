import { Check, X } from "lucide-react";
import { createPortal } from "react-dom";
import "../../styles/report-submitted-modal.css";

type ReportSubmittedModalProps = {
  onDone: () => void;
};

export function ReportSubmittedModal({ onDone }: ReportSubmittedModalProps) {
  return createPortal(
    <div className="report-submitted-modal-backdrop" role="presentation" onClick={onDone}>
      <div
        className="report-submitted-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-submitted-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="report-submitted-modal__close"
          onClick={onDone}
          aria-label="Close"
        >
          <X className="h-4 w-4" strokeWidth={2} />
        </button>

        <div className="report-submitted-modal__icon-wrap" aria-hidden="true">
          <Check className="report-submitted-modal__icon" strokeWidth={2.5} />
        </div>

        <h2 id="report-submitted-modal-title" className="report-submitted-modal__title">
          Report Submitted
          <br />
          Successfully!
        </h2>
      </div>
    </div>,
    document.body,
  );
}
