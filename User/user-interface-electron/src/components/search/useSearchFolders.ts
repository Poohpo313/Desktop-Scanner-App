import { useEffect, useState } from "react";
import { useDocuments } from "../../context/DocumentsContext";
import { useLocalFilesystem } from "../scan/offline/useLocalFilesystem";
import {
  DEFAULT_SCANNED_DOCUMENTS_ROOT,
  formatFolderLabel,
  getDocumentFolderPath,
  type SearchFolderOption,
} from "./searchFolders";

function addFolderOption(
  options: SearchFolderOption[],
  seen: Set<string>,
  path: string,
  label?: string,
) {
  const normalized = path.trim();
  if (!normalized) return;

  const key = normalized.toLowerCase();
  if (seen.has(key)) return;

  seen.add(key);
  options.push({
    id: normalized,
    label: label ?? formatFolderLabel(normalized),
    path: normalized,
  });
}

export function useSearchFolders() {
  const { documents } = useDocuments();
  const { getQuickLocations, listDirectories } = useLocalFilesystem();
  const [folders, setFolders] = useState<SearchFolderOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const options: SearchFolderOption[] = [];
      const seen = new Set<string>();

      addFolderOption(options, seen, DEFAULT_SCANNED_DOCUMENTS_ROOT, "Scanned Documents");

      for (const doc of documents) {
        addFolderOption(options, seen, getDocumentFolderPath(doc.savePath));
        addFolderOption(options, seen, doc.savePath);
      }

      try {
        const { locations } = await getQuickLocations();
        for (const location of locations) {
          if (cancelled) return;
          addFolderOption(options, seen, location.path, location.label);

          const result = await listDirectories(location.path);
          for (const folder of result.folders) {
            addFolderOption(options, seen, folder.path, folder.name);
          }
        }
      } catch {
        // Demo filesystem fallbacks are already included above.
      }

      if (cancelled) return;

      options.sort((a, b) => a.label.localeCompare(b.label));
      setFolders(options);
      setLoading(false);
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [documents, getQuickLocations, listDirectories]);

  return { folders, loading };
}
