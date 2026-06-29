import { Check, X } from "lucide-react";
import { createPortal } from "react-dom";
import "../../styles/feedback-submitted-modal.css";

type FeedbackSubmittedModalProps = {
  onDone: () => void;
};

export function FeedbackSubmittedModal({ onDone }: FeedbackSubmittedModalProps) {
  return createPortal(
    <div className="feedback-submitted-modal-backdrop" role="presentation" onClick={onDone}>
      <div
        className="feedback-submitted-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="feedback-submitted-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="feedback-submitted-modal__close"
          onClick={onDone}
          aria-label="Close"
        >
          <X className="h-4 w-4" strokeWidth={2} />
        </button>

        <div className="feedback-submitted-modal__icon-wrap" aria-hidden="true">
          <Check className="feedback-submitted-modal__icon" strokeWidth={2.5} />
        </div>

        <h2 id="feedback-submitted-modal-title" className="feedback-submitted-modal__title">
          Feedback Submitted!
        </h2>

        <p className="feedback-submitted-modal__desc">
          Thank you for your feedback. Your response has been successfully submitted and will help us
          improve the Desktop Scanner System.
        </p>

        <button type="button" className="feedback-submitted-modal__done" onClick={onDone}>
          Done
        </button>
      </div>
    </div>,
    document.body,
  );
}
