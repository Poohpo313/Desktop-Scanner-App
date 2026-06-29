export {};

declare global {
  interface Window {
    bukolabs?: {
      auth: {
        login: (p: { username: string; password: string }) => Promise<{
          success: boolean;
          token?: string;
          role?: string;
          userId?: number;
          error?: string;
        }>;
        logout: (p: { token: string }) => Promise<{ success: boolean }>;
        activateKey: (p: {
          serialKey: string;
          username: string;
        }) => Promise<{
          success: boolean;
          userId?: number;
          token?: string;
          role?: string;
          error?: string;
        }>;
        checkSession: (p: { token: string }) => Promise<{
          valid: boolean;
          remainingMs: number;
        }>;
        requestRecovery: (p: {
          channel: "email" | "sms";
          username?: string;
          context?: string;
        }) => Promise<{
          success: boolean;
          requestId?: string;
          error?: string;
        }>;
        getProfile: (p: { token: string }) => Promise<{
          success: boolean;
          profile?: {
            userId: number;
            username: string;
            firstName?: string | null;
            lastName?: string | null;
            email?: string | null;
            phoneNumber?: string | null;
            company?: string | null;
            department?: string | null;
            serialKey?: string | null;
            accountStatus?: string;
            adminContact?: {
              adminName?: string | null;
              email?: string | null;
              phoneNumber?: string | null;
            } | null;
          };
          error?: string;
        }>;
        updateProfile: (p: {
          token: string;
          firstName?: string;
          lastName?: string;
          email?: string;
          phoneNumber?: string;
        }) => Promise<{ success: boolean; profile?: unknown; error?: string }>;
        changePassword: (p: {
          token: string;
          currentPassword: string;
          newPassword: string;
        }) => Promise<{ success: boolean; error?: string }>;
        getSupportContact: (p: { token?: string; username?: string; serialKey?: string }) => Promise<{
          success: boolean;
          contact?: {
            adminName: string | null;
            email: string | null;
            phoneNumber: string | null;
          };
          error?: string;
        }>;
        syncPendingActivations: () => Promise<{ success: boolean }>;
      };
      keys: {
        validate: (p: { serialKey: string }) => Promise<{
          valid: boolean;
          error?: string;
        }>;
        getStatus: (payload?: { userId?: number }) => Promise<{
          success: boolean;
          data?: unknown;
          error?: string;
        }>;
        requestExtension: (payload: {
          requestedDays: number;
          userNote?: string;
          userId?: number;
        }) => Promise<{ success: boolean; data?: unknown; error?: string }>;
        requestRenewal: (payload: {
          requestedDays: number;
          userNote?: string;
          userId?: number;
        }) => Promise<{ success: boolean; data?: unknown; error?: string }>;
      };
      scanner: {
        listDevices: () => Promise<{
          devices: Array<{
            id: string;
            name: string;
            type: string;
            driver: string;
            connection?: string;
          }>;
        }>;
        getCapabilities: (deviceId: string) => Promise<Record<string, unknown>>;
        startScan: (p: {
          deviceId: string;
          settings: Record<string, unknown>;
        }) => Promise<{ imageBuffer?: ArrayBuffer; format?: string }>;
        cancelScan: () => Promise<{ success: boolean }>;
      };
      devices: {
        register: (p: {
          deviceName: string;
          deviceType: string;
          serialNumber: string;
          assignedUser: number;
          username?: string;
        }) => Promise<{ deviceId?: number; serialNumber?: string }>;
        syncForUser: (p: {
          userId: number;
          username: string;
        }) => Promise<{ registered: number }>;
      };
      files: {
        save: (p: {
          imageBuffer?: ArrayBuffer;
          imageBuffers?: ArrayBuffer[];
          filename: string;
          folderId?: number;
          userId: number;
          fileType?: string;
          exportFolder?: string;
          ocrText?: string;
          skipOcr?: boolean;
        }) => Promise<{ documentId?: number; hash?: string; filePath?: string; fileName?: string; ocrText?: string }>;
        list: (p: { folderId?: number; userId: number }) => Promise<{
          files: unknown[];
          folders: unknown[];
        }>;
        delete: (p: { documentId: number }) => Promise<{ success: boolean }>;
        restore: (p: { documentId: number }) => Promise<{ success: boolean }>;
        search: (p: { query: string; filters?: Record<string, unknown> }) => Promise<{
          results: unknown[];
        }>;
        getOcrStatus: (p: { documentId: number }) => Promise<{
          ready: boolean;
          ocrText?: string;
        }>;
        extractOcrFromPath: (p: { path: string }) => Promise<{ ocrText?: string }>;
      };
      print: {
        listPrinters: (payload?: { preferredScannerName?: string | null }) => Promise<{
          printers: Array<{
            id: string;
            name: string;
            type: string;
            driver: string;
            matchedScannerName?: string | null;
          }>;
          preferredPrinterId?: string | null;
          preferredScannerName?: string | null;
          scannerWarning?: string | null;
        }>;
        start: (p: {
          printerId: string;
          documentPath?: string;
          settings: Record<string, unknown>;
        }) => Promise<{ success: boolean; message?: string }>;
      };
      sync: {
        trigger: () => Promise<{ queued: number }>;
        status: () => Promise<{
          pending: number;
          synced: number;
          failed: number;
          storageUsed: number;
        }>;
      };
      filesystem: {
        getQuickLocations: () => Promise<{
          locations: Array<{ id: string; label: string; path: string }>;
        }>;
        listDirectories: (p: { path: string }) => Promise<{
          path: string;
          folders: Array<{ name: string; path: string }>;
          error?: string;
        }>;
        listContents: (p: { path: string }) => Promise<{
          path: string;
          folders: Array<{ name: string; path: string }>;
          files: Array<{ name: string; path: string; size: number }>;
          error?: string;
        }>;
        pickFolder: (p?: { defaultPath?: string }) => Promise<{
          canceled: boolean;
          path?: string;
        }>;
        pickDocument: (p?: { defaultPath?: string }) => Promise<{
          canceled: boolean;
          path?: string;
          name?: string;
          size?: number;
        }>;
        pickImage: (p?: { defaultPath?: string }) => Promise<{
          canceled: boolean;
          dataUrl?: string;
          name?: string;
          size?: number;
        }>;
        showItemInFolder: (p: { path: string }) => Promise<{
          success: boolean;
          error?: string;
        }>;
        openPath: (p: { path: string }) => Promise<{
          success: boolean;
          error?: string;
        }>;
        openInWord: (p: { path: string }) => Promise<{
          success: boolean;
          error?: string;
        }>;
        validateDirectory: (p: { path: string }) => Promise<{
          exists: boolean;
          writable: boolean;
          valid: boolean;
          error?: string;
        }>;
        ensureDirectory: (p: { path: string }) => Promise<{
          success: boolean;
          path: string;
          error?: string;
        }>;
        getDefaultStorageRoot: () => Promise<{ path: string }>;
        ensureDefaultStorageRoot: () => Promise<{ success: boolean; path: string; error?: string }>;
        importDocumentToFolder: (p: { sourcePath: string; targetDir: string }) => Promise<{
          success: boolean;
          path?: string;
          fileName?: string;
          size?: number;
          error?: string;
        }>;
        resolveUniqueFilePath: (p: { dirPath: string; fileName: string }) => Promise<{
          path: string;
          fileName: string;
        }>;
        listDocumentsInFolder: (p: { path: string }) => Promise<{
          root: string;
          folders: string[];
          files: Array<{ name: string; path: string; size: number; modifiedAt: string }>;
          error?: string;
        }>;
        renamePath: (p: { oldPath: string; newPath: string }) => Promise<{
          success: boolean;
          path?: string;
          error?: string;
        }>;
        deletePath: (p: { path: string }) => Promise<{
          success: boolean;
          error?: string;
        }>;
        copyPathToClipboard: (p: { path: string }) => Promise<{
          success: boolean;
          error?: string;
        }>;
        openFolder: (p: { path: string }) => Promise<{
          success: boolean;
          error?: string;
        }>;
        moveToRecycleBin: (p: { path: string; storageRoot: string }) => Promise<{
          success: boolean;
          recycledPath?: string;
          error?: string;
        }>;
        restoreFromRecycleBin: (p: { recycledPath: string; originalPath: string }) => Promise<{
          success: boolean;
          restoredPath?: string;
          error?: string;
        }>;
      };
      help: {
        submitConcern: (p: {
          concernType: string;
          category: string;
          subject: string;
          message: string;
          email?: string;
          rating?: number;
        }) => Promise<{ success: boolean; error?: string }>;
        listTickets: (p?: { userId?: number }) => Promise<{
          success: boolean;
          data?: Array<{
            id: number;
            subject: string;
            category: string;
            concernType: string;
            message: string;
            status: string;
            timestamp: string;
            adminReply?: string | null;
            repliedAt?: string | null;
            replyRead?: boolean;
          }>;
          error?: string;
        }>;
        markReplyRead: (p: { concernId: number }) => Promise<{ success: boolean; error?: string }>;
      };
      gateway: {
        getConfig: () => Promise<{ url: string; defaultUrl: string }>;
        setUrl: (p: { url: string }) => Promise<{ success: boolean; url: string; reachable: boolean }>;
        checkAvailable: () => Promise<{ reachable: boolean; url: string; discovered?: boolean }>;
        discover: () => Promise<{ success: boolean; url: string }>;
      };
    };
  }
}
