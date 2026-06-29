import {
  COLOR_MODES,
  DEPARTMENTS,
  PAPER_SIZES,
  RESOLUTIONS,
  SCANNERS,
  type OfflineScanConfig,
  type ScannerDevice,
} from "./scanOfflineData";

export function getScannerName(scannerId: string, scanners: ScannerDevice[] = SCANNERS): string {
  return scanners.find((s) => s.id === scannerId)?.name ?? "Unknown Scanner";
}

export function getDepartmentLabel(departmentId: string): string {
  return DEPARTMENTS.find((d) => d.id === departmentId)?.label ?? "Finance";
}

export function mapProfileDepartmentToConfig(
  department: string | null | undefined,
): Pick<OfflineScanConfig, "departmentId" | "customDepartmentLabel"> | null {
  const trimmed = department?.trim();
  if (!trimmed) return null;

  const normalized = trimmed.toLowerCase();

  const byId = DEPARTMENTS.find((entry) => entry.id === normalized);
  if (byId) {
    return { departmentId: byId.id, customDepartmentLabel: "" };
  }

  const byLabel = DEPARTMENTS.find((entry) => entry.label.toLowerCase() === normalized);
  if (byLabel) {
    return { departmentId: byLabel.id, customDepartmentLabel: "" };
  }

  const partial = DEPARTMENTS.find(
    (entry) =>
      entry.id !== "others" &&
      (normalized.includes(entry.label.toLowerCase()) ||
        entry.label.toLowerCase().includes(normalized)),
  );
  if (partial) {
    return { departmentId: partial.id, customDepartmentLabel: "" };
  }

  return { departmentId: "others", customDepartmentLabel: trimmed };
}

export function resolveDepartmentLabel(
  config: Pick<OfflineScanConfig, "departmentId" | "customDepartmentLabel">,
): string {
  if (config.departmentId === "others" && config.customDepartmentLabel.trim()) {
    return config.customDepartmentLabel.trim();
  }
  return getDepartmentLabel(config.departmentId);
}

export function getDepartmentSavePath(
  config: Pick<OfflineScanConfig, "departmentId" | "customDepartmentLabel">,
): string {
  const dept = resolveDepartmentLabel(config);
  return `C:\\Scanned Documents\\${dept}`;
}

export function getPaperSizeDimensions(paperSizeId: string): string {
  const size = PAPER_SIZES.find((p) => p.id === paperSizeId);
  return size?.description?.split(" — ")[0] ?? "";
}

export function getPaperSizeDisplay(paperSizeId: string): string {
  return getBondPaperSizeDisplay(paperSizeId);
}

export function getBondPaperSizeDisplay(paperSizeId: string): string {
  const size = PAPER_SIZES.find((p) => p.id === paperSizeId);
  if (!size) return "Short Bond — 8.5 × 11 in";
  const dimensions = getPaperSizeDimensions(paperSizeId);
  return dimensions ? `${size.label} — ${dimensions}` : size.label;
}

export function getColorModeLabel(colorModeId: string): string {
  return COLOR_MODES.find((c) => c.id === colorModeId)?.label ?? "Color";
}

export function getResolutionLabel(resolutionId: string): string {
  return RESOLUTIONS.find((r) => r.id === resolutionId)?.label ?? "300 DPI";
}

export function getResolutionDpi(resolutionId: string): number {
  const parsed = Number(resolutionId);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 300;
}

export function getFormatLabel(config: OfflineScanConfig): string {
  if (config.fileFormat === "pdf" && config.ocrEnabled) return "PDF with OCR";
  if (config.fileFormat === "pdf") return "PDF";
  return config.fileFormat.toUpperCase();
}

export function getFormatSaveLabel(config: OfflineScanConfig): string {
  if (config.fileFormat === "pdf" && config.ocrEnabled) return "PDF with OCR enabled";
  if (config.fileFormat === "pdf") return "PDF";
  return config.fileFormat.toUpperCase();
}

