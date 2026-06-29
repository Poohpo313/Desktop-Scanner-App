import { Camera, FolderOpen } from "lucide-react";
import { useRef, useState, type ChangeEvent } from "react";
import { MAX_PROFILE_PHOTO_BYTES, getProfileInitials } from "../../lib/profilePhotoStorage";
import { ProfilePhotoCaptureModal } from "./ProfilePhotoCaptureModal";
import { ProfilePhotoCropModal } from "./ProfilePhotoCropModal";
import { ProfilePhotoPreviewModal } from "./ProfilePhotoPreviewModal";
import "../../styles/profile-photo-modals.css";

type Props = {
  name: string;
  photoUrl: string | null;
  onPhotoChange: (photoUrl: string | null) => void;
  onNotice?: (message: string, tone?: "success" | "danger" | "neutral") => void;
};

async function readImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Could not read image"));
    };
    reader.onerror = () => reject(new Error("Could not read image"));
    reader.readAsDataURL(file);
  });
}

export function ProfilePhotoIdentityCard({ name, photoUrl, onPhotoChange, onNotice }: Props) {
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [sourceMenuOpen, setSourceMenuOpen] = useState(false);
  const [cropSource, setCropSource] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [captureOpen, setCaptureOpen] = useState(false);

  function showNotice(message: string, tone: "success" | "danger" | "neutral" = "neutral") {
    onNotice?.(message, tone);
  }

  async function handleImageSelected(source: string) {
    setCropSource(source);
  }

  async function handleFileSelected(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showNotice("Please choose an image file.", "danger");
      return;
    }

    if (file.size > MAX_PROFILE_PHOTO_BYTES) {
      showNotice("Image must be 5 MB or smaller.", "danger");
      return;
    }

    try {
      await handleImageSelected(await readImageFile(file));
    } catch {
      showNotice("Could not read the selected image.", "danger");
    }
  }

  async function pickFromExplorer() {
    setSourceMenuOpen(false);

    if (window.bukolabs?.filesystem?.pickImage) {
      const picked = await window.bukolabs.filesystem.pickImage();
      if (picked.canceled || !picked.dataUrl) return;
      if (picked.size && picked.size > MAX_PROFILE_PHOTO_BYTES) {
        showNotice("Image must be 5 MB or smaller.", "danger");
        return;
      }
      await handleImageSelected(picked.dataUrl);
      return;
    }

    photoInputRef.current?.click();
  }

  function handleCropped(dataUrl: string) {
    onPhotoChange(dataUrl);
    showNotice("Profile photo updated.", "success");
  }

  function handleRemove() {
    if (!photoUrl) return;
    onPhotoChange(null);
    showNotice("Profile photo removed.", "neutral");
  }

  return (
    <>
      <div className="settings-figma__identity-card">
        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          className="settings-figma__photo-input"
          aria-hidden="true"
          tabIndex={-1}
          onChange={(event) => void handleFileSelected(event)}
        />

        <div className="settings-figma__avatar-wrap">
          {photoUrl ? (
            <button
              type="button"
              className="settings-figma__avatar-button"
              onClick={() => setPreviewOpen(true)}
              aria-label={`View profile photo for ${name}`}
            >
              <img className="settings-figma__avatar" src={photoUrl} alt="" />
            </button>
          ) : (
            <div className="settings-figma__avatar settings-figma__avatar--placeholder" aria-hidden="true">
              {getProfileInitials(name)}
            </div>
          )}

          <button
            type="button"
            className="settings-figma__avatar-camera"
            aria-label="Change profile photo"
            aria-expanded={sourceMenuOpen}
            onClick={() => setSourceMenuOpen((open) => !open)}
          >
            <Camera size={15} strokeWidth={2} />
          </button>

          {sourceMenuOpen ? (
            <div className="profile-photo-source-menu" role="menu">
              <button
                type="button"
                className="profile-photo-source-menu__item"
                role="menuitem"
                onClick={() => {
                  setSourceMenuOpen(false);
                  setCaptureOpen(true);
                }}
              >
                Take Photo
              </button>
              <button
                type="button"
                className="profile-photo-source-menu__item"
                role="menuitem"
                onClick={() => void pickFromExplorer()}
              >
                <span className="inline-flex items-center gap-2">
                  <FolderOpen size={15} strokeWidth={1.8} />
                  Choose from Explorer
                </span>
              </button>
            </div>
          ) : null}
        </div>

        <div className="settings-figma__identity-copy">
          <h2 className="settings-figma__identity-name">{name}</h2>
          <p className="settings-figma__identity-role">
            <span>Assigned User</span>
          </p>
          <div className="settings-figma__identity-actions">
            <button type="button" className="settings-figma__upload-link" onClick={() => void pickFromExplorer()}>
              Upload New Photo
            </button>
            <span className="settings-figma__identity-actions-sep" aria-hidden="true">
              ·
            </span>
            <button
              type="button"
              className="settings-figma__remove-link"
              onClick={handleRemove}
              disabled={!photoUrl}
            >
              Remove
            </button>
          </div>
        </div>
      </div>

      {cropSource ? (
        <ProfilePhotoCropModal
          imageSrc={cropSource}
          onClose={() => setCropSource(null)}
          onApply={handleCropped}
          onError={() => showNotice("Could not crop the selected image.", "danger")}
        />
      ) : null}

      {previewOpen && photoUrl ? (
        <ProfilePhotoPreviewModal photoUrl={photoUrl} name={name} onClose={() => setPreviewOpen(false)} />
      ) : null}

      {captureOpen ? (
        <ProfilePhotoCaptureModal
          onClose={() => setCaptureOpen(false)}
          onCapture={(dataUrl) => {
            setCaptureOpen(false);
            void handleImageSelected(dataUrl);
          }}
        />
      ) : null}
    </>
  );
}
