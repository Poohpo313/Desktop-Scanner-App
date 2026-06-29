import { useCallback, useEffect, useState } from "react";
import {
  loadProfilePhoto,
  PROFILE_PHOTO_UPDATED_EVENT,
  removeProfilePhoto,
  saveProfilePhoto,
} from "../lib/profilePhotoStorage";

export function useProfilePhoto(userId: number | null | undefined) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(() => loadProfilePhoto(userId));

  useEffect(() => {
    setPhotoUrl(loadProfilePhoto(userId));
  }, [userId]);

  useEffect(() => {
    function handleUpdate(event: Event) {
      const detail = (event as CustomEvent<{ userId?: number }>).detail;
      if (detail?.userId != null && detail.userId !== userId) return;
      setPhotoUrl(loadProfilePhoto(userId));
    }

    window.addEventListener(PROFILE_PHOTO_UPDATED_EVENT, handleUpdate);
    return () => window.removeEventListener(PROFILE_PHOTO_UPDATED_EVENT, handleUpdate);
  }, [userId]);

  const setPhoto = useCallback(
    (dataUrl: string | null) => {
      if (userId == null) return;
      if (dataUrl) {
        saveProfilePhoto(userId, dataUrl);
      } else {
        removeProfilePhoto(userId);
      }
      setPhotoUrl(dataUrl);
    },
    [userId],
  );

  return { photoUrl, setPhoto };
}
