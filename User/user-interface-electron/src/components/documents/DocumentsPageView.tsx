import {
  ChevronDown,
  ChevronRight,
  ExternalLink,
  FileImage,
  FileText,
  Folder,
  FolderOpen,
  Pencil,
  Plus,
  Printer,
  RefreshCw,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { useMemo, useState, useEffect, useCallback, useRef, type DragEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ImportProgressModal } from "./ImportProgressModal";
import { ConsolePageHeader } from "../layout/ConsolePageHeader";
import { getConsolePageTitle } from "../layout/consolePageMeta";
import { useDocuments } from "../../context/DocumentsContext";
import { useSession } from "../../context/SessionContext";
import { formatDocumentDate } from "../../lib/documents";
import { openDocumentFile } from "../../lib/openDocumentFile";
import { HighlightedText } from "../search/HighlightedText";
import { defaultSaveLocationPatch } from "../../lib/documentStorageConfig";
import { persistSettings, resolveSettings } from "../../lib/settingsStorage";
import { useDocumentImport } from "../../hooks/useDocumentImport";
import { useDocumentLibrarySync } from "../../hooks/useDocumentLibrarySync";
import { formatFolderLabel, getDocumentFolderPath } from "../search/searchFolders";
import {
  formatDeletedDate,
  formatFileSize,
  formatFileTypeLabel,
  type DeletedDocument,
} from "../../lib/deletedDocuments";
import type { SavedDocument } from "../../lib/documents";
import type { DocumentsLocationState } from "./documentsNavigation";
import { CreateNewFolderModal, type CreateFolderPayload } from "./CreateNewFolderModal";
import { RenameItemModal } from "./RenameItemModal";
import {
  buildActiveFileLocation,
  buildDeletedFileLocation,
  type FileLocationTarget,
} from "./documentsFileLocation";
import { OpenFileLocationModal } from "./OpenFileLocationModal";
import { RestoreDocumentModal } from "./RestoreDocumentModal";
import {
  buildDocumentFolderTree,
  filterActiveDocuments,
  filterActiveDocumentsBySearch,
  filterDeletedDocuments,
  getFolderBreadcrumb,
  listFolderAncestorIds,
  findFolderLabel,
  isSelectableFolderId,
  isStorageRootPath,
  RECYCLE_BIN_FOLDER_ID,
  resolveFolderDiskPath,
  slugifyFolderName,
  type FolderNode,
} from "./documentsPageData";
import "../../styles/documents-page.css";

const CUSTOM_FOLDERS_STORAGE_PREFIX = "bukolabs-custom-folders";
const DOCUMENT_DRAG_MIME = "application/x-bukolabs-document";

function loadCustomFolders(userId: number | null): FolderNode[] {
  if (userId == null) return [];
  try {
    const raw = localStorage.getItem(`${CUSTOM_FOLDERS_STORAGE_PREFIX}-${userId}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as FolderNode[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistCustomFolders(userId: number, folders: FolderNode[]) {
  localStorage.setItem(`${CUSTOM_FOLDERS_STORAGE_PREFIX}-${userId}`, JSON.stringify(folders));
}

function FileIcon({ type }: { type: string }) {
  if (type === "PDF") return <FileText className="docs-file-icon docs-file-icon--pdf" strokeWidth={1.8} />;
  return <FileImage className="docs-file-icon docs-file-icon--image" strokeWidth={1.8} />;
}

function FolderTreeItem({
  node,
  depth,
  selectedFolderId,
  expandedIds,
  dragOverFolderId,
  onToggle,
  onSelect,
  onFolderDragOver,
  onFolderDragLeave,
  onFolderDrop,
}: {
  node: FolderNode;
  depth: number;
  selectedFolderId: string;
  expandedIds: Set<string>;
  dragOverFolderId: string | null;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
  onFolderDragOver: (folderId: string, event: DragEvent<HTMLButtonElement>) => void;
  onFolderDragLeave: (folderId: string, event: DragEvent<HTMLButtonElement>) => void;
  onFolderDrop: (folderId: string, event: DragEvent<HTMLButtonElement>) => void;
}) {
  const hasChildren = Boolean(node.children?.length);
  const expanded = expandedIds.has(node.id);
  const active = selectedFolderId === node.id;
  const isDropTarget = dragOverFolderId === node.id;
  const droppable = node.id !== RECYCLE_BIN_FOLDER_ID;

  return (
    <li className="docs-folder-tree__item">
      <button
        type="button"
        className={`docs-folder-tree__button${active ? " docs-folder-tree__button--active" : ""}${isDropTarget ? " docs-folder-tree__button--drop-target" : ""}`}
        style={{ paddingLeft: `${12 + depth * 14}px` }}
        onClick={() => {
          onSelect(node.id);
          if (hasChildren) onToggle(node.id);
        }}
        onDragOver={droppable ? (event) => onFolderDragOver(node.id, event) : undefined}
        onDragLeave={droppable ? (event) => onFolderDragLeave(node.id, event) : undefined}
        onDrop={droppable ? (event) => onFolderDrop(node.id, event) : undefined}
      >
        {hasChildren ? (
          expanded ? (
            <ChevronDown className="docs-folder-tree__chevron" strokeWidth={2} />
          ) : (
            <ChevronRight className="docs-folder-tree__chevron" strokeWidth={2} />
          )
        ) : (
          <span className="docs-folder-tree__chevron-spacer" />
        )}
        <Folder className="docs-folder-tree__folder-icon" strokeWidth={1.8} />
        <span>{node.label}</span>
      </button>
      {hasChildren && expanded ? (
        <ul className="docs-folder-tree__children">
          {node.children!.map((child) => (
            <FolderTreeItem
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedFolderId={selectedFolderId}
              expandedIds={expandedIds}
              dragOverFolderId={dragOverFolderId}
              onToggle={onToggle}
              onSelect={onSelect}
              onFolderDragOver={onFolderDragOver}
              onFolderDragLeave={onFolderDragLeave}
              onFolderDrop={onFolderDrop}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export function DocumentsPageView() {
  const location = useLocation();
  const navigate = useNavigate();
  const routeState = (location.state as DocumentsLocationState | null) ?? {};
  const { session } = useSession();
  const { documents, deletedDocuments, addDocument, replaceDocuments, updateDocument, removeDocument, moveToRecycleBin, restoreDocument, restoreAllDocuments, permanentlyDelete, deleteAllPermanently } =
    useDocuments();
  const [selectedFolderId, setSelectedFolderId] = useState(
    () => routeState.folderId ?? "all",
  );
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set(["all"]));
  const [selectedActiveId, setSelectedActiveId] = useState<string | null>(
    () => routeState.selectedDocumentId ?? null,
  );
  const [selectedDeletedId, setSelectedDeletedId] = useState<string | null>(
    () => deletedDocuments[0]?.id ?? null,
  );
  const [searchQuery, setSearchQuery] = useState(() => routeState.searchQuery ?? "");
  const [fileTypeFilter, setFileTypeFilter] = useState(
    () => routeState.fileTypeFilter ?? "all",
  );
  const [deletedDateFilter, setDeletedDateFilter] = useState("all");
  const [restoreTarget, setRestoreTarget] = useState<DeletedDocument | null>(null);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [customFolders, setCustomFolders] = useState<FolderNode[]>(() =>
    loadCustomFolders(session.userId),
  );
  const [fileLocationTarget, setFileLocationTarget] = useState<FileLocationTarget | null>(null);
  const [renameTarget, setRenameTarget] = useState<
    | { kind: "file"; documentId: string; name: string; savePath: string }
    | { kind: "folder"; folderId: string; name: string; diskPath: string }
    | null
  >(null);
  const [fileOpenError, setFileOpenError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);
  const [draggingDocumentId, setDraggingDocumentId] = useState<string | null>(null);
  const initialSyncDone = useRef(false);

  const { storageRoot, storageFolderPaths, syncing, syncMessage, setSyncMessage, refreshFromStorage } =
    useDocumentLibrarySync(session.userId, documents, replaceDocuments);

  const {
    importing,
    importFileCount,
    importNotice,
    setImportNotice,
    importFromPicker,
    importDroppedFiles,
  } = useDocumentImport({
    userId: session.userId,
    addDocument,
    selectedFolderId,
    customFolders,
    onImported: (entry) => setSelectedActiveId(entry.id),
    onRefresh: () => refreshFromStorage(),
  });

  const folderTree = useMemo(
    () => buildDocumentFolderTree(documents, customFolders, storageRoot, storageFolderPaths),
    [documents, customFolders, storageRoot, storageFolderPaths],
  );
  const isRecycleBin = selectedFolderId === RECYCLE_BIN_FOLDER_ID;
  const isFolderSelected = isSelectableFolderId(selectedFolderId);
  const isStorageRootView = selectedFolderId === "all";
  const selectedFolderDiskPath = useMemo(
    () => resolveFolderDiskPath(selectedFolderId, storageRoot, customFolders),
    [customFolders, selectedFolderId, storageRoot],
  );
  const isSelectedStorageRoot = isStorageRootPath(selectedFolderDiskPath, storageRoot);

  const activeRows = useMemo(() => {
    const scoped = filterActiveDocuments(documents, selectedFolderId, storageRoot);
    return filterActiveDocumentsBySearch(scoped, searchQuery, fileTypeFilter);
  }, [documents, selectedFolderId, storageRoot, searchQuery, fileTypeFilter]);

  const deletedRows = useMemo(
    () => filterDeletedDocuments(deletedDocuments, searchQuery, fileTypeFilter, deletedDateFilter),
    [deletedDocuments, searchQuery, fileTypeFilter, deletedDateFilter],
  );

  const selectedActive = selectedActiveId
    ? activeRows.find((doc) => doc.id === selectedActiveId) ?? null
    : null;
  const selectedDeleted =
    deletedRows.find((doc) => doc.id === selectedDeletedId) ?? deletedRows[0] ?? null;

  const canOpenLocation = isRecycleBin
    ? Boolean(selectedDeleted)
    : Boolean(selectedActive) || isFolderSelected || selectedFolderId === "all";

  const canRenameSelection =
    !isRecycleBin &&
    (Boolean(selectedActive) || isFolderSelected || isStorageRootView);

  const breadcrumb = getFolderBreadcrumb(selectedFolderId, documents, customFolders);
  const hasIncomingSearch = Boolean(routeState.searchQuery?.trim());
  const canDeleteFolder =
    isFolderSelected &&
    !isSelectedStorageRoot &&
    selectedFolderDiskPath.toLowerCase() !== storageRoot.trim().replace(/\//g, "\\").replace(/\\+$/, "").toLowerCase();

  useEffect(() => {
    setCustomFolders(loadCustomFolders(session.userId));
  }, [session.userId]);

  useEffect(() => {
    if (initialSyncDone.current || session.userId == null) return;
    initialSyncDone.current = true;
    void refreshFromStorage();
  }, [refreshFromStorage, session.userId]);

  useEffect(() => {
    if (routeState.folderId) {
      setSelectedFolderId(routeState.folderId);
      setExpandedIds((current) => {
        const next = new Set(current);
        for (const id of listFolderAncestorIds(routeState.folderId!)) {
          next.add(id);
        }
        return next;
      });
    }

    if (routeState.selectedDocumentId) {
      setSelectedActiveId(routeState.selectedDocumentId);
    }

    if (routeState.openCreateFolder) {
      setShowCreateFolderModal(true);
    }
  }, [location.key, routeState.folderId, routeState.openCreateFolder, routeState.selectedDocumentId]);

  function toggleFolder(id: string) {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function openRestoreModal() {
    if (!selectedDeleted) return;
    setRestoreTarget(selectedDeleted);
  }

  function confirmRestore() {
    if (!restoreTarget) return;

    void (async () => {
      if (
        restoreTarget.recycledSavePath &&
        window.bukolabs?.filesystem?.restoreFromRecycleBin
      ) {
        const result = await window.bukolabs.filesystem.restoreFromRecycleBin({
          recycledPath: restoreTarget.recycledSavePath,
          originalPath: restoreTarget.originalSavePath,
        });
        if (!result.success) {
          setFileOpenError(result.error ?? "Could not restore file on this device.");
          return;
        }
      }

      restoreDocument(restoreTarget.id);
      setSelectedDeletedId(null);
      setRestoreTarget(null);
      void refreshFromStorage();
    })();
  }

  function cancelRestore() {
    setRestoreTarget(null);
  }

  function handlePermanentDelete() {
    if (!selectedDeleted) return;
    permanentlyDelete(selectedDeleted.id);
    setSelectedDeletedId(null);
  }

  function handleRestoreAll() {
    if (deletedRows.length === 0) return;

    void (async () => {
      if (window.bukolabs?.filesystem?.restoreFromRecycleBin) {
        for (const doc of deletedRows) {
          if (!doc.recycledSavePath) continue;
          const result = await window.bukolabs.filesystem.restoreFromRecycleBin({
            recycledPath: doc.recycledSavePath,
            originalPath: doc.originalSavePath,
          });
          if (!result.success) {
            setFileOpenError(result.error ?? `Could not restore ${doc.fileName}.`);
            return;
          }
        }
      }

      restoreAllDocuments();
      setSelectedDeletedId(null);
      void refreshFromStorage();
    })();
  }

  function handleDeleteAllPermanently() {
    if (deletedRows.length === 0) return;
    deleteAllPermanently();
    setSelectedDeletedId(null);
  }

  async function handleCreateFolder({ name }: CreateFolderPayload) {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    const parentPath = resolveFolderDiskPath(selectedFolderId, storageRoot, customFolders);
    const newFolderPath = `${parentPath}\\${trimmedName}`;

    const result = await window.bukolabs?.filesystem?.ensureDirectory?.({ path: newFolderPath });
    if (!result?.success) {
      setFileOpenError(result?.error ?? "Could not create folder.");
      return;
    }

    setSelectedFolderId(newFolderPath);
    setSelectedActiveId(null);
    setExpandedIds((current) => new Set([...current, "all", newFolderPath]));
    setShowCreateFolderModal(false);
    setFileOpenError(null);
    void refreshFromStorage();
  }

  async function handleDeleteFolder() {
    if (!canDeleteFolder) return;

    if (selectedFolderId.startsWith("custom/")) {
      setCustomFolders((current) => {
        const next = current.filter((folder) => folder.id !== selectedFolderId);
        if (session.userId != null) {
          persistCustomFolders(session.userId, next);
        }
        return next;
      });
      setSelectedFolderId("all");
      return;
    }

    await handleMoveFolderToRecycleBin();
  }

  function selectFolder(folderId: string) {
    setSelectedFolderId(folderId);
    setSelectedActiveId(null);
  }

  async function handleMoveActiveDocumentToRecycleBin() {
    if (!selectedActive) return;

    const folderLabel = findFolderLabel(selectedFolderId, documents, customFolders);
    const result = await window.bukolabs?.filesystem?.moveToRecycleBin?.({
      path: selectedActive.savePath,
      storageRoot,
    });

    if (!result?.success) {
      setFileOpenError(result?.error ?? "Could not move file to recycle bin.");
      return;
    }

    moveToRecycleBin(selectedActive.id, folderLabel, result.recycledPath);
    setSelectedActiveId(null);
    setFileOpenError(null);
    const remaining = documents.filter((doc) => doc.id !== selectedActive.id);
    void refreshFromStorage(remaining);
  }

  async function handleMoveFolderToRecycleBin() {
    if (!isFolderSelected) return;

    const folderPath = selectedFolderDiskPath;
    const folderLabel = findFolderLabel(selectedFolderId, documents, customFolders);
    const affected = documents.filter((doc) => {
      const docFolder = getDocumentFolderPath(doc.savePath);
      return (
        docFolder.toLowerCase() === folderPath.toLowerCase() ||
        doc.savePath.toLowerCase().startsWith(`${folderPath.toLowerCase()}\\`)
      );
    });

    if (affected.length === 0) {
      const result = await window.bukolabs?.filesystem?.moveToRecycleBin?.({
        path: folderPath,
        storageRoot,
      });
      if (!result?.success) {
        setFileOpenError(result?.error ?? "Could not move folder to recycle bin.");
        return;
      }
    } else {
      const movedIds = new Set<string>();
      for (const doc of affected) {
        const result = await window.bukolabs?.filesystem?.moveToRecycleBin?.({
          path: doc.savePath,
          storageRoot,
        });
        if (!result?.success) {
          setFileOpenError(result?.error ?? `Could not move ${doc.fileName} to recycle bin.`);
          return;
        }
        moveToRecycleBin(doc.id, folderLabel, result.recycledPath);
        movedIds.add(doc.id);
      }
      const remaining = documents.filter((doc) => !movedIds.has(doc.id));
      setSelectedFolderId("all");
      setFileOpenError(null);
      void refreshFromStorage(remaining);
      return;
    }

    setSelectedFolderId("all");
    setFileOpenError(null);
    void refreshFromStorage();
  }

  function openRenameModal() {
    if (selectedActive) {
      setRenameTarget({
        kind: "file",
        documentId: selectedActive.id,
        name: selectedActive.fileName,
        savePath: selectedActive.savePath,
      });
      return;
    }

    if (isFolderSelected || isStorageRootView) {
      setRenameTarget({
        kind: "folder",
        folderId: selectedFolderId,
        name:
          isStorageRootView
            ? formatFolderLabel(storageRoot)
            : findFolderLabel(selectedFolderId, documents, customFolders),
        diskPath: selectedFolderDiskPath,
      });
    }
  }

  async function confirmRename(nextName: string) {
    const target = renameTarget;
    setRenameTarget(null);
    if (!target) return;

    if (target.kind === "file") {
      const folder = getDocumentFolderPath(target.savePath);
      const nextPath = `${folder}\\${nextName}`;
      const result = await window.bukolabs?.filesystem?.renamePath?.({
        oldPath: target.savePath,
        newPath: nextPath,
      });

      if (!result?.success) {
        setFileOpenError(result?.error ?? "Could not rename file.");
        return;
      }

      updateDocument(target.documentId, { fileName: nextName, savePath: nextPath });
      setFileOpenError(null);
      void refreshFromStorage();
      return;
    }

    const folderPath = target.diskPath;
    const parent = getDocumentFolderPath(folderPath);
    const nextPath = `${parent}\\${nextName}`;
    const renamingStorageRoot = isStorageRootPath(folderPath, storageRoot);
    const result = await window.bukolabs?.filesystem?.renamePath?.({
      oldPath: folderPath,
      newPath: nextPath,
    });

    if (!result?.success) {
      setFileOpenError(result?.error ?? "Could not rename folder.");
      return;
    }

    for (const doc of documents) {
      const lowerSavePath = doc.savePath.toLowerCase();
      const lowerFolderPath = folderPath.toLowerCase();
      if (
        lowerSavePath === lowerFolderPath ||
        lowerSavePath.startsWith(`${lowerFolderPath}\\`)
      ) {
        const updatedPath = `${nextPath}${doc.savePath.slice(folderPath.length)}`;
        updateDocument(doc.id, { savePath: updatedPath });
      }
    }

    if (target.folderId.startsWith("custom/")) {
      setCustomFolders((current) => {
        const nextId = `custom/${slugifyFolderName(nextName)}`;
        const next = current.map((folder) =>
          folder.id === target.folderId ? { ...folder, id: nextId, label: nextName } : folder,
        );
        if (session.userId != null) {
          persistCustomFolders(session.userId, next);
        }
        return next;
      });
      setSelectedFolderId(`custom/${slugifyFolderName(nextName)}`);
    } else if (renamingStorageRoot) {
      if (session.userId != null) {
        const settings = resolveSettings(session.userId);
        persistSettings(session.userId, {
          ...settings,
          ...defaultSaveLocationPatch(nextPath),
        });
      }
      setSelectedFolderId("all");
    } else {
      setSelectedFolderId(nextPath);
    }

    setFileOpenError(null);
    void refreshFromStorage();
  }

  async function handleCopyFolderPath() {
    if (!isFolderSelected && !isStorageRootView) return;
    const result = await window.bukolabs?.filesystem?.copyPathToClipboard?.({
      path: selectedFolderDiskPath,
    });
    setSyncMessage(result?.success ? "Folder path copied." : result?.error ?? "Could not copy path.");
  }

  async function handleOpenSelectedFolder() {
    if (!isFolderSelected && !isStorageRootView) return;

    const folderPath = selectedFolderDiskPath;
    if (selectedFolderId.startsWith("custom/")) {
      const ensured = await window.bukolabs?.filesystem?.ensureDirectory?.({ path: folderPath });
      if (!ensured?.success) {
        setFileOpenError(ensured?.error ?? "Could not open folder location.");
        return;
      }
    }

    const result = await window.bukolabs?.filesystem?.openFolder?.({ path: folderPath });
    if (!result?.success) setFileOpenError(result?.error ?? "Could not open folder.");
    else setFileOpenError(null);
  }

  const handleImportDocument = useCallback(async () => {
    await importFromPicker();
  }, [importFromPicker]);

  function handleFolderDragOver(folderId: string, event: DragEvent<HTMLButtonElement>) {
    if (!event.dataTransfer.types.includes(DOCUMENT_DRAG_MIME)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setDragOverFolderId(folderId);
  }

  function handleFolderDragLeave(folderId: string, event: DragEvent<HTMLButtonElement>) {
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
    setDragOverFolderId((current) => (current === folderId ? null : current));
  }

  async function moveDocumentToFolder(documentId: string, targetFolderId: string) {
    if (targetFolderId === RECYCLE_BIN_FOLDER_ID) return;

    const doc = documents.find((entry) => entry.id === documentId);
    if (!doc) return;

    const targetPath = resolveFolderDiskPath(targetFolderId, storageRoot, customFolders);
    const currentFolder = getDocumentFolderPath(doc.savePath);
    if (targetPath.toLowerCase() === currentFolder.toLowerCase()) return;

    if (targetFolderId.startsWith("custom/")) {
      const ensured = await window.bukolabs?.filesystem?.ensureDirectory?.({ path: targetPath });
      if (!ensured?.success) {
        setFileOpenError(ensured?.error ?? "Could not prepare destination folder.");
        return;
      }
    }

    const nextPath = `${targetPath}\\${doc.fileName}`;
    const collision = documents.some(
      (entry) =>
        entry.id !== documentId &&
        entry.savePath.toLowerCase() === nextPath.toLowerCase(),
    );
    if (collision) {
      setFileOpenError("A file with this name already exists in that folder.");
      return;
    }

    const result = await window.bukolabs?.filesystem?.renamePath?.({
      oldPath: doc.savePath,
      newPath: nextPath,
    });

    if (!result?.success) {
      setFileOpenError(result?.error ?? "Could not move file.");
      return;
    }

    updateDocument(documentId, { savePath: nextPath });
    setSelectedActiveId(documentId);
    setFileOpenError(null);
    setSyncMessage(`Moved ${doc.fileName} to ${findFolderLabel(targetFolderId, documents, customFolders)}.`);
    void refreshFromStorage();
  }

  function handleFolderDrop(folderId: string, event: DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    setDragOverFolderId(null);
    setDragActive(false);

    const documentId = event.dataTransfer.getData(DOCUMENT_DRAG_MIME);
    if (!documentId) return;
    void moveDocumentToFolder(documentId, folderId);
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    const isInternalMove = event.dataTransfer.types.includes(DOCUMENT_DRAG_MIME);
    if (isInternalMove) {
      event.dataTransfer.dropEffect = "move";
      return;
    }
    setDragActive(true);
  }

  function handleDragLeave(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragActive(false);
    setDragOverFolderId(null);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragActive(false);
    setDragOverFolderId(null);

    const documentId = event.dataTransfer.getData(DOCUMENT_DRAG_MIME);
    if (documentId) {
      if (!isRecycleBin) {
        void moveDocumentToFolder(documentId, selectedFolderId);
      }
      return;
    }

    if (isRecycleBin) return;
    void importDroppedFiles(event.dataTransfer.files);
  }


  async function handleCopyPath() {
    if (!selectedActive) return;
    const result = await window.bukolabs?.filesystem?.copyPathToClipboard?.({
      path: selectedActive.savePath,
    });
    setSyncMessage(result?.success ? "File path copied." : result?.error ?? "Could not copy path.");
  }

  async function handleOpenStorageRoot() {
    const result = await window.bukolabs?.filesystem?.openFolder?.({ path: storageRoot });
    if (!result?.success) setFileOpenError(result?.error ?? "Could not open storage folder.");
    else setFileOpenError(null);
  }

  async function handleOpenContainingFolder() {
    if (!selectedActive) return;
    const folder = getDocumentFolderPath(selectedActive.savePath);
    const result = await window.bukolabs?.filesystem?.openFolder?.({ path: folder });
    if (!result?.success) setFileOpenError(result?.error ?? "Could not open folder.");
  }

  function openFileLocationModal() {
    if (isRecycleBin) {
      if (!selectedDeleted) return;
      setFileLocationTarget(buildDeletedFileLocation(selectedDeleted));
      return;
    }
    if (selectedActive) {
      setFileLocationTarget(buildActiveFileLocation(selectedActive));
      return;
    }
    if (selectedFolderId === "all") {
      void handleOpenStorageRoot();
      return;
    }
    if (isFolderSelected) {
      void handleOpenSelectedFolder();
    }
  }

  function confirmOpenFileLocation() {
    const target = fileLocationTarget;
    setFileLocationTarget(null);
    if (!target) return;

    const filePath = isRecycleBin
      ? deletedDocuments.find((doc) => doc.fileName === target.fileName)?.originalSavePath
      : documents.find((doc) => doc.fileName === target.fileName)?.savePath;

    if (filePath && window.bukolabs?.filesystem?.showItemInFolder) {
      void window.bukolabs.filesystem.showItemInFolder({ path: filePath });
    }
  }

  function cancelOpenFileLocation() {
    setFileLocationTarget(null);
  }

  async function openActiveDocument(doc: SavedDocument | null = selectedActive) {
    if (!doc?.savePath) return;

    setFileOpenError(null);
    const result = await openDocumentFile(doc.savePath);
    if (!result.success) {
      setFileOpenError(result.error ?? "Could not open file.");
    }
  }

  function printActiveDocument(doc: SavedDocument | null = selectedActive) {
    if (!doc?.savePath) return;

    navigate("/print/settings", {
      state: {
        source: "documents",
        selectedDocumentId: doc.id,
        localFilePath: doc.savePath,
        localFileName: doc.fileName,
        returnTo: "documents",
      },
    });
  }

  return (
    <div className="documents-page console-page" data-screen="section-04-documents">
      <ConsolePageHeader
        title={getConsolePageTitle("Documents")}
        subtitle={
          isRecycleBin
            ? "Restore deleted scanned documents or remove them permanently from this computer."
            : hasIncomingSearch
              ? `Showing documents matching "${searchQuery.trim()}".`
              : "Browse scanned files saved from your scan sessions and local folders."
        }
        badges={
          <div className="documents-page__header-actions">
            {isRecycleBin ? (
              <>
                <button
                  type="button"
                  className="docs-btn docs-btn--primary"
                  disabled={deletedRows.length === 0}
                  onClick={handleRestoreAll}
                >
                  <RotateCcw className="h-4 w-4" strokeWidth={2} />
                  Restore all
                </button>
                <button
                  type="button"
                  className="docs-btn docs-btn--danger"
                  disabled={deletedRows.length === 0}
                  onClick={handleDeleteAllPermanently}
                >
                  <Trash2 className="h-4 w-4" strokeWidth={2} />
                  Delete all permanently
                </button>
                <button
                  type="button"
                  className="docs-btn docs-btn--outline"
                  disabled={!selectedDeleted}
                  onClick={openRestoreModal}
                >
                  <RotateCcw className="h-4 w-4" strokeWidth={2} />
                  Restore selected
                </button>
              </>
            ) : null}
            {!isRecycleBin ? (
              <button
                type="button"
                className="docs-btn docs-btn--outline"
                disabled={syncing}
                onClick={() => void refreshFromStorage()}
              >
                <RefreshCw className={`h-4 w-4${syncing ? " animate-spin" : ""}`} strokeWidth={2} />
                Refresh
              </button>
            ) : null}
            {!isRecycleBin ? (
              <button type="button" className="docs-btn docs-btn--outline" disabled={importing} onClick={() => void handleImportDocument()}>
                <Plus className="h-4 w-4" strokeWidth={2} />
                {importing ? "Importing..." : "Import file"}
              </button>
            ) : null}
            <button type="button" className="docs-btn docs-btn--outline" onClick={() => setShowCreateFolderModal(true)}>
              <Plus className="h-4 w-4" strokeWidth={2} />
              Create new folder
            </button>
            {canDeleteFolder ? (
              <button type="button" className="docs-btn docs-btn--danger" onClick={handleDeleteFolder}>
                <Trash2 className="h-4 w-4" strokeWidth={2} />
                Delete folder
              </button>
            ) : null}
            {!isRecycleBin ? (
              <button
                type="button"
                className="docs-btn docs-btn--outline"
                disabled={!canRenameSelection}
                onClick={openRenameModal}
              >
                <Pencil className="h-4 w-4" strokeWidth={2} />
                Rename
              </button>
            ) : null}
            <button
              type="button"
              className="docs-btn docs-btn--outline"
              disabled={!canOpenLocation}
              onClick={openFileLocationModal}
            >
              <FolderOpen className="h-4 w-4" strokeWidth={2} />
              Open Location
            </button>
          </div>
        }
      />

      <div
        className={`documents-page__content console-page__body${dragActive ? " documents-page__content--drag-active" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
      <div className="documents-page__storage-banner">
        <span className="documents-page__storage-label">Storage folder</span>
        <code className="documents-page__storage-path">{storageRoot}</code>
      </div>
      <div className="documents-page__toolbar console-page__toolbar">
        <input
          type="search"
          className="documents-page__search"
          placeholder={isRecycleBin ? "Search deleted documents..." : "Search documents..."}
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          aria-label="Search documents"
        />
        {isRecycleBin ? (
          <select
            className="documents-page__select"
            value={deletedDateFilter}
            onChange={(event) => setDeletedDateFilter(event.target.value)}
            aria-label="Deleted date filter"
          >
            <option value="all">Deleted Date</option>
            <option value="1">Today</option>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
          </select>
        ) : null}
        <select
          className="documents-page__select"
          value={fileTypeFilter}
          onChange={(event) =>
            setFileTypeFilter(event.target.value as "all" | "pdf" | "png" | "jpg")
          }
          aria-label="File type filter"
        >
          <option value="all">File Type</option>
          <option value="pdf">PDF</option>
          <option value="png">PNG</option>
          <option value="jpg">JPG</option>
        </select>
      </div>

      {fileOpenError ? <p className="documents-page__open-error">{fileOpenError}</p> : null}
      {importNotice ? <p className="documents-page__notice">{importNotice}</p> : null}
      {syncMessage ? <p className="documents-page__notice">{syncMessage}</p> : null}
      {!isRecycleBin ? (
        <p className="documents-page__drop-hint">
          Drag files here to import, or drag documents between folders in the sidebar.
        </p>
      ) : null}

      <div className="documents-page__layout">
        <aside className="documents-page__folders">
          <h2 className="documents-page__pane-title">Folders</h2>
          <ul className="docs-folder-tree">
            {folderTree.map((node) => (
              <FolderTreeItem
                key={node.id}
                node={node}
                depth={0}
                selectedFolderId={selectedFolderId}
                expandedIds={expandedIds}
                dragOverFolderId={dragOverFolderId}
                onToggle={toggleFolder}
                onSelect={selectFolder}
                onFolderDragOver={handleFolderDragOver}
                onFolderDragLeave={handleFolderDragLeave}
                onFolderDrop={handleFolderDrop}
              />
            ))}
          </ul>
          <button
            type="button"
            className={`docs-recycle-bin${isRecycleBin ? " docs-recycle-bin--active" : ""}`}
            onClick={() => setSelectedFolderId(RECYCLE_BIN_FOLDER_ID)}
          >
            <Trash2 className="h-4 w-4" strokeWidth={1.8} />
            Recycle Bin
          </button>
        </aside>

        <section className="documents-page__list">
          <nav className="documents-page__breadcrumb" aria-label="Breadcrumb">
            {breadcrumb.map((part, index) => (
              <span key={`${part}-${index}`}>
                {index > 0 ? <span className="documents-page__breadcrumb-sep">›</span> : null}
                {part}
              </span>
            ))}
          </nav>

          <div className="documents-page__table-wrap">
            <table className="documents-page__table">
              <thead>
                <tr>
                  {isRecycleBin ? (
                    <>
                      <th>Name</th>
                      <th>Original Folder</th>
                      <th>Date Deleted</th>
                      <th>Type</th>
                      <th>Size</th>
                    </>
                  ) : (
                    <>
                      <th>Name</th>
                      <th>Pages</th>
                      <th>Department</th>
                      <th>Date Modified</th>
                      <th>Type</th>
                      <th>Size</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {isRecycleBin ? (
                  deletedRows.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="documents-page__empty">
                        No deleted documents match your search.
                      </td>
                    </tr>
                  ) : (
                    deletedRows.map((doc) => (
                      <DeletedRow
                        key={doc.id}
                        doc={doc}
                        active={selectedDeleted?.id === doc.id}
                        onSelect={() => setSelectedDeletedId(doc.id)}
                      />
                    ))
                  )
                ) : activeRows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="documents-page__empty">
                      No documents in this folder yet. Scan a document to see it listed here.
                    </td>
                  </tr>
                ) : (
                  activeRows.map((doc) => (
                    <ActiveRow
                      key={doc.id}
                      doc={doc}
                      active={selectedActive?.id === doc.id}
                      dragging={draggingDocumentId === doc.id}
                      searchQuery={searchQuery}
                      onSelect={() => setSelectedActiveId(doc.id)}
                      onOpen={() => void openActiveDocument(doc)}
                      onDragStart={() => setDraggingDocumentId(doc.id)}
                      onDragEnd={() => setDraggingDocumentId(null)}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="documents-page__details">
          <h2 className="documents-page__pane-title">File Details</h2>
          <div className="documents-page__details-scroll">
          {isRecycleBin ? (
            <DeletedDetails
              doc={selectedDeleted}
              onRestore={openRestoreModal}
              onOpenLocation={openFileLocationModal}
              onDelete={handlePermanentDelete}
            />
          ) : selectedActive ? (
            <ActiveDetails
              doc={selectedActive}
              onOpen={() => void openActiveDocument()}
              onPrint={() => printActiveDocument()}
              onOpenFolder={() => void handleOpenContainingFolder()}
              onRename={() => openRenameModal()}
              onCopyPath={() => void handleCopyPath()}
              onMoveToRecycleBin={() => void handleMoveActiveDocumentToRecycleBin()}
            />
          ) : isFolderSelected || isStorageRootView ? (
            <FolderDetails
              folderPath={selectedFolderDiskPath}
              folderLabel={
                isStorageRootView
                  ? formatFolderLabel(storageRoot)
                  : findFolderLabel(selectedFolderId, documents, customFolders)
              }
              onOpenFolder={() => void handleOpenSelectedFolder()}
              onRename={() => openRenameModal()}
              onCopyPath={() => void handleCopyFolderPath()}
              onMoveToRecycleBin={
                isSelectedStorageRoot ? undefined : () => void handleMoveFolderToRecycleBin()
              }
            />
          ) : (
            <p className="documents-page__details-empty">Select a document or folder to view details.</p>
          )}
          </div>
        </aside>
      </div>

      <footer className="documents-page__footer">
        <span>
          {isRecycleBin
            ? "Recycle Bin keeps deleted files temporarily."
            : "Documents are stored on this device."}
        </span>
        <span>
          Selected:{" "}
          <strong>
            {isRecycleBin
              ? selectedDeleted?.fileName ?? "None"
              : selectedActive?.fileName ??
                (isFolderSelected || isStorageRootView
                  ? isStorageRootView
                    ? formatFolderLabel(storageRoot)
                    : findFolderLabel(selectedFolderId, documents, customFolders)
                  : "None")}
          </strong>
        </span>
        <span>Storage: Local device</span>
      </footer>
      </div>

      {restoreTarget ? (
        <RestoreDocumentModal
          deletedDocument={restoreTarget}
          onCancel={cancelRestore}
          onConfirm={confirmRestore}
        />
      ) : null}

      {showCreateFolderModal ? (
        <CreateNewFolderModal
          onCancel={() => setShowCreateFolderModal(false)}
          onCreate={handleCreateFolder}
        />
      ) : null}

      {fileLocationTarget ? (
        <OpenFileLocationModal
          target={fileLocationTarget}
          onCancel={cancelOpenFileLocation}
          onOpen={confirmOpenFileLocation}
        />
      ) : null}

      {renameTarget ? (
        <RenameItemModal
          title={renameTarget.kind === "file" ? "Rename File" : "Rename Folder"}
          initialName={renameTarget.name}
          onCancel={() => setRenameTarget(null)}
          onConfirm={(name) => void confirmRename(name)}
        />
      ) : null}

      {importing ? <ImportProgressModal fileCount={importFileCount} /> : null}
    </div>
  );
}

function ActiveRow({
  doc,
  active,
  dragging,
  searchQuery,
  onSelect,
  onOpen,
  onDragStart,
  onDragEnd,
}: {
  doc: SavedDocument;
  active: boolean;
  dragging: boolean;
  searchQuery: string;
  onSelect: () => void;
  onOpen: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
}) {
  return (
    <tr
      className={`${active ? "documents-page__row--active" : ""}${dragging ? " documents-page__row--dragging" : ""}`.trim()}
      draggable
      onDragStart={(event) => {
        event.dataTransfer.setData(DOCUMENT_DRAG_MIME, doc.id);
        event.dataTransfer.effectAllowed = "move";
        onDragStart();
      }}
      onDragEnd={onDragEnd}
      onDoubleClick={onOpen}
    >
      <td>
        <button type="button" className="documents-page__name-btn" onClick={onSelect}>
          <FileIcon type={doc.fileType} />
          <span>
            <HighlightedText text={doc.fileName} query={searchQuery} />
          </span>
        </button>
      </td>
      <td>{doc.pages}</td>
      <td>{doc.department}</td>
      <td className="documents-page__muted">{formatDocumentDate(doc.modifiedAt)}</td>
      <td>{formatFileTypeLabel(doc.fileType)}</td>
      <td>{formatFileSize(doc.fileSizeBytes)}</td>
    </tr>
  );
}

function DeletedRow({
  doc,
  active,
  onSelect,
}: {
  doc: DeletedDocument;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <tr className={active ? "documents-page__row--active" : undefined}>
      <td>
        <button type="button" className="documents-page__name-btn" onClick={onSelect}>
          <FileIcon type={doc.fileType} />
          <span>{doc.fileName}</span>
        </button>
      </td>
      <td>{doc.originalFolder}</td>
      <td className="documents-page__muted">{formatDeletedDate(doc.deletedAt)}</td>
      <td>{formatFileTypeLabel(doc.fileType)}</td>
      <td>{formatFileSize(doc.fileSizeBytes)}</td>
    </tr>
  );
}

function ActiveDetails({
  doc,
  onOpen,
  onPrint,
  onOpenFolder,
  onRename,
  onCopyPath,
  onMoveToRecycleBin,
}: {
  doc: SavedDocument;
  onOpen: () => void;
  onPrint: () => void;
  onOpenFolder: () => void;
  onRename: () => void;
  onCopyPath: () => void;
  onMoveToRecycleBin: () => void;
}) {
  return (
    <>
      <button type="button" className="documents-page__preview documents-page__preview-btn" onClick={onOpen}>
        <FileIcon type={doc.fileType} />
      </button>
      <dl className="documents-page__meta">
        <div>
          <dt>Name</dt>
          <dd>{doc.fileName}</dd>
        </div>
        <div>
          <dt>Department</dt>
          <dd>{doc.department}</dd>
        </div>
        <div>
          <dt>Date modified</dt>
          <dd>{formatDocumentDate(doc.modifiedAt)}</dd>
        </div>
        <div>
          <dt>Type</dt>
          <dd>{formatFileTypeLabel(doc.fileType)}</dd>
        </div>
        <div>
          <dt>Size</dt>
          <dd>{formatFileSize(doc.fileSizeBytes)}</dd>
        </div>
        <div>
          <dt>Location</dt>
          <dd className="documents-page__meta-path">{doc.savePath}</dd>
        </div>
      </dl>
      <div className="documents-page__detail-actions">
        <button type="button" className="docs-btn docs-btn--primary docs-btn--block" onClick={onOpen}>
          <ExternalLink className="h-4 w-4" strokeWidth={2} />
          Open File
        </button>
        <button type="button" className="docs-btn docs-btn--outline docs-btn--block" onClick={onPrint}>
          <Printer className="h-4 w-4" strokeWidth={2} />
          Print
        </button>
        <button type="button" className="docs-btn docs-btn--outline docs-btn--block" onClick={onOpenFolder}>
          <FolderOpen className="h-4 w-4" strokeWidth={2} />
          Open Folder
        </button>
        <button type="button" className="docs-btn docs-btn--outline docs-btn--block" onClick={onRename}>
          Rename
        </button>
        <button type="button" className="docs-btn docs-btn--outline docs-btn--block" onClick={onCopyPath}>
          Copy Path
        </button>
        <button type="button" className="docs-btn docs-btn--danger docs-btn--block" onClick={onMoveToRecycleBin}>
          <Trash2 className="h-4 w-4" strokeWidth={2} />
          Move to Recycle Bin
        </button>
      </div>
    </>
  );
}

function FolderDetails({
  folderPath,
  folderLabel,
  onOpenFolder,
  onRename,
  onCopyPath,
  onMoveToRecycleBin,
}: {
  folderPath: string;
  folderLabel: string;
  onOpenFolder: () => void;
  onRename?: () => void;
  onCopyPath: () => void;
  onMoveToRecycleBin?: () => void;
}) {
  return (
    <>
      <div className="documents-page__preview">
        <Folder className="docs-file-icon" strokeWidth={1.8} />
      </div>
      <dl className="documents-page__meta">
        <div>
          <dt>Name</dt>
          <dd>{folderLabel}</dd>
        </div>
        <div>
          <dt>Location</dt>
          <dd className="documents-page__meta-path">{folderPath}</dd>
        </div>
      </dl>
      <div className="documents-page__detail-actions">
        <button type="button" className="docs-btn docs-btn--primary docs-btn--block" onClick={onOpenFolder}>
          <FolderOpen className="h-4 w-4" strokeWidth={2} />
          Open Folder
        </button>
        {onRename ? (
          <button type="button" className="docs-btn docs-btn--outline docs-btn--block" onClick={onRename}>
            Rename
          </button>
        ) : null}
        <button type="button" className="docs-btn docs-btn--outline docs-btn--block" onClick={onCopyPath}>
          Copy Path
        </button>
        {onMoveToRecycleBin ? (
          <button type="button" className="docs-btn docs-btn--danger docs-btn--block" onClick={onMoveToRecycleBin}>
            <Trash2 className="h-4 w-4" strokeWidth={2} />
            Move to Recycle Bin
          </button>
        ) : null}
      </div>
    </>
  );
}

function DeletedDetails({
  doc,
  onRestore,
  onOpenLocation,
  onDelete,
}: {
  doc: DeletedDocument | null;
  onRestore: () => void;
  onOpenLocation: () => void;
  onDelete: () => void;
}) {
  if (!doc) {
    return <p className="documents-page__details-empty">Select a deleted document to view details.</p>;
  }

  return (
    <>
      <div className="documents-page__preview">
        <FileIcon type={doc.fileType} />
      </div>
      <dl className="documents-page__meta">
        <div>
          <dt>Name</dt>
          <dd>{doc.fileName}</dd>
        </div>
        <div>
          <dt>Original folder</dt>
          <dd>{doc.originalFolder}</dd>
        </div>
        <div>
          <dt>Date deleted</dt>
          <dd>{formatDeletedDate(doc.deletedAt)}</dd>
        </div>
        <div>
          <dt>Type</dt>
          <dd>{formatFileTypeLabel(doc.fileType)}</dd>
        </div>
        <div>
          <dt>Size</dt>
          <dd>{formatFileSize(doc.fileSizeBytes)}</dd>
        </div>
      </dl>
      <div className="documents-page__detail-actions">
        <button type="button" className="docs-btn docs-btn--primary docs-btn--block" onClick={onRestore}>
          Restore to Original Folder
        </button>
        <button type="button" className="docs-btn docs-btn--outline docs-btn--block" onClick={onOpenLocation}>
          <FolderOpen className="h-4 w-4" strokeWidth={2} />
          Open Original Location
        </button>
        <button type="button" className="docs-btn docs-btn--danger docs-btn--block" onClick={onDelete}>
          Delete Permanently
        </button>
      </div>
    </>
  );
}
