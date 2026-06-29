import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { APP_STORAGE_KEYS } from "../config/appStorage";
import {
  buildSavedDocument,
  type AddSavedDocumentInput,
  type SavedDocument,
} from "../lib/documents";
import { buildDeletedDocument, type DeletedDocument } from "../lib/deletedDocuments";
import { useSession } from "./SessionContext";

type DocumentsContextValue = {
  documents: SavedDocument[];
  deletedDocuments: DeletedDocument[];
  addDocument: (input: AddSavedDocumentInput) => SavedDocument;
  replaceDocuments: (documents: SavedDocument[]) => void;
  updateDocument: (documentId: string, patch: Partial<SavedDocument>) => void;
  removeDocument: (documentId: string) => void;
  moveToRecycleBin: (documentId: string, originalFolder: string, recycledSavePath?: string) => void;
  restoreDocument: (deletedId: string) => void;
  restoreAllDocuments: () => void;
  permanentlyDelete: (deletedId: string) => void;
  deleteAllPermanently: () => void;
  documentCount: number;
  pageCount: number;
  storageBytes: number;
};

const DocumentsContext = createContext<DocumentsContextValue | null>(null);

function loadStoredDocuments(userId: number): SavedDocument[] {
  try {
    const raw = localStorage.getItem(`${APP_STORAGE_KEYS.documents}-${userId}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedDocument[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function loadStoredDeletedDocuments(userId: number): DeletedDocument[] {
  try {
    const raw = localStorage.getItem(`${APP_STORAGE_KEYS.deletedDocuments}-${userId}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as DeletedDocument[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function resolveDocuments(userId: number | null): SavedDocument[] {
  if (userId == null) return [];
  return loadStoredDocuments(userId);
}

function resolveDeletedDocuments(userId: number | null): DeletedDocument[] {
  if (userId == null) return [];
  return loadStoredDeletedDocuments(userId);
}

function persistDocuments(userId: number, documents: SavedDocument[]) {
  localStorage.setItem(`${APP_STORAGE_KEYS.documents}-${userId}`, JSON.stringify(documents));
}

function persistDeletedDocuments(userId: number, documents: DeletedDocument[]) {
  localStorage.setItem(
    `${APP_STORAGE_KEYS.deletedDocuments}-${userId}`,
    JSON.stringify(documents),
  );
}

export function DocumentsProvider({ children }: { children: ReactNode }) {
  const { session } = useSession();
  const userId = session.userId;
  const [documents, setDocuments] = useState<SavedDocument[]>(() => resolveDocuments(userId));
  const [deletedDocuments, setDeletedDocuments] = useState<DeletedDocument[]>(() =>
    resolveDeletedDocuments(userId),
  );

  useEffect(() => {
    setDocuments(resolveDocuments(userId));
    setDeletedDocuments(resolveDeletedDocuments(userId));
  }, [userId]);

  const addDocument = useCallback(
    (input: AddSavedDocumentInput) => {
      const entry = buildSavedDocument(input);
      if (userId == null) return entry;

      setDocuments((current) => {
        const next = [entry, ...current];
        persistDocuments(userId, next);
        return next;
      });

      return entry;
    },
    [userId],
  );

  const replaceDocuments = useCallback(
    (nextDocuments: SavedDocument[]) => {
      if (userId == null) return;
      setDocuments(nextDocuments);
      persistDocuments(userId, nextDocuments);
    },
    [userId],
  );

  const updateDocument = useCallback(
    (documentId: string, patch: Partial<SavedDocument>) => {
      if (userId == null) return;
      setDocuments((current) => {
        const next = current.map((doc) => (doc.id === documentId ? { ...doc, ...patch } : doc));
        persistDocuments(userId, next);
        return next;
      });
    },
    [userId],
  );

  const removeDocument = useCallback(
    (documentId: string) => {
      if (userId == null) return;
      setDocuments((current) => {
        const next = current.filter((doc) => doc.id !== documentId);
        persistDocuments(userId, next);
        return next;
      });
    },
    [userId],
  );

  const moveToRecycleBin = useCallback(
    (documentId: string, originalFolder: string, recycledSavePath?: string) => {
      if (userId == null) return;

      setDocuments((current) => {
        const target = current.find((doc) => doc.id === documentId);
        if (!target) return current;

        const next = current.filter((doc) => doc.id !== documentId);
        persistDocuments(userId, next);

        setDeletedDocuments((deleted) => {
          const nextDeleted = [
            buildDeletedDocument(target, originalFolder, recycledSavePath),
            ...deleted,
          ];
          persistDeletedDocuments(userId, nextDeleted);
          return nextDeleted;
        });

        return next;
      });
    },
    [userId],
  );

  const restoreDocument = useCallback(
    (deletedId: string) => {
      if (userId == null) return;

      setDeletedDocuments((current) => {
        const target = current.find((doc) => doc.id === deletedId);
        if (!target) return current;

        const nextDeleted = current.filter((doc) => doc.id !== deletedId);
        persistDeletedDocuments(userId, nextDeleted);

        setDocuments((active) => {
          const restored = {
            ...target.sourceDocument,
            id: `doc-restored-${Date.now()}`,
            modifiedAt: new Date().toISOString(),
          };
          const nextActive = [restored, ...active];
          persistDocuments(userId, nextActive);
          return nextActive;
        });

        return nextDeleted;
      });
    },
    [userId],
  );

  const restoreAllDocuments = useCallback(() => {
    if (userId == null) return;

    setDeletedDocuments((current) => {
      if (current.length === 0) return current;

      setDocuments((active) => {
        const restoredDocs = current.map((target, index) => ({
          ...target.sourceDocument,
          id: `doc-restored-${Date.now()}-${index}`,
          modifiedAt: new Date().toISOString(),
        }));
        const nextActive = [...restoredDocs, ...active];
        persistDocuments(userId, nextActive);
        return nextActive;
      });

      persistDeletedDocuments(userId, []);
      return [];
    });
  }, [userId]);

  const permanentlyDelete = useCallback(
    (deletedId: string) => {
      if (userId == null) return;

      setDeletedDocuments((current) => {
        const next = current.filter((doc) => doc.id !== deletedId);
        persistDeletedDocuments(userId, next);
        return next;
      });
    },
    [userId],
  );

  const deleteAllPermanently = useCallback(() => {
    if (userId == null) return;

    setDeletedDocuments((current) => {
      if (current.length === 0) return current;
      persistDeletedDocuments(userId, []);
      return [];
    });
  }, [userId]);

  const value = useMemo(() => {
    const documentCount = documents.length;
    const pageCount = documents.reduce((sum, doc) => sum + doc.pages, 0);
    const storageBytes = documents.reduce((sum, doc) => sum + doc.fileSizeBytes, 0);

    return {
      documents,
      deletedDocuments,
      addDocument,
      replaceDocuments,
      updateDocument,
      removeDocument,
      moveToRecycleBin,
      restoreDocument,
      restoreAllDocuments,
      permanentlyDelete,
      deleteAllPermanently,
      documentCount,
      pageCount,
      storageBytes,
    };
  }, [
    documents,
    deletedDocuments,
    addDocument,
    replaceDocuments,
    updateDocument,
    removeDocument,
    moveToRecycleBin,
    restoreDocument,
    restoreAllDocuments,
    permanentlyDelete,
    deleteAllPermanently,
  ]);

  return <DocumentsContext.Provider value={value}>{children}</DocumentsContext.Provider>;
}

export function useDocuments() {
  const ctx = useContext(DocumentsContext);
  if (!ctx) throw new Error("useDocuments must be used within DocumentsProvider");
  return ctx;
}