export function generateScanFileName(
  config: Pick<OfflineScanConfig, "departmentId" | "customDepartmentLabel" | "namingPattern" | "fileFormat">,
): string {
  const department = resolveDepartmentLabel(config).replace(/\s+/g, "");
  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const time = now.toTimeString().slice(0, 5).replace(":", "-");
  const ext = config.fileFormat === "jpeg" ? "jpeg" : config.fileFormat === "png" ? "png" : "pdf";

  const pattern = config.namingPattern || "[Department]_[Date]_[Time]";
  let base = pattern
    .replace("[Department]", department)
    .replace("[DocumentType]", "Scan")
    .replace("[Date]", date)
    .replace("[Time]", time)
    .replace("[Sequence]", "001");

  if (!base.trim()) {
    base = `${department}_${date}_${time}`;
  }

  return `${base}.${ext}`;
}

export function getDefaultFileName(
  config: Pick<OfflineScanConfig, "departmentId" | "customDepartmentLabel" | "namingPattern" | "fileFormat">,
): string {
  return generateScanFileName(config);
}

export const OFFLINE_DEFAULT_SAVE_NOTES = "Invoice from John Doe – May 20, 2024";

export function getGeneratedSavePreviewPath(
  savePath: string,
  fileName: string,
  config: Pick<OfflineScanConfig, "departmentId" | "customDepartmentLabel">,
): string {
  const base =
    savePath.trim() ||
    `C:\\Scanned Documents\\${resolveDepartmentLabel(config).replace(/\s+/g, "")}`;
  const trimmed = base.replace(/[\\/]+$/, "");
  return `${trimmed}\\${fileName}`;
}

export type DocumentPreviewMeta = {
  documentType: string;
  reference: string;
  openingLine: string;
  bodyLines: string[];
};

const DEPARTMENT_DOCUMENT_PREVIEW: Record<string, DocumentPreviewMeta> = {
  finance: {
    documentType: "Payment Voucher",
    reference: "PV-2024-0520",
    openingLine: "Supporting documents attached for processing and filing.",
    bodyLines: [
      "Payee details and account information appear on the attached form.",
      "Amount in figures and words must match the supporting receipt.",
      "Department head approval is required before release.",
    ],
  },
  registrar: {
    documentType: "Student Records Form",
    reference: "REG-2024-0520",
    openingLine: "Enrollment and academic records submitted for digitization.",
    bodyLines: [
      "Student name, ID number, and program must be clearly visible.",
      "Registrar stamp and date should appear on the lower section.",
      "Use a flatbed scan for multi-page transcripts when possible.",
    ],
  },
  hr: {
    documentType: "Personnel File",
    reference: "HR-2024-0520",
    openingLine: "Employee document prepared for secure local archiving.",
    bodyLines: [
      "Contract terms, signatures, and ID copies should remain legible.",
      "Personnel data is stored locally unless cloud sync is enabled.",
      "Handle confidential pages face-down on the scanner glass.",
    ],
  },
  admin: {
    documentType: "Office Memorandum",
    reference: "MEMO-2024-0520",
    openingLine: "Internal correspondence captured for records management.",
    bodyLines: [
      "Subject line, routing notes, and approval block should be included.",
      "Memos with attachments may require separate page scans.",
      "Retain the original hard copy after scanning when required.",
    ],
  },
  library: {
    documentType: "Catalog Record Sheet",
    reference: "LIB-2024-0520",
    openingLine: "Library material record prepared for cataloging.",
    bodyLines: [
      "Title, author, and accession details should be centered on the page.",
      "Barcode or call-number labels must scan without blur.",
      "Use color mode for illustrated covers and reference inserts.",
    ],
  },
};

export function getDocumentPreviewMeta(departmentId: string): DocumentPreviewMeta {
  return DEPARTMENT_DOCUMENT_PREVIEW[departmentId] ?? DEPARTMENT_DOCUMENT_PREVIEW.finance;
}

export function getDocumentPreviewPaperClass(paperSizeId?: string): string {
  if (paperSizeId === "long-bond") return "scan-doc-preview__page--long-bond";
  if (paperSizeId === "short-bond" || paperSizeId === "letter") {
    return "scan-doc-preview__page--letter";
  }
  return "scan-doc-preview__page--a4";
}

export function getDocumentPreviewColorClass(colorModeId?: string): string {
  if (colorModeId === "grayscale") return "scan-doc-preview__page--grayscale";
  if (colorModeId === "bw") return "scan-doc-preview__page--bw";
  return "scan-doc-preview__page--color";
}
