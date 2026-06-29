import type { SavedDocument } from "./documents";

const PENDING_SAVE_PREVIEW_KEY = "bukolabs-pending-save-preview";

export type PendingSavePreview = Pick<
  SavedDocument,
  "fileName" | "savePath" | "department" | "departmentId"
>;

export function persistPendingSavePreview(preview: PendingSavePreview | null) {
  if (preview) {
    sessionStorage.setItem(PENDING_SAVE_PREVIEW_KEY, JSON.stringify(preview));
    return;
  }
  sessionStorage.removeItem(PENDING_SAVE_PREVIEW_KEY);
}

export function readPendingSavePreview(): PendingSavePreview | null {
  try {
    const raw = sessionStorage.getItem(PENDING_SAVE_PREVIEW_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingSavePreview;
    if (!parsed?.fileName || !parsed?.savePath) return null;
    return parsed;
  } catch {
    return null;
  }
}
