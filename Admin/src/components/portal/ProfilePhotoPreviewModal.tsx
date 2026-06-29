import FigmaModal from "./FigmaModal";
import closeIcon from "../../icons/Modal Header/Icon-209.svg";
import "../../styles/settings-profile-photo-preview.css";

type Props = {
  photoUrl: string;
  name: string;
  onClose: () => void;
};

export default function ProfilePhotoPreviewModal({ photoUrl, name, onClose }: Props) {
  return (
    <FigmaModal
      className="figma-modal--profile-photo-preview"
      title="Profile Photo"
      subtitle={name}
      onDismiss={onClose}
      closeIcon={<img src={closeIcon} alt="" aria-hidden="true" />}
    >
      <div className="profile-photo-preview">
        <img className="profile-photo-preview__image" src={photoUrl} alt={`${name} profile photo`} />
      </div>
    </FigmaModal>
  );
}
