import { useCallback } from "react";
import { listDemoFolders } from "../../../lib/localFolderTree";

export type QuickLocation = {
  id: string;
  label: string;
  path: string;
};

export type DirectoryEntry = {
  name: string;
  path: string;
};

const DEMO_LOCATIONS: QuickLocation[] = [
  { id: "home", label: "Home", path: "C:\\Users\\maryr\\Documents" },
  { id: "desktop", label: "Desktop", path: "C:\\Users\\maryr\\Desktop" },
  { id: "documents", label: "Documents", path: "C:\\Users\\maryr\\Documents" },
  { id: "downloads", label: "Downloads", path: "C:\\Users\\maryr\\Downloads" },
  { id: "disk-c", label: "Local Disk (C:)", path: "C:\\" },
];

const LEGACY_DEMO_FOLDERS: Record<string, DirectoryEntry[]> = {
  "C:\\": [
    { name: "Users", path: "C:\\Users" },
    { name: "Program Files", path: "C:\\Program Files" },
  ],
  "C:\\Users\\maryr\\Documents": [
    { name: "Scanned Documents", path: "C:\\Scanned Documents" },
  ],
  "C:\\Users\\Public\\Documents": [
    { name: "Scanned Documents", path: "C:\\Scanned Documents" },
  ],
};

export function useLocalFilesystem() {
  const getQuickLocations = useCallback(async () => {
    if (window.bukolabs?.filesystem) {
      return window.bukolabs.filesystem.getQuickLocations();
    }
    return { locations: DEMO_LOCATIONS };
  }, []);

  const listDirectories = useCallback(async (dirPath: string) => {
    if (window.bukolabs?.filesystem) {
      return window.bukolabs.filesystem.listDirectories({ path: dirPath });
    }
    return {
      path: dirPath,
      folders: listDemoFolders(dirPath).length
        ? listDemoFolders(dirPath)
        : (LEGACY_DEMO_FOLDERS[dirPath] ?? []),
    };
  }, []);

  const pickFolder = useCallback(async (defaultPath?: string) => {
    if (window.bukolabs?.filesystem) {
      return window.bukolabs.filesystem.pickFolder({ defaultPath });
    }
    return {
      canceled: false,
      path: defaultPath ?? DEMO_LOCATIONS[0].path,
    };
  }, []);

  const listContents = useCallback(async (dirPath: string) => {
    if (window.bukolabs?.filesystem?.listContents) {
      return window.bukolabs.filesystem.listContents({ path: dirPath });
    }
    return listDirectories(dirPath).then((result) => ({
      ...result,
      files: [] as Array<{ name: string; path: string; size: number }>,
    }));
  }, [listDirectories]);

  return { getQuickLocations, listDirectories, listContents, pickFolder };
}
