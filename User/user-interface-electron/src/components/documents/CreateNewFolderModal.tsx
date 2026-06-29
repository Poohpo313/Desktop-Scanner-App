import { FolderPlus, X } from "lucide-react";
import { FormEvent, useState } from "react";
import { createPortal } from "react-dom";
import "../../styles/create-folder-modal.css";

const DESCRIPTION_LIMIT = 200;

export type CreateFolderPayload = {
  name: string;
  description: string;
};

type CreateNewFolderModalProps = {
  onCancel: () => void;
  onCreate: (payload: CreateFolderPayload) => void;
};

export function CreateNewFolderModal({ onCancel, onCreate }: CreateNewFolderModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const trimmedName = name.trim();
  const canCreate = trimmedName.length > 0;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!canCreate) return;
    onCreate({
      name: trimmedName,
      description: description.trim(),
    });
  }

  return createPortal(
    <div className="create-folder-modal-backdrop" role="presentation" onClick={onCancel}>
      <div
        className="create-folder-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-folder-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="create-folder-modal__header">
          <div className="create-folder-modal__title-row">
            <div className="create-folder-modal__icon-wrap" aria-hidden="true">
              <FolderPlus className="create-folder-modal__icon" strokeWidth={2} />
            </div>
            <h2 id="create-folder-modal-title" className="create-folder-modal__title">
              Create New Folder
            </h2>
          </div>
          <button
            type="button"
            className="create-folder-modal__close"
            onClick={onCancel}
            aria-label="Close"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </header>

        <form className="create-folder-modal__form" onSubmit={handleSubmit}>
          <div className="create-folder-modal__body">
            <label className="create-folder-modal__field">
              <span className="create-folder-modal__label">
                Folder Name <span className="create-folder-modal__required">*</span>
              </span>
              <input
                type="text"
                className="create-folder-modal__input"
                placeholder="Enter folder name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoFocus
              />
            </label>

            <label className="create-folder-modal__field">
              <span className="create-folder-modal__label create-folder-modal__label--optional">
                Description (optional)
              </span>
              <div className="create-folder-modal__textarea-wrap">
                <textarea
                  className="create-folder-modal__textarea"
                  placeholder="Enter a description for this folder..."
                  value={description}
                  maxLength={DESCRIPTION_LIMIT}
                  rows={4}
                  onChange={(event) => setDescription(event.target.value)}
                />
                <span className="create-folder-modal__counter">
                  {description.length} / {DESCRIPTION_LIMIT}
                </span>
              </div>
            </label>
          </div>

          <footer className="create-folder-modal__footer">
            <button type="button" className="create-folder-modal__btn create-folder-modal__btn--cancel" onClick={onCancel}>
              Cancel
            </button>
            <button
              type="submit"
              className="create-folder-modal__btn create-folder-modal__btn--create"
              disabled={!canCreate}
            >
              Create Folder
            </button>
          </footer>
        </form>
      </div>
    </div>,
    document.body,
  );
}
