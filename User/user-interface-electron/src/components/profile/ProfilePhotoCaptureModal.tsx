import { useEffect, useRef, useState } from "react";
import { ProfilePhotoModalShell } from "./ProfilePhotoModalShell";
import "../../styles/profile-photo-modals.css";

type Props = {
  onClose: () => void;
  onCapture: (dataUrl: string) => void;
};

export function ProfilePhotoCaptureModal({ onClose, onCapture }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let cancelled = false;

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 960 } },
          audio: false,
        });
        if (cancelled) return;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setReady(true);
        }
      } catch {
        if (!cancelled) {
          setError("Could not access the camera. Check permissions or choose a photo from your computer.");
        }
      }
    }

    void startCamera();

    return () => {
      cancelled = true;
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  function handleCapture() {
    const video = videoRef.current;
    if (!video || !ready) return;

    const size = Math.min(video.videoWidth, video.videoHeight);
    const sx = (video.videoWidth - size) / 2;
    const sy = (video.videoHeight - size) / 2;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext("2d");
    if (!context) return;

    context.drawImage(video, sx, sy, size, size, 0, 0, size, size);
    onCapture(canvas.toDataURL("image/jpeg", 0.92));
    onClose();
  }

  return (
    <ProfilePhotoModalShell
      title="Take Profile Photo"
      subtitle="Position yourself in the frame, then capture."
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            className="profile-photo-modal__btn profile-photo-modal__btn--secondary"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="profile-photo-modal__btn profile-photo-modal__btn--primary"
            onClick={handleCapture}
            disabled={!ready}
          >
            Capture Photo
          </button>
        </>
      }
    >
      <div className="profile-photo-capture">
        {error ? <p className="profile-photo-capture__error">{error}</p> : null}
        <div className="profile-photo-capture__video-wrap">
          <video ref={videoRef} className="profile-photo-capture__video" playsInline muted />
        </div>
      </div>
    </ProfilePhotoModalShell>
  );
}
