"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fsService = exports.RECYCLE_BIN_FOLDER_NAME = void 0;
const electron_1 = require("electron");
const electron_2 = require("electron");
const promises_1 = __importDefault(require("fs/promises"));
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
function wordExecutableCandidates() {
    const programFiles = process.env.ProgramFiles ?? "C:\\Program Files";
    const programFilesX86 = process.env["ProgramFiles(x86)"] ?? "C:\\Program Files (x86)";
    const roots = [
        path_1.default.join(programFiles, "Microsoft Office", "root", "Office16"),
        path_1.default.join(programFiles, "Microsoft Office", "Office16"),
        path_1.default.join(programFilesX86, "Microsoft Office", "root", "Office16"),
        path_1.default.join(programFilesX86, "Microsoft Office", "Office16"),
    ];
    return roots.map((root) => path_1.default.join(root, "WINWORD.EXE"));
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
exports.RECYCLE_BIN_FOLDER_NAME = ".RecycleBin";
function isDocumentFile(name) {
    return DOCUMENT_EXTENSIONS.has(path_1.default.extname(name).toLowerCase());
}
function shouldSkipDirectory(name) {
    return name.startsWith(".");
}
async function walkDocuments(dirPath, results, folders) {
    let entries;
    try {
        entries = await promises_1.default.readdir(dirPath, { withFileTypes: true });
    }
    catch {
        return;
    }
    folders.add(dirPath);
    for (const entry of entries) {
        const fullPath = path_1.default.join(dirPath, entry.name);
        if (entry.isDirectory()) {
            if (shouldSkipDirectory(entry.name))
                continue;
            await walkDocuments(fullPath, results, folders);
            continue;
        }
        if (!entry.isFile() || !isDocumentFile(entry.name))
            continue;
        try {
            const stat = await promises_1.default.stat(fullPath);
            results.push({
                name: entry.name,
                path: fullPath,
                size: stat.size,
                modifiedAt: stat.mtime.toISOString(),
            });
        }
        catch {
            /* skip unreadable file */
        }
    }
}
async function resolveWordExecutable() {
    for (const candidate of wordExecutableCandidates()) {
        try {
            await promises_1.default.access(candidate);
            return candidate;
        }
        catch {
            /* try next */
        }
    }
    return null;
}
exports.fsService = {
    async getQuickLocations() {
        const home = os_1.default.homedir();
        const locations = [
            { id: "home", label: "Home", path: home },
            { id: "desktop", label: "Desktop", path: path_1.default.join(home, "Desktop") },
            { id: "documents", label: "Documents", path: path_1.default.join(home, "Documents") },
            { id: "downloads", label: "Downloads", path: path_1.default.join(home, "Downloads") },
        ];
        if (process.platform === "win32") {
            for (const letter of "ABCDEFGHIJKLMNOPQRSTUVWXYZ") {
                const drive = `${letter}:\\`;
                try {
                    await promises_1.default.access(drive);
                    locations.push({
                        id: `disk-${letter.toLowerCase()}`,
                        label: `Local Disk (${letter}:)`,
                        path: drive,
                    });
                }
                catch {
                    // Drive not present
                }
            }
        }
        return { locations };
    },
    async listContents(dirPath) {
        try {
            const entries = await promises_1.default.readdir(dirPath, { withFileTypes: true });
            const folders = entries
                .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
                .map((entry) => ({
                name: entry.name,
                path: path_1.default.join(dirPath, entry.name),
            }))
                .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
            const files = (await Promise.all(entries
                .filter((entry) => entry.isFile() && /\.(pdf|png|jpe?g)$/i.test(entry.name) && !entry.name.startsWith("."))
                .map(async (entry) => {
                const filePath = path_1.default.join(dirPath, entry.name);
                const stat = await promises_1.default.stat(filePath);
                return { name: entry.name, path: filePath, size: stat.size };
            }))).sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
            return { path: dirPath, folders, files };
        }
        catch (error) {
            return {
                path: dirPath,
                folders: [],
                files: [],
                error: error instanceof Error ? error.message : "Unable to read folder",
            };
        }
    },
    async listDirectories(dirPath) {
        try {
            const entries = await promises_1.default.readdir(dirPath, { withFileTypes: true });
            const folders = entries
                .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
                .map((entry) => ({
                name: entry.name,
                path: path_1.default.join(dirPath, entry.name),
            }))
                .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
            return { path: dirPath, folders };
        }
        catch (error) {
            return {
                path: dirPath,
                folders: [],
                error: error instanceof Error ? error.message : "Unable to read folder",
            };
        }
    },
    async pickFolder(defaultPath) {
        const result = await electron_2.dialog.showOpenDialog({
            properties: ["openDirectory", "createDirectory"],
            defaultPath: defaultPath,
        });
        if (result.canceled || !result.filePaths[0]) {
            return { canceled: true };
        }
        return { canceled: false, path: result.filePaths[0] };
    },
    async pickDocument(defaultPath) {
        const result = await electron_2.dialog.showOpenDialog({
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
        const stat = await promises_1.default.stat(filePath);
        return {
            canceled: false,
            path: filePath,
            name: path_1.default.basename(filePath),
            size: stat.size,
        };
    },
    async pickImage(defaultPath) {
        const result = await electron_2.dialog.showOpenDialog({
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
        const stat = await promises_1.default.stat(filePath);
        const ext = path_1.default.extname(filePath).toLowerCase();
        const mime = ext === ".png"
            ? "image/png"
            : ext === ".webp"
                ? "image/webp"
                : ext === ".gif"
                    ? "image/gif"
                    : ext === ".bmp"
                        ? "image/bmp"
                        : "image/jpeg";
        const buffer = await promises_1.default.readFile(filePath);
        return {
            canceled: false,
            dataUrl: `data:${mime};base64,${buffer.toString("base64")}`,
            name: path_1.default.basename(filePath),
            size: stat.size,
        };
    },
    async showItemInFolder(targetPath) {
        try {
            electron_1.shell.showItemInFolder(targetPath);
            return { success: true };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : "Unable to open file location",
            };
        }
    },
    async openPath(targetPath) {
        try {
            await promises_1.default.access(targetPath);
            const result = await electron_1.shell.openPath(targetPath);
            if (result) {
                return { success: false, error: result };
            }
            return { success: true };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : "Unable to open file",
            };
        }
    },
    async openDocumentWithApp(targetPath) {
        const ext = path_1.default.extname(targetPath).toLowerCase();
        if ([".doc", ".docx", ".rtf"].includes(ext)) {
            const wordResult = await this.openInWord(targetPath);
            if (wordResult.success)
                return wordResult;
        }
        return this.openPath(targetPath);
    },
    async openInWord(targetPath) {
        try {
            await promises_1.default.access(targetPath);
            const wordPath = await resolveWordExecutable();
            if (!wordPath) {
                return {
                    success: false,
                    error: "Microsoft Word was not found on this computer.",
                };
            }
            await new Promise((resolve, reject) => {
                const child = (0, child_process_1.spawn)(wordPath, [targetPath], {
                    detached: true,
                    stdio: "ignore",
                    windowsHide: true,
                });
                child.once("error", reject);
                child.unref();
                resolve();
            });
            return { success: true };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : "Unable to open file in Word",
            };
        }
    },
    async validateDirectory(dirPath) {
        try {
            const trimmed = dirPath.trim();
            if (!trimmed) {
                return { exists: false, writable: false, valid: false, error: "Folder path is required." };
            }
            const stat = await promises_1.default.stat(trimmed);
            if (!stat.isDirectory()) {
                return { exists: true, writable: false, valid: false, error: "Path is not a folder." };
            }
            const probe = path_1.default.join(trimmed, `.bukolabs-write-test-${Date.now()}`);
            await promises_1.default.writeFile(probe, "ok", { flag: "w" });
            await promises_1.default.unlink(probe);
            return { exists: true, writable: true, valid: true };
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Unable to access folder.";
            const exists = !message.toLowerCase().includes("enoent");
            return { exists, writable: false, valid: false, error: message };
        }
    },
    getDefaultStorageRoot() {
        return path_1.default.join(os_1.default.homedir(), "Documents", "Desktop Scanner Documents");
    },
    async ensureDefaultStorageRoot() {
        const target = this.getDefaultStorageRoot();
        try {
            await promises_1.default.mkdir(target, { recursive: true });
            return { success: true, path: target };
        }
        catch (error) {
            return {
                success: false,
                path: target,
                error: error instanceof Error ? error.message : "Unable to create default storage folder.",
            };
        }
    },
    async ensureDirectory(dirPath) {
        try {
            const trimmed = dirPath.trim();
            await promises_1.default.mkdir(trimmed, { recursive: true });
            return { success: true, path: trimmed };
        }
        catch (error) {
            return {
                success: false,
                path: dirPath,
                error: error instanceof Error ? error.message : "Unable to create folder.",
            };
        }
    },
    async importDocumentToFolder(sourcePath, targetDir) {
        try {
            const trimmedSource = sourcePath.trim();
            const trimmedTarget = targetDir.trim();
            if (!trimmedSource || !trimmedTarget) {
                return { success: false, error: "Import source and destination are required." };
            }
            await promises_1.default.mkdir(trimmedTarget, { recursive: true });
            const unique = await this.resolveUniqueFilePath(trimmedTarget, path_1.default.basename(trimmedSource));
            await promises_1.default.copyFile(trimmedSource, unique.path);
            const stat = await promises_1.default.stat(unique.path);
            return {
                success: true,
                path: unique.path,
                fileName: unique.fileName,
                size: stat.size,
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : "Could not import file into storage.",
            };
        }
    },
    async resolveUniqueFilePath(dirPath, fileName) {
        await promises_1.default.mkdir(dirPath, { recursive: true });
        const ext = path_1.default.extname(fileName);
        const base = path_1.default.basename(fileName, ext);
        let candidate = fileName;
        let counter = 1;
        while (counter < 1000) {
            const target = path_1.default.join(dirPath, candidate);
            try {
                await promises_1.default.access(target);
                candidate = `${base} (${counter})${ext}`;
                counter += 1;
            }
            catch {
                return { path: target, fileName: candidate };
            }
        }
        candidate = `${base}-${Date.now()}${ext}`;
        return { path: path_1.default.join(dirPath, candidate), fileName: candidate };
    },
    async listDocumentsInFolder(dirPath) {
        try {
            const trimmed = dirPath.trim();
            await promises_1.default.mkdir(trimmed, { recursive: true });
            const files = [];
            const folders = new Set();
            await walkDocuments(trimmed, files, folders);
            files.sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt));
            return {
                root: trimmed,
                folders: [...folders].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" })),
                files,
            };
        }
        catch (error) {
            return {
                root: dirPath,
                folders: [],
                files: [],
                error: error instanceof Error ? error.message : "Unable to scan folder.",
            };
        }
    },
    async renamePath(oldPath, newPath) {
        try {
            await promises_1.default.mkdir(path_1.default.dirname(newPath), { recursive: true });
            await promises_1.default.rename(oldPath, newPath);
            return { success: true, path: newPath };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : "Unable to rename file.",
            };
        }
    },
    async deletePath(targetPath) {
        try {
            await promises_1.default.unlink(targetPath);
            return { success: true };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : "Unable to delete file.",
            };
        }
    },
    async copyPathToClipboard(targetPath) {
        try {
            electron_1.clipboard.writeText(targetPath);
            return { success: true };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : "Unable to copy path.",
            };
        }
    },
    async openFolder(dirPath) {
        try {
            const result = await electron_1.shell.openPath(dirPath);
            if (result)
                return { success: false, error: result };
            return { success: true };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : "Unable to open folder.",
            };
        }
    },
    async moveToRecycleBin(targetPath, storageRoot) {
        try {
            const normalizedRoot = path_1.default.normalize(storageRoot.trim());
            const normalizedTarget = path_1.default.normalize(targetPath.trim());
            const recycleRoot = path_1.default.join(normalizedRoot, exports.RECYCLE_BIN_FOLDER_NAME);
            await promises_1.default.mkdir(recycleRoot, { recursive: true });
            let relative = path_1.default.relative(normalizedRoot, normalizedTarget);
            if (!relative || relative.startsWith("..") || path_1.default.isAbsolute(relative)) {
                relative = path_1.default.basename(normalizedTarget);
            }
            let destination = path_1.default.join(recycleRoot, relative);
            let counter = 1;
            while (counter < 1000) {
                try {
                    await promises_1.default.access(destination);
                    const parsed = path_1.default.parse(relative);
                    destination = path_1.default.join(recycleRoot, parsed.dir, `${parsed.name} (${counter})${parsed.ext}`);
                    counter += 1;
                }
                catch {
                    break;
                }
            }
            await promises_1.default.mkdir(path_1.default.dirname(destination), { recursive: true });
            await promises_1.default.rename(normalizedTarget, destination);
            return { success: true, recycledPath: destination };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : "Unable to move item to recycle bin.",
            };
        }
    },
    async restoreFromRecycleBin(recycledPath, originalPath) {
        try {
            const fromPath = path_1.default.normalize(recycledPath.trim());
            const toPath = path_1.default.normalize(originalPath.trim());
            await promises_1.default.mkdir(path_1.default.dirname(toPath), { recursive: true });
            await promises_1.default.rename(fromPath, toPath);
            return { success: true, restoredPath: toPath };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : "Unable to restore file.",
            };
        }
    },
};
