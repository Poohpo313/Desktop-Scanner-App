import { Pencil, X } from "lucide-react";
import { FormEvent, useState } from "react";
import { createPortal } from "react-dom";
import "../../styles/create-folder-modal.css";

type RenameItemModalProps = {
  title: string;
  initialName: string;
  onCancel: () => void;
  onConfirm: (name: string) => void;
};

export function RenameItemModal({ title, initialName, onCancel, onConfirm }: RenameItemModalProps) {
  const [name, setName] = useState(initialName);
  const trimmedName = name.trim();
  const canConfirm = trimmedName.length > 0 && trimmedName !== initialName.trim();

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!canConfirm) return;
    onConfirm(trimmedName);
  }

  return createPortal(
    <div className="create-folder-modal-backdrop" role="presentation" onClick={onCancel}>
      <div
        className="create-folder-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="rename-item-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="create-folder-modal__header">
          <div className="create-folder-modal__title-row">
            <div className="create-folder-modal__icon-wrap" aria-hidden="true">
              <Pencil className="create-folder-modal__icon" strokeWidth={2} />
            </div>
            <h2 id="rename-item-modal-title" className="create-folder-modal__title">
              {title}
            </h2>
          </div>
          <button type="button" className="create-folder-modal__close" onClick={onCancel} aria-label="Close">
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </header>

        <form className="create-folder-modal__form" onSubmit={handleSubmit}>
          <div className="create-folder-modal__body">
            <label className="create-folder-modal__field">
              <span className="create-folder-modal__label">
                Name <span className="create-folder-modal__required">*</span>
              </span>
              <input
                type="text"
                className="create-folder-modal__input"
                placeholder="Enter a new name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoFocus
              />
            </label>
          </div>

          <footer className="create-folder-modal__footer">
            <button type="button" className="create-folder-modal__btn create-folder-modal__btn--cancel" onClick={onCancel}>
              Cancel
            </button>
            <button
              type="submit"
              className="create-folder-modal__btn create-folder-modal__btn--create"
              disabled={!canConfirm}
            >
              Rename
            </button>
          </footer>
        </form>
      </div>
    </div>,
    document.body,
  );
}
