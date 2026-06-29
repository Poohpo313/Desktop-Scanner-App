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
  name: "Bohol Island State University - Main Campus",
  organizationKey: "bohol-island-state-university-main-campus",
} as const;

/** Assigned serial key count loaded for the officer's organization. */
export const LICENSE_KEY_CATALOG_ASSIGNED_SERIAL_KEYS = 1000;

export const LICENSE_KEY_CATALOG_USED_COUNT = 800;
export const LICENSE_KEY_CATALOG_UNUSED_COUNT = 100;

export const LICENSE_KEY_CATALOG_TOTAL =
  LICENSE_KEY_CATALOG_USED_COUNT + LICENSE_KEY_CATALOG_UNUSED_COUNT;

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

const ASSIGNED_COMPANY = {
  company: LICENSE_KEY_CATALOG_ASSIGNED_ORGANIZATION.name,
  companyKey: LICENSE_KEY_CATALOG_ASSIGNED_ORGANIZATION.organizationKey,
};

const MOCKUP_ROWS: LicenseKeyCatalogRow[] = [
  {
    id: 1,
    serialKey: "BKD-QQ77-RR88-4F5B-5G7H",
    username: "tess.vega",
    ...ASSIGNED_COMPANY,
    department: "Finance",
    generatedDate: "May 29, 2026",
    generatedDateIso: "2026-05-29",
    expirationDate: "May 29, 2027",
    status: "used",
  },
  {
    id: 2,
    serialKey: "BKD-P2XN-BL9Z-4M7A-1K3D",
    username: "pat.ong",
    ...ASSIGNED_COMPANY,
    department: "IT",
    generatedDate: "May 28, 2026",
    generatedDateIso: "2026-05-28",
    expirationDate: "May 28, 2027",
    status: "used",
  },
  {
    id: 3,
    serialKey: "BKD-W4VB-RP6M-7N2Q-9X5Y",
    username: "luis.delacruz",
    ...ASSIGNED_COMPANY,
    department: "HR",
    generatedDate: "May 27, 2026",
    generatedDateIso: "2026-05-27",
    expirationDate: "May 27, 2027",
    status: "used",
  },
  {
    id: 4,
    serialKey: "BKD-T8M2-VL5K-3H7Q-4C9P",
    username: "maria.cruz",
    ...ASSIGNED_COMPANY,
    department: "Finance",
    generatedDate: "May 26, 2026",
    generatedDateIso: "2026-05-26",
    expirationDate: "May 26, 2027",
    status: "used",
  },
  {
    id: 5,
    serialKey: "BKD-J7R4-KN8V-2D6X-5H3F",
    username: "andrew.bautista",
    ...ASSIGNED_COMPANY,
    department: "Operations",
    generatedDate: "May 25, 2026",
    generatedDateIso: "2026-05-25",
    expirationDate: "May 25, 2027",
    status: "used",
  },
  {
    id: 6,
    serialKey: "BKD-G1B9-WQ4M-8L2P-6V7R",
    username: "jeffrey.torres",
    ...ASSIGNED_COMPANY,
    department: "Marketing",
    generatedDate: "May 24, 2026",
    generatedDateIso: "2026-05-24",
    expirationDate: "May 24, 2027",
    status: "used",
  },
  {
    id: 7,
    serialKey: "BKD-Z5H3-TC8K-1M9V-4P6N",
    username: "kim.park",
    ...ASSIGNED_COMPANY,
    department: "IT",
    generatedDate: "May 23, 2026",
    generatedDateIso: "2026-05-23",
    expirationDate: "May 23, 2027",
    status: "unused",
  },
];

const EXTRA_USED_USERS = [
  { username: "carlo.mendez", department: "IT" },
  { username: "grace.tan", department: "HR" },
  { username: "diego.ramos", department: "Operations" },
  { username: "ella.santos", department: "Marketing" },
  { username: "miguel.reyes", department: "Finance" },
  { username: "sofia.garcia", department: "IT" },
  { username: "noah.flores", department: "HR" },
  { username: "ava.morales", department: "Operations" },
  { username: "ethan.cruz", department: "Marketing" },
  { username: "lara.santos", department: "Finance" },
];

const DEPARTMENTS = ["Finance", "IT", "HR", "Operations", "Marketing"] as const;

function serialKeyForId(id: number) {
  const segments = [
    "BKD",
    `${String.fromCharCode(65 + (id % 26))}${id % 10}${String.fromCharCode(65 + ((id * 2) % 26))}${String.fromCharCode(65 + ((id * 3) % 26))}`,
    `${String.fromCharCode(65 + ((id * 4) % 26))}${id % 10}${String.fromCharCode(65 + ((id * 5) % 26))}`,
    `${id % 10}${String.fromCharCode(65 + ((id * 6) % 26))}${id % 10}${String.fromCharCode(65 + ((id * 7) % 26))}`,
    `${String.fromCharCode(65 + ((id * 8) % 26))}${id % 10}${String.fromCharCode(65 + ((id * 9) % 26))}`,
  ];
  return segments.join("-");
}

function isoDateForIndex(index: number) {
  const day = Math.max(1, 29 - (index % 29));
  return `2026-05-${String(day).padStart(2, "0")}`;
}

function displayDateForIso(iso: string) {
  const parsed = new Date(iso);
  return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function expirationDateForIso(iso: string) {
  const parsed = new Date(iso);
  parsed.setFullYear(parsed.getFullYear() + 1);
  return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function getSyntheticRow(index: number): LicenseKeyCatalogRow {
  if (index >= 0 && index < MOCKUP_ROWS.length) {
    return MOCKUP_ROWS[index];
  }

  const syntheticIndex = index - MOCKUP_ROWS.length;
  const id = index + 1;
  const isUsed = id <= LICENSE_KEY_CATALOG_USED_COUNT;
  const generatedDateIso = isoDateForIndex(syntheticIndex);
  const department = DEPARTMENTS[syntheticIndex % DEPARTMENTS.length];

  if (isUsed) {
    const template = EXTRA_USED_USERS[syntheticIndex % EXTRA_USED_USERS.length];
    return {
      id,
      serialKey: serialKeyForId(id),
      username: template.username,
      ...ASSIGNED_COMPANY,
      department: template.department,
      generatedDate: displayDateForIso(generatedDateIso),
      generatedDateIso,
      expirationDate: expirationDateForIso(generatedDateIso),
      status: "used",
    };
  }

  return {
    id,
    serialKey: serialKeyForId(id),
    username: "—",
    ...ASSIGNED_COMPANY,
    department,
    generatedDate: displayDateForIso(generatedDateIso),
    generatedDateIso,
    expirationDate: expirationDateForIso(generatedDateIso),
    status: "unused",
  };
}

export function getLicenseKeyCatalogRow(index: number): LicenseKeyCatalogRow {
  return getSyntheticRow(index);
}

export function buildLicenseKeyCatalog(total = LICENSE_KEY_CATALOG_TOTAL): LicenseKeyCatalogRow[] {
  return Array.from({ length: total }, (_, index) => getLicenseKeyCatalogRow(index));
}

export function buildLicenseKeyCatalogForAssignedOrganization(
  total = LICENSE_KEY_CATALOG_TOTAL
): LicenseKeyCatalogRow[] {
  return buildLicenseKeyCatalog(total).filter(
    (row) => row.companyKey === LICENSE_KEY_CATALOG_ASSIGNED_ORGANIZATION.organizationKey
  );
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
