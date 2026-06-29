import type { DateRangeValue } from "../components/ModernDatePicker";
import { EMPTY_DATE_RANGE } from "../components/ModernDatePicker";
import { saveTextFile } from "../utils/saveFile";
import { formatDatedExportFilename, formatExportFileSizeLabel } from "../utils/exportFormat";

export type HelpSupportReportStatus =
  | "open"
  | "pending"
  | "in-progress"
  | "resolved"
  | "closed";

export type HelpSupportTabFilter = "all" | HelpSupportReportStatus;

export type HelpSupportReportRow = {
  id: string;
  handle: string;
  organization: string;
  department: string;
  subject: string;
  category: string;
  date: string;
  status: HelpSupportReportStatus;
};

export type HelpSupportCommonIssue = {
  label: string;
  count: number;
};

export type HelpSupportFaqItem = {
  question: string;
};

export const HELP_SUPPORT_TAB_OPTIONS: Array<{ value: HelpSupportTabFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "open", label: "Open" },
  { value: "pending", label: "Pending" },
  { value: "in-progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

export const HELP_SUPPORT_CATALOG_STATS = {
  total: 6,
  totalHint: "All time",
  resolved: 3,
  resolvedHint: "50% resolved",
  open: 3,
  openHint: "50% open",
} as const;

export const HELP_SUPPORT_CATALOG_REPORTS: HelpSupportReportRow[] = [
  {
    id: "SCN-2024-0089",
    handle: "@jdelacruz",
    organization: "Cebu Doctors' Hospital",
    department: "IT",
    subject: "Registration failure during device setup",
    category: "Registration",
    date: "May 27, 2026 10:30 AM",
    status: "open",
  },
  {
    id: "SCN-2024-0090",
    handle: "@msantos",
    organization: "Abaka Digital",
    department: "Marketing",
    subject: "Device goes offline intermittently",
    category: "Connectivity",
    date: "May 27, 2026 11:45 AM",
    status: "pending",
  },
  {
    id: "SCN-2024-0091",
    handle: "@arivera",
    organization: "Bohol Provincial Hospital",
    department: "Supply",
    subject: "Scanner sync stuck at processing stage",
    category: "Sync",
    date: "May 26, 2026 02:15 PM",
    status: "in-progress",
  },
  {
    id: "SCN-2024-0092",
    handle: "@itdept",
    organization: "Tagbilaran City College",
    department: "IT Dept",
    subject: "License validation error on startup",
    category: "License",
    date: "May 26, 2026 03:50 PM",
    status: "resolved",
  },
  {
    id: "SCN-2024-0093",
    handle: "@scanner",
    organization: "SM Prime Holdings",
    department: "Operations",
    subject: "Scanner configuration reset unexpectedly",
    category: "Configuration",
    date: "May 25, 2026 09:10 AM",
    status: "resolved",
  },
  {
    id: "SCN-2024-0094",
    handle: "@admin",
    organization: "Department of Health Region 7",
    department: "Administration",
    subject: "Old ticket - resolved and archived",
    category: "Registration",
    date: "May 24, 2026 04:00 PM",
    status: "closed",
  },
];

export const HELP_SUPPORT_COMMON_ISSUES: HelpSupportCommonIssue[] = [
  { label: "Device registration failure", count: 15 },
  { label: "Scanner sync timeout", count: 13 },
  { label: "Network connectivity loss", count: 11 },
  { label: "License validation error", count: 9 },
  { label: "Configuration reset issues", count: 7 },
];

export const HELP_SUPPORT_FAQ_ITEMS: HelpSupportFaqItem[] = [
  { question: "How do I register a scanner?" },
  { question: "What to do when a device goes offline?" },
  { question: "How to resolve sync timeout errors?" },
  { question: "How to update scanner configuration?" },
  { question: "How do I revoke a device key?" },
];

function parseHelpSupportReportDate(displayDate: string): string {
  const parsed = new Date(displayDate);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function matchesHelpSupportDateRange(displayDate: string, dateRange: DateRangeValue): boolean {
  if (!dateRange.start) {
    return true;
  }

  const iso = parseHelpSupportReportDate(displayDate);
  if (!iso) {
    return true;
  }

  const end = dateRange.end || dateRange.start;
  const min = dateRange.start <= end ? dateRange.start : end;
  const max = dateRange.start <= end ? end : dateRange.start;
  return iso >= min && iso <= max;
}

export function filterHelpSupportReports(
  rows: HelpSupportReportRow[],
  searchQuery: string,
  tabFilter: HelpSupportTabFilter,
  dateRange: DateRangeValue
): HelpSupportReportRow[] {
  const query = searchQuery.trim().toLowerCase();

  return rows.filter((row) => {
    if (tabFilter !== "all" && row.status !== tabFilter) {
      return false;
    }

    if (!matchesHelpSupportDateRange(row.date, dateRange)) {
      return false;
    }

    if (!query) {
      return true;
    }

    return (
      row.id.toLowerCase().includes(query) ||
      row.handle.toLowerCase().includes(query) ||
      row.organization.toLowerCase().includes(query) ||
      row.department.toLowerCase().includes(query) ||
      row.subject.toLowerCase().includes(query) ||
      row.category.toLowerCase().includes(query) ||
      row.date.toLowerCase().includes(query) ||
      row.status.toLowerCase().includes(query)
    );
  });
}

export function displayHelpSupportReportStatus(status: HelpSupportReportStatus): string {
  if (status === "open") return "Open";
  if (status === "pending") return "Pending";
  if (status === "in-progress") return "In Progress";
  if (status === "resolved") return "Resolved";
  return "Closed";
}

export function helpSupportReportStatusClass(status: HelpSupportReportStatus): string {
  return status;
}

export const HELP_SUPPORT_REPORTS_EXPORT_PATH = "C:\\Documents\\Exports\\Reports";

export type HelpSupportReportsExportResult = {
  filename: string;
  fileSizeLabel: string;
  savePath: string;
};

function escapeHelpSupportReportCsvValue(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

function buildHelpSupportReportsCsvContent(rows: HelpSupportReportRow[]): string {
  const header = ["Serial Key", "Organization", "Subject", "Category", "Date", "Status"].join(",");

  const csvRows = rows.map((row) =>
    [
      escapeHelpSupportReportCsvValue(row.id),
      escapeHelpSupportReportCsvValue(`${row.organization} / ${row.department}`),
      escapeHelpSupportReportCsvValue(row.subject),
      escapeHelpSupportReportCsvValue(row.category),
      escapeHelpSupportReportCsvValue(row.date),
      escapeHelpSupportReportCsvValue(displayHelpSupportReportStatus(row.status)),
    ].join(",")
  );

  return [header, ...csvRows].join("\n");
}

export async function exportHelpSupportReportsCsv(
  rows: HelpSupportReportRow[]
): Promise<HelpSupportReportsExportResult> {
  const content = buildHelpSupportReportsCsvContent(rows);
  const filename = formatDatedExportFilename("Reports");
  const { directoryPath, sizeBytes } = await saveTextFile(content, filename, "reports");

  return {
    filename,
    fileSizeLabel: formatExportFileSizeLabel(sizeBytes),
    savePath: directoryPath,
  };
}

// Legacy exports kept for unused filter dropdown components.
export type HelpSupportReportsFilter = {
  category: "all" | string;
  dateRange: DateRangeValue;
  status: "all" | string;
};

export type HelpSupportTroubleshootingFilter = "all" | "open" | "review" | "resolved";

export const DEFAULT_HELP_SUPPORT_REPORTS_FILTER: HelpSupportReportsFilter = {
  category: "all",
  dateRange: { ...EMPTY_DATE_RANGE },
  status: "all",
};

export const DEFAULT_HELP_SUPPORT_TROUBLESHOOTING_FILTER: HelpSupportTroubleshootingFilter = "all";
