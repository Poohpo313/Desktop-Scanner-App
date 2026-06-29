import { ChevronDown, Info, Mail, MessageSquareMore, Star, X } from "lucide-react";
import { FormEvent, useState } from "react";
import { createPortal } from "react-dom";
import { FEEDBACK_TYPES, type FeedbackTypeId, type SendFeedbackPayload } from "./sendFeedbackData";
import "../../styles/send-feedback-modal.css";

type SendFeedbackModalProps = {
  defaultEmail?: string;
  onCancel: () => void;
  onSubmit: (payload: SendFeedbackPayload) => void;
};

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (rating: number) => void;
}) {
  return (
    <div className="send-feedback-modal__stars" role="radiogroup" aria-label="Experience rating">
      {Array.from({ length: 5 }, (_, index) => {
        const starValue = index + 1;
        const filled = starValue <= value;
        return (
          <button
            key={starValue}
            type="button"
            role="radio"
            aria-checked={value === starValue}
            aria-label={`${starValue} star${starValue === 1 ? "" : "s"}`}
            className={`send-feedback-modal__star${filled ? " send-feedback-modal__star--filled" : ""}`}
            onClick={() => onChange(starValue)}
          >
            <Star className="h-5 w-5" strokeWidth={1.8} fill={filled ? "currentColor" : "none"} />
          </button>
        );
      })}
    </div>
  );
}

export function SendFeedbackModal({ defaultEmail = "", onCancel, onSubmit }: SendFeedbackModalProps) {
  const [feedbackType, setFeedbackType] = useState<FeedbackTypeId>("general");
  const [rating, setRating] = useState(4);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState(defaultEmail);

  const trimmedMessage = message.trim();
  const canSubmit = trimmedMessage.length > 0;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;
    onSubmit({
      feedbackType,
      rating,
      message: trimmedMessage,
      email: email.trim(),
    });
  }

  return createPortal(
    <div className="send-feedback-modal-backdrop" role="presentation" onClick={onCancel}>
      <div
        className="send-feedback-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="send-feedback-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="send-feedback-modal__close"
          onClick={onCancel}
          aria-label="Close"
        >
          <X className="h-4 w-4" strokeWidth={2} />
        </button>

        <header className="send-feedback-modal__hero">
          <div className="send-feedback-modal__icon-wrap" aria-hidden="true">
            <MessageSquareMore className="send-feedback-modal__icon" strokeWidth={1.8} />
          </div>
          <h2 id="send-feedback-modal-title" className="send-feedback-modal__title">
            Send Feedback
          </h2>
          <p className="send-feedback-modal__subtitle">
            Help us improve Desktop Scanner by sharing your experience, suggestions, or comments
            about the system.
          </p>
        </header>

        <form className="send-feedback-modal__form" onSubmit={handleSubmit}>
          <div className="send-feedback-modal__body">
            <label className="send-feedback-modal__field">
              <span className="send-feedback-modal__label">Feedback Type</span>
              <div className="send-feedback-modal__select-wrap">
                <MessageSquareMore className="send-feedback-modal__field-icon" strokeWidth={1.8} />
                <select
                  className="send-feedback-modal__select"
                  value={feedbackType}
                  onChange={(event) => setFeedbackType(event.target.value as FeedbackTypeId)}
                >
                  {FEEDBACK_TYPES.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="send-feedback-modal__select-chevron" strokeWidth={1.8} />
              </div>
            </label>

            <div className="send-feedback-modal__rating-card">
              <div>
                <p className="send-feedback-modal__rating-title">How was your experience?</p>
                <p className="send-feedback-modal__rating-hint">Select a quick satisfaction rating.</p>
              </div>
              <StarRating value={rating} onChange={setRating} />
            </div>

            <label className="send-feedback-modal__field">
              <span className="send-feedback-modal__label">Message</span>
              <textarea
                className="send-feedback-modal__textarea"
                placeholder="Tell us what you think about the app..."
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                rows={4}
              />
            </label>

            <label className="send-feedback-modal__field">
              <span className="send-feedback-modal__label">Optional Email</span>
              <div className="send-feedback-modal__input-wrap">
                <Mail className="send-feedback-modal__field-icon" strokeWidth={1.8} />
                <input
                  type="email"
                  className="send-feedback-modal__input"
                  placeholder="johndoe@email.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
            </label>

            <div className="send-feedback-modal__info">
              <span className="send-feedback-modal__info-icon" aria-hidden="true">
                <Info className="h-4 w-4" strokeWidth={2} />
              </span>
              <div>
                <strong>Feedback helps improve the app</strong>
                <p>
                  Your feedback may be reviewed by the administrator to improve scanning, file
                  handling, and Cloud Sync experience.
                </p>
              </div>
            </div>
          </div>

          <footer className="send-feedback-modal__footer">
            <button type="button" className="send-feedback-modal__btn send-feedback-modal__btn--cancel" onClick={onCancel}>
              Cancel
            </button>
            <button
              type="submit"
              className="send-feedback-modal__btn send-feedback-modal__btn--submit"
              disabled={!canSubmit}
            >
              Submit Feedback
            </button>
          </footer>
        </form>
      </div>
    </div>,
    document.body,
  );
}
