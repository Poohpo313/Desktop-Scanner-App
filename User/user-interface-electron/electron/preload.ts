import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("bukolabs", {
  auth: {
    login: (payload: { username: string; password: string }) =>
      ipcRenderer.invoke("auth:login", payload),
    logout: (payload: { token: string }) => ipcRenderer.invoke("auth:logout", payload),
    activateKey: (payload: { serialKey: string; username: string }) =>
      ipcRenderer.invoke("auth:activate-key", payload),
    checkSession: (payload: { token: string }) =>
      ipcRenderer.invoke("auth:check-session", payload),
    requestRecovery: (payload: {
      channel: "email" | "sms";
      username?: string;
      context?: string;
    }) => ipcRenderer.invoke("auth:request-recovery", payload),
    getProfile: (payload: { token: string }) => ipcRenderer.invoke("auth:get-profile", payload),
    updateProfile: (payload: {
      token: string;
      firstName?: string;
      lastName?: string;
      email?: string;
      phoneNumber?: string;
    }) => ipcRenderer.invoke("auth:update-profile", payload),
    changePassword: (payload: { token: string; currentPassword: string; newPassword: string }) =>
      ipcRenderer.invoke("auth:change-password", payload),
    getKnownPassword: (payload: { userId: number }) =>
      ipcRenderer.invoke("auth:get-known-password", payload),
    getSupportContact: (payload: { token?: string; username?: string; serialKey?: string }) =>
      ipcRenderer.invoke("auth:get-support-contact", payload),
    syncPendingActivations: () => ipcRenderer.invoke("auth:sync-pending-activations"),
  },
  keys: {
    validate: (payload: { serialKey: string }) =>
      ipcRenderer.invoke("keys:validate", payload),
    getStatus: (payload?: { userId?: number }) =>
      ipcRenderer.invoke("keys:get-status", payload ?? {}),
    requestExtension: (payload: { requestedDays: number; userNote?: string; userId?: number }) =>
      ipcRenderer.invoke("keys:request-extension", payload),
    requestRenewal: (payload: { requestedDays: number; userNote?: string; userId?: number }) =>
      ipcRenderer.invoke("keys:request-renewal", payload),
  },
  scanner: {
    listDevices: () => ipcRenderer.invoke("scanner:list-devices"),
    getCapabilities: (deviceId: string) =>
      ipcRenderer.invoke("scanner:get-capabilities", { deviceId }),
    startScan: (payload: { deviceId: string; settings: Record<string, unknown> }) =>
      ipcRenderer.invoke("scanner:start-scan", payload),
    cancelScan: () => ipcRenderer.invoke("scanner:cancel-scan"),
  },
  devices: {
    register: (payload: {
      deviceName: string;
      deviceType: string;
      serialNumber: string;
      assignedUser: number;
      username?: string;
    }) => ipcRenderer.invoke("devices:register", payload),
    syncForUser: (payload: { userId: number; username: string }) =>
      ipcRenderer.invoke("devices:sync-for-user", payload),
  },
  files: {
    save: (payload: {
      imageBuffer?: ArrayBuffer;
      imageBuffers?: ArrayBuffer[];
      filename: string;
      folderId?: number;
      userId: number;
      fileType?: string;
      exportFolder?: string;
      ocrText?: string;
      skipOcr?: boolean;
    }) => ipcRenderer.invoke("files:save", payload),
    list: (payload: { folderId?: number; userId: number }) =>
      ipcRenderer.invoke("files:list", payload),
    delete: (payload: { documentId: number }) =>
      ipcRenderer.invoke("files:delete", payload),
    restore: (payload: { documentId: number }) =>
      ipcRenderer.invoke("files:restore", payload),
    search: (payload: { query: string; filters?: Record<string, unknown> }) =>
      ipcRenderer.invoke("files:search", payload),
    getOcrStatus: (payload: { documentId: number }) =>
      ipcRenderer.invoke("files:get-ocr-status", payload),
    extractOcrFromPath: (payload: { path: string }) =>
      ipcRenderer.invoke("files:extract-ocr-from-path", payload),
  },
  print: {
    listPrinters: (payload?: { preferredScannerName?: string | null }) =>
      ipcRenderer.invoke("print:list-printers", payload),
    start: (payload: {
      printerId: string;
      documentPath?: string;
      settings: Record<string, unknown>;
    }) => ipcRenderer.invoke("print:start", payload),
  },
  sync: {
    trigger: () => ipcRenderer.invoke("sync:trigger"),
    status: () => ipcRenderer.invoke("sync:status"),
  },
  help: {
    submitConcern: (payload: {
      concernType: string;
      category: string;
      subject: string;
      message: string;
      email?: string;
      rating?: number;
    }) => ipcRenderer.invoke("help:submit-concern", payload),
    listTickets: (payload?: { userId?: number }) => ipcRenderer.invoke("help:list-tickets", payload),
    markReplyRead: (payload: { concernId: number }) =>
      ipcRenderer.invoke("help:mark-reply-read", payload),
  },
  gateway: {
    getConfig: () => ipcRenderer.invoke("gateway:get-config"),
    setUrl: (payload: { url: string }) => ipcRenderer.invoke("gateway:set-url", payload),
    checkAvailable: () => ipcRenderer.invoke("gateway:check-available"),
  },
  filesystem: {
    getQuickLocations: () => ipcRenderer.invoke("fs:get-quick-locations"),
    listDirectories: (payload: { path: string }) =>
      ipcRenderer.invoke("fs:list-directories", payload),
    listContents: (payload: { path: string }) =>
      ipcRenderer.invoke("fs:list-contents", payload),
    pickFolder: (payload?: { defaultPath?: string }) =>
      ipcRenderer.invoke("fs:pick-folder", payload),
    pickDocument: (payload?: { defaultPath?: string }) =>
      ipcRenderer.invoke("fs:pick-document", payload),
    pickImage: (payload?: { defaultPath?: string }) =>
      ipcRenderer.invoke("fs:pick-image", payload),
    showItemInFolder: (payload: { path: string }) =>
      ipcRenderer.invoke("fs:show-item-in-folder", payload),
    openPath: (payload: { path: string }) => ipcRenderer.invoke("fs:open-path", payload),
    openInWord: (payload: { path: string }) => ipcRenderer.invoke("fs:open-in-word", payload),
    validateDirectory: (payload: { path: string }) =>
      ipcRenderer.invoke("fs:validate-directory", payload),
    ensureDirectory: (payload: { path: string }) =>
      ipcRenderer.invoke("fs:ensure-directory", payload),
    getDefaultStorageRoot: () => ipcRenderer.invoke("fs:get-default-storage-root"),
    ensureDefaultStorageRoot: () => ipcRenderer.invoke("fs:ensure-default-storage-root"),
    importDocumentToFolder: (payload: { sourcePath: string; targetDir: string }) =>
      ipcRenderer.invoke("fs:import-document-to-folder", payload),
    resolveUniqueFilePath: (payload: { dirPath: string; fileName: string }) =>
      ipcRenderer.invoke("fs:resolve-unique-file-path", payload),
    listDocumentsInFolder: (payload: { path: string }) =>
      ipcRenderer.invoke("fs:list-documents-in-folder", payload),
    renamePath: (payload: { oldPath: string; newPath: string }) =>
      ipcRenderer.invoke("fs:rename-path", payload),
    deletePath: (payload: { path: string }) => ipcRenderer.invoke("fs:delete-path", payload),
    copyPathToClipboard: (payload: { path: string }) =>
      ipcRenderer.invoke("fs:copy-path-to-clipboard", payload),
    openFolder: (payload: { path: string }) => ipcRenderer.invoke("fs:open-folder", payload),
    moveToRecycleBin: (payload: { path: string; storageRoot: string }) =>
      ipcRenderer.invoke("fs:move-to-recycle-bin", payload),
    restoreFromRecycleBin: (payload: { recycledPath: string; originalPath: string }) =>
      ipcRenderer.invoke("fs:restore-from-recycle-bin", payload),
  },
});
