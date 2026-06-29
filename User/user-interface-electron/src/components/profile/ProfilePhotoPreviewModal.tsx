import { ProfilePhotoModalShell } from "./ProfilePhotoModalShell";
import "../../styles/profile-photo-modals.css";

type Props = {
  photoUrl: string;
  name: string;
  onClose: () => void;
};

export function ProfilePhotoPreviewModal({ photoUrl, name, onClose }: Props) {
  return (
    <ProfilePhotoModalShell
      className="profile-photo-modal--preview"
      title="Profile Photo"
      subtitle={name}
      onClose={onClose}
    >
      <div className="profile-photo-preview">
        <img className="profile-photo-preview__image" src={photoUrl} alt={`${name} profile photo`} />
      </div>
    </ProfilePhotoModalShell>
  );
}
