import type { SavedDocumentFileType } from "../../lib/documents";
import { getDocumentFolderPath } from "../search/searchFolders";
import type { DeletedDocument } from "../../lib/deletedDocuments";
import type { SavedDocument } from "../../lib/documents";

export type FileLocationTarget = {
  fileName: string;
  fileType: SavedDocumentFileType;
  folderPath: string;
};

export function buildActiveFileLocation(doc: SavedDocument): FileLocationTarget {
  return {
    fileName: doc.fileName,
    fileType: doc.fileType,
    folderPath: getDocumentFolderPath(doc.savePath),
  };
}

export function buildDeletedFileLocation(doc: DeletedDocument): FileLocationTarget {
  return {
    fileName: doc.fileName,
    fileType: doc.fileType,
    folderPath: getDocumentFolderPath(doc.originalSavePath),
  };
}
