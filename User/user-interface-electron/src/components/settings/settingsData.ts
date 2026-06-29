export const SETTINGS_TABS = [
  { id: "general", label: "General" },
  { id: "scan-defaults", label: "Scan Defaults" },
  { id: "storage", label: "Storage" },
  { id: "cloud", label: "Cloud" },
  { id: "ocr", label: "OCR" },
  { id: "security", label: "Security" },
] as const;

export type SettingsTabId = (typeof SETTINGS_TABS)[number]["id"];

export type SaveModeId = "auto-save" | "ask-every-time" | "multiple-folders" | "local-cloud-sync";

export const SAVE_MODE_OPTIONS: {
  id: SaveModeId;
  title: string;
  description: string;
}[] = [
  {
    id: "auto-save",
    title: "Auto-save to default folder",
    description:
      "Scans are saved automatically after capture using the selected department and naming pattern.",
  },
  {
    id: "ask-every-time",
    title: "Ask where to save every time",
    description: "Show a save dialog after each scan for full user control.",
  },
  {
    id: "multiple-folders",
    title: "Save to multiple folders",
    description:
      "Save one scan into more than one selected location, such as department and backup folders.",
  },
  {
    id: "local-cloud-sync",
    title: "Save local + cloud sync",
    description: "Keep a local copy and sync a copy only when the user is signed in.",
  },
];

export const SETTINGS_NAMING_PATTERNS = [
  {
    id: "{Document}_{Date}_{Time}",
    label: "{Document}_{Date}_{Time}",
    description: "Example: Finance_2024-05-20_10-45",
  },
  {
    id: "{Department}_{Date}_{Time}_{Counter}",
    label: "{Department}_{Date}_{Time}_{Counter}",
    description: "Example: Finance_2024-05-20_10-45_001",
  },
  {
    id: "{Department}_{DocumentType}_{Date}",
    label: "{Department}_{DocumentType}_{Date}",
    description: "Example: Finance_Invoice_2024-05-20",
  },
] as const;

export const STORAGE_FOLDER_ORGANIZATION_OPTIONS = [
  {
    id: "by-date",
    label: "By Date (YYYY-MM-DD)",
    description: "Organize scans into dated subfolders",
  },
  {
    id: "by-department",
    label: "By Department",
    description: "Group files by department folders",
  },
  {
    id: "flat",
    label: "Flat folder",
    description: "Save all scans in one folder",
  },
] as const;

export type AppSettings = {
  language: string;
  theme: string;
  startOnBoot: boolean;
  checkUpdates: boolean;
  defaultSaveLocation: string;
  defaultFileType: string;
  showRecentScans: boolean;
  optionalLogin: string;
  cloudSync: boolean;
  localOnlyMode: string;
  autoOpenAfterScan: boolean;
  saveNamingPattern: string;
  defaultSaveMode: string;
  multipleSaveFolders: string;
  saveMode: SaveModeId;
  primaryFolder: string;
  secondaryFolder: string;
  cloudFolderLabel: string;
  departmentRule: string;
  duplicateHandling: string;
  folderTags: string[];
  scanSource: string;
  scanDefaultScannerId: string;
  scanPaperSizeId: string;
  scanColorModeId: string;
  scanResolutionId: string;
  scanColorMode: string;
  scanResolution: string;
  scanFileFormat: string;
  scanPaperSize: string;
  scanDuplex: boolean;
  scanAutoCrop: boolean;
  scanAutoDeskew: boolean;
  scanBlankPageRemoval: boolean;
  scanBrightness: number;
  scanContrast: number;
  storageRoot: string;
  storageDefaultSaveLocation: string;
  storageTempFolder: string;
  storageFolderOrganizationId: string;
  storageFolderOrganization: string;
  storageAutoCreateSubfolders: boolean;
  storageAutoCleanTemp: boolean;
  storageArchiveCompleted: boolean;
  storageLocalUsedGb: number;
  storageLocalTotalGb: number;
  storageCloudUsedGb: number;
  storageCloudTotalGb: number;
  storageSyncOnStartup: boolean;
  storageExternalBackup: string;
  storageLowSpaceAlerts: boolean;
  storageAutoCleanup: boolean;
  storageRetentionDays: string;
  storageRetentionDaysId: string;
  storageExternalBackupModeId: string;
  storageExternalBackupMode: string;
  databaseType: string;
  databaseBackup: string;
  ocrEnabled: boolean;
  ocrLanguage: string;
  ocrAutoOnScan: boolean;
  ocrSearchablePdf: boolean;
  ocrAutoRotate: boolean;
  ocrTableDetection: boolean;
  ocrHandwritingRecognition: boolean;
  ocrPreserveLayout: boolean;
  ocrKeywordExtraction: boolean;
  ocrPdfAOutput: boolean;
  securitySessionTimeoutId: string;
  securitySessionTimeout: string;
  securityAppLockId: string;
  securityAppLockLabel: string;
  securityOptionalLogin: boolean;
  securityRequireAdminApproval: boolean;
  securityRequireLogin: boolean;
  securityEncryptLocal: boolean;
  securitySecureCloudSync: boolean;
  securityRemovableStorageId: string;
  securityRemovableStorage: string;
  securityAuditLog: boolean;
};

