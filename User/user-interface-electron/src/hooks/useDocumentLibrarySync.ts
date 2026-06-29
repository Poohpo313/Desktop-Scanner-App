import { useCallback, useRef, useState } from "react";
import { mergeFilesystemDocuments } from "../lib/documentLibrarySync";
import { getDocumentsStorageRoot } from "../lib/documentStorageConfig";
import type { SavedDocument } from "../lib/documents";

export function useDocumentLibrarySync(
  userId: number | null,
  documents: SavedDocument[],
  replaceDocuments: (documents: SavedDocument[]) => void,
) {
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [storageFolderPaths, setStorageFolderPaths] = useState<string[]>([]);
  const documentsRef = useRef(documents);
  documentsRef.current = documents;
  const storageRoot = getDocumentsStorageRoot(userId);

  const refreshFromStorage = useCallback(
    async (baselineDocuments?: SavedDocument[]) => {
    if (userId == null || !window.bukolabs?.filesystem?.listDocumentsInFolder) {
      setSyncMessage("Storage sync is unavailable.");
      return { success: false as const };
    }

    setSyncing(true);
    setSyncMessage(null);

    try {
      const validation = await window.bukolabs.filesystem.validateDirectory({ path: storageRoot });
      if (!validation.valid) {
        await window.bukolabs.filesystem.ensureDirectory({ path: storageRoot });
      }

      const scanned = await window.bukolabs.filesystem.listDocumentsInFolder({ path: storageRoot });
      if (scanned.error) {
        setSyncMessage(scanned.error);
        return { success: false as const, error: scanned.error };
      }

      setStorageFolderPaths(scanned.folders ?? []);
      const merged = mergeFilesystemDocuments(
        baselineDocuments ?? documentsRef.current,
        scanned.files,
        storageRoot,
      );
      replaceDocuments(merged);
      setSyncMessage(`Synced ${merged.length} document${merged.length === 1 ? "" : "s"} from storage.`);
      return { success: true as const, count: merged.length };
    } catch {
      setSyncMessage("Could not refresh documents from storage.");
      return { success: false as const };
    } finally {
      setSyncing(false);
    }
  },
    [replaceDocuments, storageRoot, userId],
  );

  return {
    storageRoot,
    storageFolderPaths,
    syncing,
    syncMessage,
    setSyncMessage,
    refreshFromStorage,
  };
}
