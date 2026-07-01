import { shell, clipboard } from "electron";
import { dialog } from "electron";
import fs from "fs/promises";
import os from "os";
import path from "path";
import { spawn } from "child_process";

export type QuickLocation = {
  id: string;
  label: string;
  path: string;
};

export type DirectoryEntry = {
  name: string;
  path: string;
};

function wordExecutableCandidates(): string[] {
  const programFiles = process.env.ProgramFiles ?? "C:\\Program Files";
  const programFilesX86 = process.env["ProgramFiles(x86)"] ?? "C:\\Program Files (x86)";
  const roots = [
    path.join(programFiles, "Microsoft Office", "root", "Office16"),
    path.join(programFiles, "Microsoft Office", "Office16"),
    path.join(programFilesX86, "Microsoft Office", "root", "Office16"),
    path.join(programFilesX86, "Microsoft Office", "Office16"),
  ];

  return roots.map((root) => path.join(root, "WINWORD.EXE"));
}

const DOCUMENT_EXTENSIONS = new Set([
  ".pdf",
  ".png",
  ".jpg",
  ".jpeg",
  ".doc",
  ".docx",
  ".rtf",
]);

export const RECYCLE_BIN_FOLDER_NAME = ".RecycleBin";

function isDocumentFile(name: string): boolean {
  return DOCUMENT_EXTENSIONS.has(path.extname(name).toLowerCase());
}

function shouldSkipDirectory(name: string): boolean {
  return name.startsWith(".");
}

async function walkDocuments(
  dirPath: string,
  results: Array<{ name: string; path: string; size: number; modifiedAt: string }>,
  folders: Set<string>,
) {
  let entries;
  try {
    entries = await fs.readdir(dirPath, { withFileTypes: true });
  } catch {
    return;
  }

  folders.add(dirPath);

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      if (shouldSkipDirectory(entry.name)) continue;
      await walkDocuments(fullPath, results, folders);
      continue;
    }
    if (!entry.isFile() || !isDocumentFile(entry.name)) continue;
    try {
      const stat = await fs.stat(fullPath);
      results.push({
        name: entry.name,
        path: fullPath,
        size: stat.size,
        modifiedAt: stat.mtime.toISOString(),
      });
    } catch {
      /* skip unreadable file */
    }
  }
}

async function resolveWordExecutable(): Promise<string | null> {
  for (const candidate of wordExecutableCandidates()) {
    try {
      await fs.access(candidate);
      return candidate;
    } catch {
      /* try next */
    }
  }
  return null;
}