export const DEFAULT_APP_SETTINGS: AppSettings = {
  language: "English",
  theme: "Light",
  startOnBoot: true,
  checkUpdates: true,
  defaultSaveLocation: "",
  defaultFileType: "PDF",
  showRecentScans: true,
  optionalLogin: "Enabled",
  cloudSync: false,
  localOnlyMode: "Available",
  autoOpenAfterScan: false,
  saveNamingPattern: "{Department}_{Date}_{Time}",
  defaultSaveMode: "Auto-save to folder",
  multipleSaveFolders: "Not enabled",
  saveMode: "auto-save",
  primaryFolder: "",
  secondaryFolder: "",
  cloudFolderLabel: "Enabled after login",
  departmentRule: "Finance -> Invoices",
  duplicateHandling: "Add counter automatically",
  folderTags: [],
  scanSource: "Auto Detect",
  scanDefaultScannerId: "",
  scanPaperSizeId: "a4",
  scanColorModeId: "color",
  scanResolutionId: "300",
  scanColorMode: "Color",
  scanResolution: "300 DPI",
  scanFileFormat: "PDF",
  scanPaperSize: "A4 — 210 × 297 mm",
  scanDuplex: false,
  scanAutoCrop: true,
  scanAutoDeskew: true,
  scanBlankPageRemoval: true,
  scanBrightness: 0,
  scanContrast: 0,
  storageRoot: "",
  storageDefaultSaveLocation: "",
  storageTempFolder: "",
  storageFolderOrganizationId: "by-date",
  storageFolderOrganization: "By Date (YYYY-MM-DD)",
  storageAutoCreateSubfolders: true,
  storageAutoCleanTemp: true,
  storageArchiveCompleted: true,
  storageLocalUsedGb: 0,
  storageLocalTotalGb: 0,
  storageCloudUsedGb: 0,
  storageCloudTotalGb: 0,
  storageSyncOnStartup: true,
  storageExternalBackup: "",
  storageLowSpaceAlerts: true,
  storageAutoCleanup: false,
  storageRetentionDays: "90 days",
  storageRetentionDaysId: "90",
  storageExternalBackupModeId: "local-drive",
  storageExternalBackupMode: "Local drive backup",
  databaseType: "SQLite",
  databaseBackup: "Weekly",
  ocrEnabled: true,
  ocrLanguage: "English",
  ocrAutoOnScan: true,
  ocrSearchablePdf: true,
  ocrAutoRotate: true,
  ocrTableDetection: true,
  ocrHandwritingRecognition: true,
  ocrPreserveLayout: true,
  ocrKeywordExtraction: true,
  ocrPdfAOutput: true,
  securitySessionTimeoutId: "30",
  securitySessionTimeout: "30 minutes",
  securityAppLockId: "5",
  securityAppLockLabel: "5 minutes",
  securityOptionalLogin: true,
  securityRequireAdminApproval: true,
  securityRequireLogin: true,
  securityEncryptLocal: true,
  securitySecureCloudSync: true,
  securityRemovableStorageId: "read-only",
  securityRemovableStorage: "Read-only",
  securityAuditLog: false,
};
