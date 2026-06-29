export type PrintSource = "documents" | "local";

export type PrintSettingsState = {
  printerId: string;
  printerName: string;
  copies: number;
  paperSize: string;
  colorMode: "Color" | "Black & White";
};

export type PrintFlowState = {
  source: PrintSource;
  selectedDocumentId?: string;
  localFileName?: string;
  localFilePath?: string;
  localFilePages?: number;
  returnTo?: "scan" | "picker" | "documents";
  scannerDeviceId?: string;
  scannerDeviceName?: string;
  settings?: PrintSettingsState;
};

export type PrintCompletedState = {
  fileName: string;
  selectedDocumentId?: string;
  returnTo?: PrintFlowState["returnTo"];
};

export const DEFAULT_PRINT_SETTINGS: PrintSettingsState = {
  printerId: "",
  printerName: "",
  copies: 1,
  paperSize: "A4",
  colorMode: "Color",
};

export const DEMO_PRINTER_NAME = DEFAULT_PRINT_SETTINGS.printerName;

export const DEMO_PRINT_SETTINGS = {
  copies: DEFAULT_PRINT_SETTINGS.copies,
  paperSize: DEFAULT_PRINT_SETTINGS.paperSize,
  colorMode: DEFAULT_PRINT_SETTINGS.colorMode,
} as const;

export const PAPER_SIZE_OPTIONS = ["A4", "Letter", "Legal", "A5"] as const;

export const COLOR_MODE_OPTIONS = ["Color", "Black & White"] as const;

export const DEMO_LOCAL_FILE_NAME = "Local_Document.pdf";
