import { AlertTriangle, ChevronDown, CircleAlert, Paperclip, X } from "lucide-react";
import { ChangeEvent, FormEvent, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ISSUE_CATEGORIES, type IssueCategoryId, type ReportIssuePayload } from "./reportIssueData";
import "../../styles/report-issue-modal.css";

type ReportIssueModalProps = {
  onCancel: () => void;
  onSubmit: (payload: ReportIssuePayload) => void;
};

export function ReportIssueModal({ onCancel, onSubmit }: ReportIssueModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [category, setCategory] = useState<IssueCategoryId>("scanner");
  const [description, setDescription] = useState("");
  const [screenshotName, setScreenshotName] = useState<string | null>(null);

  const trimmedDescription = description.trim();
  const canSubmit = trimmedDescription.length > 0;

  function handleScreenshotChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setScreenshotName(file ? file.name : null);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;
    onSubmit({
      category,
      description: trimmedDescription,
      screenshotName,
    });
  }

  return createPortal(
    <div className="report-issue-modal-backdrop" role="presentation" onClick={onCancel}>
      <div
        className="report-issue-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-issue-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="report-issue-modal__close"
          onClick={onCancel}
          aria-label="Close"
        >
          <X className="h-4 w-4" strokeWidth={2} />
        </button>

        <header className="report-issue-modal__hero">
          <div className="report-issue-modal__icon-wrap" aria-hidden="true">
            <CircleAlert className="report-issue-modal__icon" strokeWidth={1.8} />
          </div>
          <h2 id="report-issue-modal-title" className="report-issue-modal__title">
            Report an Issue
          </h2>
          <p className="report-issue-modal__subtitle">
            Tell us what is not working. Your report will help the administrator review scanner,
            file, account, or Cloud Sync problems.
          </p>
        </header>

        <form className="report-issue-modal__form" onSubmit={handleSubmit}>
          <div className="report-issue-modal__body">
            <label className="report-issue-modal__field">
              <span className="report-issue-modal__label">Issue Category</span>
              <div className="report-issue-modal__select-wrap">
                <AlertTriangle className="report-issue-modal__field-icon" strokeWidth={1.8} />
                <select
                  className="report-issue-modal__select"
                  value={category}
                  onChange={(event) => setCategory(event.target.value as IssueCategoryId)}
                >
                  {ISSUE_CATEGORIES.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="report-issue-modal__select-chevron" strokeWidth={1.8} />
              </div>
            </label>

            <label className="report-issue-modal__field">
              <span className="report-issue-modal__label">Issue Description</span>
              <textarea
                className="report-issue-modal__textarea"
                placeholder="Describe the issue here. Example: The scanner is connected but not appearing in the device list..."
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={5}
              />
            </label>

            <button
              type="button"
              className="report-issue-modal__attach"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="report-issue-modal__attach-icon" strokeWidth={1.8} />
              <div className="report-issue-modal__attach-copy">
                <span className="report-issue-modal__attach-title">Attach Screenshot</span>
                <span className="report-issue-modal__attach-hint">
                  {screenshotName
                    ? `Selected: ${screenshotName}`
                    : "Optional: Add a screenshot to help the administrator understand the problem."}
                </span>
              </div>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="report-issue-modal__file-input"
              onChange={handleScreenshotChange}
            />

            <div className="report-issue-modal__info">
              <span className="report-issue-modal__info-icon" aria-hidden="true">
                <CircleAlert className="h-4 w-4" strokeWidth={2} />
              </span>
              <div>
                <strong>Issue report will be sent to admin</strong>
                <p>
                  Reports may include selected system details to help diagnose and resolve the issue
                  faster.
                </p>
              </div>
            </div>
          </div>

          <footer className="report-issue-modal__footer">
            <button
              type="button"
              className="report-issue-modal__btn report-issue-modal__btn--cancel"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="report-issue-modal__btn report-issue-modal__btn--submit"
              disabled={!canSubmit}
            >
              Submit Report
            </button>
          </footer>
        </form>
      </div>
    </div>,
    document.body,
  );
}
