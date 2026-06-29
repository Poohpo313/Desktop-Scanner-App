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
  concernType: string;
  message: string;
  email: string | null;
  rating: number | null;
  dateLine: string;
  timeLine: string;
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

export const HELP_SUPPORT_OPEN_REPLY_MODAL = {
  title: "",
  subtitle: "",
} as const;

export function helpSupportStatusOpensReplyModal(status: HelpSupportReportStatus): boolean {
  return status === "open";
}

export const HELP_SUPPORT_CATALOG_STATS = {
  total: 0,
  totalHint: "",
  resolved: 0,
  resolvedHint: "",
  open: 0,
  openHint: "",
} as const;

export const HELP_SUPPORT_CATALOG_REPORTS: HelpSupportReportRow[] = [];

export const HELP_SUPPORT_COMMON_ISSUES: HelpSupportCommonIssue[] = [];

export const HELP_SUPPORT_FAQ_ITEMS: HelpSupportFaqItem[] = [];

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

function matchesHelpSupportDateRange(dateLine: string, dateRange: DateRangeValue): boolean {
  if (!dateRange.start) {
    return true;
  }

  const iso = parseHelpSupportReportDate(dateLine);
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

    if (!matchesHelpSupportDateRange(row.dateLine, dateRange)) {
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
      row.concernType.toLowerCase().includes(query) ||
      row.message.toLowerCase().includes(query) ||
      (row.email ?? "").toLowerCase().includes(query) ||
      row.dateLine.toLowerCase().includes(query) ||
      row.timeLine.toLowerCase().includes(query) ||
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

export function getHelpSupportReplyModalContent(row: HelpSupportReportRow): {
  title: string;
  statusLabel: string;
  details: {
    username: string;
    organization: string;
    department: string;
    concernType: string;
    category: string;
    subject: string;
    message: string;
    email: string | null;
    rating: number | null;
    submittedAt: string;
  };
} {
  return {
    title: row.subject,
    statusLabel: displayHelpSupportReportStatus(row.status),
    details: {
      username: row.handle,
      organization: row.organization,
      department: row.department,
      concernType: row.concernType,
      category: row.category,
      subject: row.subject,
      message: row.message,
      email: row.email,
      rating: row.rating,
      submittedAt: `${row.dateLine} ${row.timeLine}`.trim(),
    },
  };
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
      escapeHelpSupportReportCsvValue(`${row.dateLine} ${row.timeLine}`),
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

export type HelpSupportReportsFilterDimension = "category" | "date" | "status";

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

export const HELP_SUPPORT_REPORTS_FILTER_DIMENSIONS: Array<{
  value: HelpSupportReportsFilterDimension;
  label: string;
}> = [
  { value: "category", label: "Category" },
  { value: "date", label: "Date" },
  { value: "status", label: "Status" },
];

export const HELP_SUPPORT_CATEGORY_FILTER_OPTIONS = [
  { value: "all" as const, label: "All Categories" },
  { value: "Registration", label: "Registration" },
  { value: "Connectivity", label: "Connectivity" },
  { value: "Sync", label: "Sync" },
  { value: "License", label: "License" },
  { value: "Configuration", label: "Configuration" },
];

export const HELP_SUPPORT_STATUS_FILTER_OPTIONS = [
  { value: "all" as const, label: "All Statuses" },
  { value: "open" as const, label: "Open" },
  { value: "pending" as const, label: "Pending" },
  { value: "in-progress" as const, label: "In Progress" },
  { value: "resolved" as const, label: "Resolved" },
  { value: "closed" as const, label: "Closed" },
];

export const HELP_SUPPORT_TROUBLESHOOTING_FILTER_OPTIONS: Array<{
  value: HelpSupportTroubleshootingFilter;
  label: string;
}> = [
  { value: "open", label: "Open" },
  { value: "review", label: "Review" },
  { value: "resolved", label: "Resolved" },
];
