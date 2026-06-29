export type ScanStepId = "select" | "configure" | "scan" | "preview" | "save";

export const SCAN_STEPS = [
  { id: "select" as const, label: "Select Scanner/Printer" },
  { id: "configure" as const, label: "Configure" },
  { id: "scan" as const, label: "Scan" },
  { id: "preview" as const, label: "Preview" },
  { id: "save" as const, label: "Save" },
];

export type ScannerDevice = {
  id: string;
  name: string;
  type: string;
  connection: string;
  status: "ready" | "offline";
  resolutionMax: string;
  colorDepth: string;
};

/** Populated at runtime from detected devices — no demo hardware entries. */
export const SCANNERS: ScannerDevice[] = [];

export const DEPARTMENTS = [
  { id: "finance", label: "Finance", description: "Invoices, Receipts, Vouchers, Reports, Payroll" },
  {
    id: "registrar",
    label: "Registrar",
    description: "Student Records, Enrollment Forms, Grades, Certificates",
  },
  {
    id: "hr",
    label: "Human Resources",
    description: "Employee Files, Attendance, Contracts, Leave Forms",
  },
  {
    id: "admin",
    label: "Admin Office",
    description: "Memorandums, Requests, Approvals, Reports",
  },
  {
    id: "library",
    label: "Library",
    description: "Borrower Records, Inventory, Reports",
  },
  { id: "others", label: "Others", description: "Specify:" },
];

export const PAPER_SIZES = [
  { id: "short-bond", label: "Short Bond", description: "8.5 × 11 in — common document size" },
  { id: "long-bond", label: "Long Bond", description: "8.5 × 13 in — common Philippine long paper" },
  { id: "a4", label: "A4", description: "210 × 297 mm — international standard" },
  { id: "letter", label: "Letter", description: "8.5 × 11 in — US letter size" },
];

export const COLOR_MODES = [
  { id: "color", label: "Color", description: "Best for colored documents, IDs, and receipts." },
  { id: "grayscale", label: "Grayscale", description: "Balanced quality and smaller file size." },
  { id: "bw", label: "Black & White", description: "Best for text-only documents and forms." },
];

export const RESOLUTIONS = [
  { id: "150", label: "150 DPI", description: "Small file size, draft quality" },
  { id: "300", label: "300 DPI", description: "Recommended for readable documents" },
  { id: "600", label: "600 DPI", description: "High quality, larger file size" },
  { id: "1200", label: "1200 DPI", description: "Archival quality and detailed images" },
];

export const NAMING_PATTERNS = [
  {
    id: "[Department]_[Date]_[Time]",
    label: "[Department]_[Date]_[Time]",
    description: "Example: Finance_2024-05-20_14-30",
  },
  {
    id: "[Department]_[DocumentType]_[Date]",
    label: "[Department]_[DocumentType]_[Date]",
    description: "Example: Finance_Invoice_2024-05-20",
  },
  {
    id: "[Date]_[Department]_[Sequence]",
    label: "[Date]_[Department]_[Sequence]",
    description: "Example: 2024-05-20_Finance_001",
  },
  {
    id: "Scan_[Date]_[Time]",
    label: "Scan_[Date]_[Time]",
    description: "Example: Scan_2024-05-20_14-30",
  },
];

export const FILE_FORMAT_OPTIONS = [
  {
    id: "pdf",
    label: "PDF (OCR Searchable)",
    description: "Searchable PDF with OCR text layer.",
  },
  {
    id: "png",
    label: "PNG Image",
    description: "Lossless image format, larger file size.",
  },
  {
    id: "jpeg",
    label: "JPEG Image",
    description: "Compressed image format, smaller file size.",
  },
];

export const SCAN_PRESETS: Record<
  string,
  Pick<OfflineScanConfig, "paperSizeId" | "colorModeId" | "resolutionId" | "scanSource">
> = {
  "ID Card": {
    paperSizeId: "short-bond",
    colorModeId: "color",
    resolutionId: "300",
    scanSource: "flatbed",
  },
  Document: {
    paperSizeId: "a4",
    colorModeId: "color",
    resolutionId: "300",
    scanSource: "flatbed",
  },
  Receipt: {
    paperSizeId: "short-bond",
    colorModeId: "grayscale",
    resolutionId: "150",
    scanSource: "flatbed",
  },
  Photo: {
    paperSizeId: "a4",
    colorModeId: "color",
    resolutionId: "600",
    scanSource: "flatbed",
  },
};

export type OfflineScanConfig = {
  scanMode: "single" | "batch";
  departmentId: string;
  customDepartmentLabel: string;
  savePath: string;
  scanSource: "flatbed" | "adf";
  paperSizeId: string;
  colorModeId: string;
  resolutionId: string;
  duplex: "single" | "double";
  fileFormat: "pdf" | "png" | "jpeg";
  ocrEnabled: boolean;
  namingPattern: string;
};

export const DEFAULT_SCAN_CONFIG: OfflineScanConfig = {
  scanMode: "single",
  departmentId: "finance",
  customDepartmentLabel: "",
  savePath: "",
  scanSource: "flatbed",
  paperSizeId: "a4",
  colorModeId: "color",
  resolutionId: "300",
  duplex: "single",
  fileFormat: "pdf",
  ocrEnabled: true,
  namingPattern: "[Department]_[Date]_[Time]",
};
