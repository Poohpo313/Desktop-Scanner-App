import { useCallback, useState } from "react";
import Cropper, { type Area, type Point } from "react-easy-crop";
import FigmaModal from "./FigmaModal";
import closeIcon from "../../icons/Modal Header/Icon-209.svg";
import { getCroppedImageDataUrl } from "../../utils/cropImage";
import "react-easy-crop/react-easy-crop.css";
import "../../styles/settings-profile-photo-crop.css";

type Props = {
  imageSrc: string;
  onClose: () => void;
  onApply: (croppedImageUrl: string) => void;
  onError?: () => void;
};

export default function ProfilePhotoCropModal({ imageSrc, onClose, onApply, onError }: Props) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  const onCropComplete = useCallback((_croppedArea: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleApply = async () => {
    if (!croppedAreaPixels || isApplying) {
      return;
    }

    setIsApplying(true);

    try {
      const croppedImageUrl = await getCroppedImageDataUrl(imageSrc, croppedAreaPixels);
      onApply(croppedImageUrl);
      onClose();
    } catch {
      setIsApplying(false);
      onError?.();
    }
  };

  return (
    <FigmaModal
      className="figma-modal--profile-photo-crop"
      title="Crop Profile Photo"
      subtitle="Drag to reposition and use the slider to zoom."
      onDismiss={onClose}
      closeIcon={<img src={closeIcon} alt="" aria-hidden="true" />}
      footer={
        <>
          <button type="button" className="figma-btn figma-btn--secondary" onClick={onClose} disabled={isApplying}>
            Cancel
          </button>
          <button
            type="button"
            className="figma-btn figma-btn--primary"
            onClick={() => void handleApply()}
            disabled={!croppedAreaPixels || isApplying}
          >
            {isApplying ? "Applying..." : "Apply Crop"}
          </button>
        </>
      }
    >
      <div className="profile-photo-crop">
        <div className="profile-photo-crop__stage">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="rect"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        <label className="profile-photo-crop__zoom" htmlFor="profile-photo-crop-zoom">
          <span className="profile-photo-crop__zoom-label">Zoom</span>
          <input
            id="profile-photo-crop-zoom"
            className="profile-photo-crop__zoom-input"
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(event) => setZoom(Number(event.target.value))}
          />
        </label>
      </div>
    </FigmaModal>
  );
}
