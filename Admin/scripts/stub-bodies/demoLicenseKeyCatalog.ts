import type { DateRangeValue } from "../components/ModernDatePicker";
import { saveTextFile } from "../utils/saveFile";
import { formatDatedExportFilename, formatExportFileSizeLabel } from "../utils/exportFormat";

export type LicenseKeyCatalogStatus = "used" | "unused";

export type LicenseKeyCatalogOrganizationFilter = "all" | (string & {});

export type LicenseKeyCatalogStatusFilter = "all" | LicenseKeyCatalogStatus;

export type LicenseKeyCatalogDepartmentFilter =
  | "all"
  | "finance"
  | "it"
  | "hr"
  | "operations"
  | "marketing";

export type LicenseKeyCatalogRow = {
  id: number;
  serialKey: string;
  username: string;
  company: string;
  companyKey: string;
  department: string;
  generatedDate: string;
  generatedDateIso: string;
  expirationDate: string;
  status: LicenseKeyCatalogStatus;
};

export const LICENSE_KEY_CATALOG_ASSIGNED_ORGANIZATION = {
  name: "",
  organizationKey: "",
} as const;

export const LICENSE_KEY_CATALOG_ASSIGNED_SERIAL_KEYS = 0;

export const LICENSE_KEY_CATALOG_USED_COUNT = 0;
export const LICENSE_KEY_CATALOG_UNUSED_COUNT = 0;

export const LICENSE_KEY_CATALOG_TOTAL = 0;

export const LICENSE_KEY_CATALOG_PAGE_SIZE = 7;
export const LICENSE_KEY_CATALOG_EXPORT_PATH = "C:\\Documents\\Exports\\SerialKeys";

export const LICENSE_KEY_CATALOG_STATUS_OPTIONS = [
  { value: "all" as const, label: "All" },
  { value: "used" as const, label: "Used" },
  { value: "unused" as const, label: "Unused" },
];

export const LICENSE_KEY_CATALOG_DEPARTMENTS = [
  { value: "all" as const, label: "All Department" },
  { value: "finance" as const, label: "Finance" },
  { value: "it" as const, label: "IT" },
  { value: "hr" as const, label: "HR" },
  { value: "operations" as const, label: "Operations" },
  { value: "marketing" as const, label: "Marketing" },
] as const;

export function getLicenseKeyCatalogRow(_index: number): LicenseKeyCatalogRow {
  return {
    id: 0,
    serialKey: "",
    username: "",
    company: "",
    companyKey: "",
    department: "",
    generatedDate: "",
    generatedDateIso: "",
    expirationDate: "",
    status: "unused",
  };
}

export function buildLicenseKeyCatalog(_total = LICENSE_KEY_CATALOG_TOTAL): LicenseKeyCatalogRow[] {
  return [];
}

export function buildLicenseKeyCatalogForAssignedOrganization(
  _total = LICENSE_KEY_CATALOG_TOTAL
): LicenseKeyCatalogRow[] {
  return [];
}

export function getLicenseKeyCatalogSummaryStats() {
  return {
    used: LICENSE_KEY_CATALOG_USED_COUNT,
    unused: LICENSE_KEY_CATALOG_UNUSED_COUNT,
  };
}

/** @deprecated Use getLicenseKeyCatalogSummaryStats instead */
export function computeLicenseKeyCatalogStats(
  _rows: LicenseKeyCatalogRow[],
  _organization: LicenseKeyCatalogOrganizationFilter = "all",
  _department: LicenseKeyCatalogDepartmentFilter = "all"
) {
  const summary = getLicenseKeyCatalogSummaryStats();
  return {
    total: LICENSE_KEY_CATALOG_TOTAL,
    used: summary.used,
    unused: summary.unused,
    totalHint: "",
    usedHint: "",
    unusedHint: "",
  };
}

export function getLicenseKeyCatalogDepartmentLabel(
  department: LicenseKeyCatalogDepartmentFilter
): string {
  return (
    LICENSE_KEY_CATALOG_DEPARTMENTS.find((option) => option.value === department)?.label ??
    "All Department"
  );
}

function rowMatchesDepartment(
  row: LicenseKeyCatalogRow,
  department: LicenseKeyCatalogDepartmentFilter
): boolean {
  if (department === "all") {
    return true;
  }

  return row.department.toLowerCase() === department;
}

function matchesDateRange(iso: string, dateRange: DateRangeValue): boolean {
  if (!dateRange.start) {
    return true;
  }

  const end = dateRange.end || dateRange.start;
  const min = dateRange.start <= end ? dateRange.start : end;
  const max = dateRange.start <= end ? end : dateRange.start;
  return iso >= min && iso <= max;
}

export function filterLicenseKeyCatalogRows(
  rows: LicenseKeyCatalogRow[],
  searchQuery: string,
  status: LicenseKeyCatalogStatusFilter,
  department: LicenseKeyCatalogDepartmentFilter,
  dateRange: DateRangeValue
): LicenseKeyCatalogRow[] {
  const normalized = searchQuery.trim().toLowerCase();

  return rows.filter((row) => {
    if (row.companyKey !== LICENSE_KEY_CATALOG_ASSIGNED_ORGANIZATION.organizationKey) {
      return false;
    }

    if (status !== "all" && row.status !== status) {
      return false;
    }

    if (!rowMatchesDepartment(row, department)) {
      return false;
    }

    if (!matchesDateRange(row.generatedDateIso, dateRange)) {
      return false;
    }

    if (!normalized) {
      return true;
    }

    return (
      row.serialKey.toLowerCase().includes(normalized) ||
      row.username.toLowerCase().includes(normalized) ||
      row.department.toLowerCase().includes(normalized)
    );
  });
}

export type LicenseKeyCatalogExportResult = {
  filename: string;
  fileSizeLabel: string;
  savePath: string;
};

function escapeLicenseKeyCatalogCsvValue(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

function buildLicenseKeyCatalogCsvContent(rows: LicenseKeyCatalogRow[]): string {
  const header = [
    "Serial Key",
    "User",
    "Company",
    "Department",
    "Generated Date",
    "Status",
    "Expiration Date",
  ].join(",");

  const csvRows = rows.map((row) =>
    [
      escapeLicenseKeyCatalogCsvValue(row.serialKey),
      escapeLicenseKeyCatalogCsvValue(row.username),
      escapeLicenseKeyCatalogCsvValue(row.company),
      escapeLicenseKeyCatalogCsvValue(row.department),
      escapeLicenseKeyCatalogCsvValue(row.generatedDate),
      escapeLicenseKeyCatalogCsvValue(row.status === "used" ? "Used" : "Unused"),
      escapeLicenseKeyCatalogCsvValue(row.expirationDate),
    ].join(",")
  );

  return [header, ...csvRows].join("\n");
}

export async function exportLicenseKeyCatalogCsv(
  rows: LicenseKeyCatalogRow[]
): Promise<LicenseKeyCatalogExportResult> {
  const content = buildLicenseKeyCatalogCsvContent(rows);
  const filename = formatDatedExportFilename("Keys");
  const { directoryPath, sizeBytes } = await saveTextFile(content, filename, "serial-keys");

  return {
    filename,
    fileSizeLabel: formatExportFileSizeLabel(sizeBytes),
    savePath: directoryPath,
  };
}