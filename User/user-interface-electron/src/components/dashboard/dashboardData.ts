export type DashboardSortId = "newest" | "oldest" | "name-az" | "name-za";
export type DashboardDateRangeId = "7" | "30" | "90" | "all";
export type DashboardFileTypeFilter = "all" | "pdf" | "jpg" | "png" | "docx";
export type DashboardDepartmentFilterId =
  | "all"
  | "finance"
  | "registrar"
  | "hr"
  | "admin";

export const DASHBOARD_SORT_OPTIONS = [
  {
    id: "newest" as const,
    label: "Newest First",
    description: "Show recently modified files first",
  },
  {
    id: "oldest" as const,
    label: "Oldest First",
    description: "Show oldest modified files first",
  },
  {
    id: "name-az" as const,
    label: "File Name A–Z",
    description: "Sort files alphabetically",
  },
  {
    id: "name-za" as const,
    label: "File Name Z–A",
    description: "Reverse alphabetical sorting",
  },
];

export const DASHBOARD_DATE_RANGE_OPTIONS = [
  { id: "7" as const, label: "Last 7 Days" },
  { id: "30" as const, label: "Last 30 Days" },
  { id: "90" as const, label: "Last 90 Days" },
  { id: "all" as const, label: "All dates" },
];

export const DASHBOARD_DEPARTMENT_OPTIONS = [
  {
    id: "all" as const,
    label: "All Departments",
    description: "Show files from every department",
  },
  {
    id: "finance" as const,
    label: "Finance",
    description: "Invoices, Receipts, Reports",
  },
  {
    id: "registrar" as const,
    label: "Registrar",
    description: "Student Records, Forms",
  },
  {
    id: "hr" as const,
    label: "Human Resources",
    description: "Employee Files, Contracts",
  },
  {
    id: "admin" as const,
    label: "Admin Office",
    description: "Requests, Memorandums",
  },
];

export const DASHBOARD_FILE_TYPE_OPTIONS = [
  { id: "pdf" as const, label: "PDF" },
  { id: "jpg" as const, label: "JPG" },
  { id: "png" as const, label: "PNG" },
  { id: "docx" as const, label: "DOCX" },
];

export function dashboardSortLabel(sortId: DashboardSortId): string {
  return DASHBOARD_SORT_OPTIONS.find((option) => option.id === sortId)?.label ?? "Newest First";
}

export function dashboardDateRangeLabel(rangeId: DashboardDateRangeId): string {
  return DASHBOARD_DATE_RANGE_OPTIONS.find((option) => option.id === rangeId)?.label ?? "Last 30 Days";
}

export function dashboardDepartmentLabel(departmentId: DashboardDepartmentFilterId): string {
  return (
    DASHBOARD_DEPARTMENT_OPTIONS.find((option) => option.id === departmentId)?.label ??
    "All Departments"
  );
}
