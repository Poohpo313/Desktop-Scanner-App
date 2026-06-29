import { useCallback, useState } from "react";

export type FileRecord = {
  document_id: number;
  filename: string;
  file_type: string;
  file_size: number;
  upload_date: string;
  cloud_status: string;
  is_deleted?: boolean;
};

export type FolderRecord = {
  folder_id: number;
  folder_name: string;
  parent_folder_id: number | null;
};

export function useFiles(userId: number | null) {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [folders, setFolders] = useState<FolderRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(
    async (folderId?: number) => {
      if (!userId || !window.bukolabs) return;
      setLoading(true);
      try {
        const res = (await window.bukolabs.files.list({ folderId, userId })) as {
          files?: FileRecord[];
          folders?: FolderRecord[];
        };
        setFiles(res.files ?? []);
        setFolders(res.folders ?? []);
      } finally {
        setLoading(false);
      }
    },
    [userId]
  );

  const saveFile = useCallback(
    async (payload: {
      imageBuffer: ArrayBuffer;
      filename: string;
      folderId?: number;
      fileType?: string;
    }) => {
      if (!userId) throw new Error("Not authenticated");
      const result = await window.bukolabs.files.save({ ...payload, userId });
      await refresh(payload.folderId);
      return result;
    },
    [userId, refresh]
  );

  const deleteFile = useCallback(
    async (documentId: number) => {
      await window.bukolabs.files.delete({ documentId });
      await refresh();
    },
    [refresh]
  );

  const restoreFile = useCallback(
    async (documentId: number) => {
      await window.bukolabs.files.restore({ documentId });
      await refresh();
    },
    [refresh]
  );

  const search = useCallback(async (query: string, filters?: Record<string, unknown>) => {
    const res = (await window.bukolabs.files.search({ query, filters })) as {
      results?: FileRecord[];
    };
    return res.results ?? [];
  }, []);

  return { files, folders, loading, refresh, saveFile, deleteFile, restoreFile, search };
}
