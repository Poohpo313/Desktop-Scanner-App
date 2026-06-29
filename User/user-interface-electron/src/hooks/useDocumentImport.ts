import { useCallback, useState } from "react";
import type { AddSavedDocumentInput, SavedDocument } from "../lib/documents";
import {
  getDocumentsStorageRoot,
  rememberSaveDirectory,
} from "../lib/documentStorageConfig";
import { resolveFolderDiskPath } from "../components/documents/documentsPageData";

const SUPPORTED_IMPORT_EXTENSIONS = [".pdf", ".png", ".jpg", ".jpeg"];

function isSupportedImportName(name: string): boolean {
  const lower = name.toLowerCase();
  return SUPPORTED_IMPORT_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

function extensionToFormat(name: string): AddSavedDocumentInput["fileFormat"] {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "png") return "png";
  if (ext === "jpg" || ext === "jpeg") return "jpeg";
  return "pdf";
}

type ImportHandlers = {
  userId: number | null;
  addDocument: (input: AddSavedDocumentInput) => SavedDocument;
  selectedFolderId: string;
  customFolders?: { id: string; label: string }[];
  onImported?: (document: SavedDocument) => void;
  onRefresh?: () => void | Promise<void>;
};

export function useDocumentImport(handlers: ImportHandlers) {
  const [importing, setImporting] = useState(false);
  const [importFileCount, setImportFileCount] = useState(0);
  const [importNotice, setImportNotice] = useState<string | null>(null);

  const importFilePath = useCallback(
    async (filePath: string, fileName: string, size = 0) => {
      if (!isSupportedImportName(fileName)) {
        setImportNotice("Unsupported file type. Use PDF, PNG, or JPG.");
        return null;
      }

      const storageRoot = getDocumentsStorageRoot(handlers.userId);
      const targetDir = resolveFolderDiskPath(
        handlers.selectedFolderId,
        storageRoot,
        handlers.customFolders ?? [],
      );

      let storedPath = filePath;
      let storedSize = size;

      if (
        window.bukolabs?.filesystem?.importDocumentToFolder &&
        !filePath.toLowerCase().startsWith(storageRoot.toLowerCase())
      ) {
        const copied = await window.bukolabs.filesystem.importDocumentToFolder({
          sourcePath: filePath,
          targetDir,
        });
        if (!copied.success || !copied.path) {
          setImportNotice(copied.error ?? "Could not copy file into storage folder.");
          return null;
        }
        storedPath = copied.path;
        storedSize = copied.size ?? size;
        fileName = copied.fileName ?? fileName;
      }

      let ocrText: string | undefined;
      if (window.bukolabs?.files?.extractOcrFromPath) {
        const extracted = await window.bukolabs.files.extractOcrFromPath({ path: storedPath });
        ocrText = extracted.ocrText?.trim() || undefined;
      }

      const entry = handlers.addDocument({
        fileName,
        pages: 1,
        departmentId: "others",
        customDepartmentLabel: "Imported",
        folderId: handlers.selectedFolderId.startsWith("custom/")
          ? handlers.selectedFolderId
          : undefined,
        fileFormat: extensionToFormat(fileName),
        savePath: storedPath,
        cloudSync: false,
        fileSizeBytes: storedSize,
        ocrText,
      });

      rememberSaveDirectory(handlers.userId, storedPath);
      handlers.onImported?.(entry);
      await handlers.onRefresh?.();
      return entry;
    },
    [handlers],
  );

  const importFromPicker = useCallback(async () => {
    if (!window.bukolabs?.filesystem?.pickDocument) return null;
    const storageRoot = getDocumentsStorageRoot(handlers.userId);
    const picked = await window.bukolabs.filesystem.pickDocument({ defaultPath: storageRoot });
    if (picked.canceled || !picked.path || !picked.name) return null;

    setImporting(true);
    setImportFileCount(1);
    setImportNotice(null);
    try {
      const entry = await importFilePath(picked.path, picked.name, picked.size ?? 0);
      if (entry) setImportNotice(`Imported ${entry.fileName}.`);
      return entry;
    } finally {
      setImporting(false);
      setImportFileCount(0);
    }
  }, [handlers.userId, importFilePath]);

  const importDroppedFiles = useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files);
      if (list.length === 0) return;

      setImporting(true);
      setImportFileCount(list.length);
      setImportNotice(null);
      let imported = 0;

      try {
        for (const file of list) {
          if (!isSupportedImportName(file.name)) continue;
          const buffer = await file.arrayBuffer();
          const blobPath = (file as File & { path?: string }).path;
          if (blobPath) {
            const entry = await importFilePath(blobPath, file.name, file.size);
            if (entry) imported += 1;
            continue;
          }

          if (!handlers.userId || !window.bukolabs?.files?.save) continue;
          const storageRoot = getDocumentsStorageRoot(handlers.userId);
          const saved = await window.bukolabs.files.save({
            imageBuffer: buffer,
            filename: file.name.replace(/\.[^.\\]+$/, ""),
            userId: handlers.userId,
            fileType: extensionToFormat(file.name),
            exportFolder: storageRoot,
            skipOcr: false,
          });

          if (saved.filePath) {
            const entry = await importFilePath(saved.filePath, saved.fileName ?? file.name, file.size);
            if (entry) imported += 1;
          }
        }

        setImportNotice(
          imported > 0
            ? `Imported ${imported} file${imported === 1 ? "" : "s"}.`
            : "No supported files were imported.",
        );
      } finally {
        setImporting(false);
        setImportFileCount(0);
      }
    },
    [handlers.userId, importFilePath],
  );

  return {
    importing,
    importFileCount,
    importNotice,
    setImportNotice,
    importFromPicker,
    importDroppedFiles,
    importFilePath,
  };
}
