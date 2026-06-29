export const PROFILE_PHOTO_UPDATED_EVENT = "bukolabs.profilePhotoUpdated";
export const MAX_PROFILE_PHOTO_BYTES = 5 * 1024 * 1024;

function storageKey(userId: number) {
  return `bukolabs.userProfilePhoto.v1.${userId}`;
}

export function loadProfilePhoto(userId: number | null | undefined): string | null {
  if (userId == null) return null;
  try {
    return localStorage.getItem(storageKey(userId));
  } catch {
    return null;
  }
}

export function saveProfilePhoto(userId: number, dataUrl: string) {
  localStorage.setItem(storageKey(userId), dataUrl);
  window.dispatchEvent(new CustomEvent(PROFILE_PHOTO_UPDATED_EVENT, { detail: { userId } }));
}

export function removeProfilePhoto(userId: number) {
  localStorage.removeItem(storageKey(userId));
  window.dispatchEvent(new CustomEvent(PROFILE_PHOTO_UPDATED_EVENT, { detail: { userId } }));
}

export function getProfileInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2);
}