export const fsService = {
  async getQuickLocations(): Promise<{ locations: QuickLocation[] }> {
    const home = os.homedir();
    const locations: QuickLocation[] = [
      { id: "home", label: "Home", path: home },
      { id: "desktop", label: "Desktop", path: path.join(home, "Desktop") },
      { id: "documents", label: "Documents", path: path.join(home, "Documents") },
      { id: "downloads", label: "Downloads", path: path.join(home, "Downloads") },
    ];

    if (process.platform === "win32") {
      for (const letter of "ABCDEFGHIJKLMNOPQRSTUVWXYZ") {
        const drive = `${letter}:\\`;
        try {
          await fs.access(drive);
          locations.push({
            id: `disk-${letter.toLowerCase()}`,
            label: `Local Disk (${letter}:)`,
            path: drive,
          });
        } catch {
          // Drive not present
        }
      }
    }

    return { locations };
  },

  async listContents(dirPath: string): Promise<{
    path: string;
    folders: DirectoryEntry[];
    files: Array<{ name: string; path: string; size: number }>;
    error?: string;
  }> {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      const folders = entries
        .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
        .map((entry) => ({
          name: entry.name,
          path: path.join(dirPath, entry.name),
        }))
        .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));

      const files = (
        await Promise.all(
          entries
            .filter(
              (entry) =>
                entry.isFile() && /\.(pdf|png|jpe?g)$/i.test(entry.name) && !entry.name.startsWith("."),
            )
            .map(async (entry) => {
              const filePath = path.join(dirPath, entry.name);
              const stat = await fs.stat(filePath);
              return { name: entry.name, path: filePath, size: stat.size };
            }),
        )
      ).sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));

      return { path: dirPath, folders, files };
    } catch (error) {
      return {
        path: dirPath,
        folders: [],
        files: [],
        error: error instanceof Error ? error.message : "Unable to read folder",
      };
    }
  },

  async listDirectories(dirPath: string): Promise<{
    path: string;
    folders: DirectoryEntry[];
    error?: string;
  }> {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      const folders = entries
        .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
        .map((entry) => ({
          name: entry.name,
          path: path.join(dirPath, entry.name),
        }))
        .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));

      return { path: dirPath, folders };
    } catch (error) {
      return {
        path: dirPath,
        folders: [],
        error: error instanceof Error ? error.message : "Unable to read folder",
      };
    }
  },

  async pickFolder(defaultPath?: string): Promise<{ canceled: boolean; path?: string }> {
    const result = await dialog.showOpenDialog({
      properties: ["openDirectory", "createDirectory"],
      defaultPath: defaultPath,
    });

    if (result.canceled || !result.filePaths[0]) {
      return { canceled: true };
    }

    return { canceled: false, path: result.filePaths[0] };
  },

  async pickDocument(defaultPath?: string): Promise<{
    canceled: boolean;
    path?: string;
    name?: string;
    size?: number;
  }> {
    const result = await dialog.showOpenDialog({
      properties: ["openFile"],
      defaultPath,
      filters: [
        { name: "Documents", extensions: ["pdf", "png", "jpg", "jpeg"] },
      ],
    });

    if (result.canceled || !result.filePaths[0]) {
      return { canceled: true };
    }

    const filePath = result.filePaths[0];
    const stat = await fs.stat(filePath);
    return {
      canceled: false,
      path: filePath,
      name: path.basename(filePath),
      size: stat.size,
    };
  },

  async pickImage(defaultPath?: string): Promise<{
    canceled: boolean;
    dataUrl?: string;
    name?: string;
    size?: number;
  }> {
    const result = await dialog.showOpenDialog({
      properties: ["openFile"],
      defaultPath,
      filters: [
        { name: "Images", extensions: ["jpg", "jpeg", "png", "webp", "gif", "bmp"] },
      ],
    });

    if (result.canceled || !result.filePaths[0]) {
      return { canceled: true };
    }

    const filePath = result.filePaths[0];
    const stat = await fs.stat(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const mime =
      ext === ".png"
        ? "image/png"
        : ext === ".webp"
          ? "image/webp"
          : ext === ".gif"
            ? "image/gif"
            : ext === ".bmp"
              ? "image/bmp"
              : "image/jpeg";
    const buffer = await fs.readFile(filePath);

    return {
      canceled: false,
      dataUrl: `data:${mime};base64,${buffer.toString("base64")}`,
      name: path.basename(filePath),
      size: stat.size,
    };
  },

  async showItemInFolder(targetPath: string): Promise<{ success: boolean; error?: string }> {
    try {
      shell.showItemInFolder(targetPath);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unable to open file location",
      };
    }
  },

  async openPath(targetPath: string): Promise<{ success: boolean; error?: string }> {
    try {
      await fs.access(targetPath);
      const result = await shell.openPath(targetPath);
      if (result) {
        return { success: false, error: result };
      }
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unable to open file",
      };
    }
  },

  async openDocumentWithApp(targetPath: string): Promise<{ success: boolean; error?: string }> {
    return this.openPath(targetPath);
  },

  async openInWord(targetPath: string): Promise<{ success: boolean; error?: string }> {
    try {
      await fs.access(targetPath);
      const wordPath = await resolveWordExecutable();
      if (!wordPath) {
        return {
          success: false,
          error: "Microsoft Word was not found on this computer.",
        };
      }

      await new Promise<void>((resolve, reject) => {
        const child = spawn(wordPath, [targetPath], {
          detached: true,
          stdio: "ignore",
          windowsHide: true,
        });
        child.once("error", reject);
        child.unref();
        resolve();
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unable to open file in Word",
      };
    }
  },

  async validateDirectory(dirPath: string): Promise<{
    exists: boolean;
    writable: boolean;
    valid: boolean;
    error?: string;
  }> {
    try {
      const trimmed = dirPath.trim();
      if (!trimmed) {
        return { exists: false, writable: false, valid: false, error: "Folder path is required." };
      }
      const stat = await fs.stat(trimmed);
      if (!stat.isDirectory()) {
        return { exists: true, writable: false, valid: false, error: "Path is not a folder." };
      }
      const probe = path.join(trimmed, `.bukolabs-write-test-${Date.now()}`);
      await fs.writeFile(probe, "ok", { flag: "w" });
      await fs.unlink(probe);
      return { exists: true, writable: true, valid: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to access folder.";
      const exists = !message.toLowerCase().includes("enoent");
      return { exists, writable: false, valid: false, error: message };
    }
  },

  getDefaultStorageRoot(): string {
    return path.join(os.homedir(), "Documents", "Desktop Scanner Documents");
  },

  async ensureDefaultStorageRoot(): Promise<{ success: boolean; path: string; error?: string }> {
    const target = this.getDefaultStorageRoot();
    try {
      await fs.mkdir(target, { recursive: true });
      return { success: true, path: target };
    } catch (error) {
      return {
        success: false,
        path: target,
        error: error instanceof Error ? error.message : "Unable to create default storage folder.",
      };
    }
  },

  async ensureDirectory(dirPath: string): Promise<{ success: boolean; path: string; error?: string }> {
    try {
      const trimmed = dirPath.trim();
      await fs.mkdir(trimmed, { recursive: true });
      return { success: true, path: trimmed };
    } catch (error) {
      return {
        success: false,
        path: dirPath,
        error: error instanceof Error ? error.message : "Unable to create folder.",
      };
    }
  },

  async importDocumentToFolder(
    sourcePath: string,
    targetDir: string,
  ): Promise<{
    success: boolean;
    path?: string;
    fileName?: string;
    size?: number;
    error?: string;
  }> {
    try {
      const trimmedSource = sourcePath.trim();
      const trimmedTarget = targetDir.trim();
      if (!trimmedSource || !trimmedTarget) {
        return { success: false, error: "Import source and destination are required." };
      }

      await fs.mkdir(trimmedTarget, { recursive: true });
      const unique = await this.resolveUniqueFilePath(trimmedTarget, path.basename(trimmedSource));
      await fs.copyFile(trimmedSource, unique.path);
      const stat = await fs.stat(unique.path);
      return {
        success: true,
        path: unique.path,
        fileName: unique.fileName,
        size: stat.size,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Could not import file into storage.",
      };
    }
  },

  async resolveUniqueFilePath(dirPath: string, fileName: string): Promise<{ path: string; fileName: string }> {
    await fs.mkdir(dirPath, { recursive: true });
    const ext = path.extname(fileName);
    const base = path.basename(fileName, ext);
    let candidate = fileName;
    let counter = 1;

    while (counter < 1000) {
      const target = path.join(dirPath, candidate);
      try {
        await fs.access(target);
        candidate = `${base} (${counter})${ext}`;
        counter += 1;
      } catch {
        return { path: target, fileName: candidate };
      }
    }

    candidate = `${base}-${Date.now()}${ext}`;
    return { path: path.join(dirPath, candidate), fileName: candidate };
  },

  async listDocumentsInFolder(dirPath: string): Promise<{
    root: string;
    folders: string[];
    files: Array<{ name: string; path: string; size: number; modifiedAt: string }>;
    error?: string;
  }> {
    try {
      const trimmed = dirPath.trim();
      await fs.mkdir(trimmed, { recursive: true });
      const files: Array<{ name: string; path: string; size: number; modifiedAt: string }> = [];
      const folders = new Set<string>();
      await walkDocuments(trimmed, files, folders);
      files.sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt));
      return {
        root: trimmed,
        folders: [...folders].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" })),
        files,
      };
    } catch (error) {
      return {
        root: dirPath,
        folders: [],
        files: [],
        error: error instanceof Error ? error.message : "Unable to scan folder.",
      };
    }
  },

  async renamePath(oldPath: string, newPath: string): Promise<{ success: boolean; path?: string; error?: string }> {
    try {
      await fs.mkdir(path.dirname(newPath), { recursive: true });
      await fs.rename(oldPath, newPath);
      return { success: true, path: newPath };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unable to rename file.",
      };
    }
  },

  async deletePath(targetPath: string): Promise<{ success: boolean; error?: string }> {
    try {
      await fs.unlink(targetPath);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unable to delete file.",
      };
    }
  },

  async copyPathToClipboard(targetPath: string): Promise<{ success: boolean; error?: string }> {
    try {
      clipboard.writeText(targetPath);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unable to copy path.",
      };
    }
  },

  async openFolder(dirPath: string): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await shell.openPath(dirPath);
      if (result) return { success: false, error: result };
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unable to open folder.",
      };
    }
  },

  async moveToRecycleBin(
    targetPath: string,
    storageRoot: string,
  ): Promise<{ success: boolean; recycledPath?: string; error?: string }> {
    try {
      const normalizedRoot = path.normalize(storageRoot.trim());
      const normalizedTarget = path.normalize(targetPath.trim());
      const recycleRoot = path.join(normalizedRoot, RECYCLE_BIN_FOLDER_NAME);
      await fs.mkdir(recycleRoot, { recursive: true });

      let relative = path.relative(normalizedRoot, normalizedTarget);
      if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) {
        relative = path.basename(normalizedTarget);
      }

      let destination = path.join(recycleRoot, relative);
      let counter = 1;
      while (counter < 1000) {
        try {
          await fs.access(destination);
          const parsed = path.parse(relative);
          destination = path.join(
            recycleRoot,
            parsed.dir,
            `${parsed.name} (${counter})${parsed.ext}`,
          );
          counter += 1;
        } catch {
          break;
        }
      }

      await fs.mkdir(path.dirname(destination), { recursive: true });
      await fs.rename(normalizedTarget, destination);
      return { success: true, recycledPath: destination };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unable to move item to recycle bin.",
      };
    }
  },

  async restoreFromRecycleBin(
    recycledPath: string,
    originalPath: string,
  ): Promise<{ success: boolean; restoredPath?: string; error?: string }> {
    try {
      const fromPath = path.normalize(recycledPath.trim());
      const toPath = path.normalize(originalPath.trim());
      await fs.mkdir(path.dirname(toPath), { recursive: true });
      await fs.rename(fromPath, toPath);
      return { success: true, restoredPath: toPath };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unable to restore file.",
      };
    }
  },
};
