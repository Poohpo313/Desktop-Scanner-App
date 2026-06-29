export type DeviceCatalogStatus = "active" | "inactive";

export type DeviceCatalogDepartmentFilter =
  | "all"
  | "finance"
  | "hr"
  | "it"
  | "operations"
  | "marketing";

export type DeviceCatalogSortFilter =
  | "default"
  | "device-name"
  | "registered-user"
  | "department"
  | "status";

export type DeviceCatalogRow = {
  id: number;
  deviceName: string;
  serialKey: string;
  registeredUser: string;
  department: string;
  departmentKey: DeviceCatalogDepartmentFilter;
  status: DeviceCatalogStatus;
};

export const DEVICE_CATALOG_STATS = {
  total: 0,
  active: 0,
  inactive: 0,
} as const;

export const DEVICE_CATALOG_TOTAL = 0;
export const DEVICE_CATALOG_PAGE_SIZE = 5;

export const DEVICE_CATALOG_DEPARTMENTS = [
  { value: "all" as const, label: "All Departments" },
  { value: "finance" as const, label: "Finance" },
  { value: "hr" as const, label: "HR" },
  { value: "it" as const, label: "IT" },
  { value: "operations" as const, label: "Operations" },
  { value: "marketing" as const, label: "Marketing" },
];

export const DEVICE_CATALOG_SORT_OPTIONS = [
  { value: "default" as const, label: "Sort By" },
  { value: "device-name" as const, label: "Device Name" },
  { value: "registered-user" as const, label: "Registered User" },
  { value: "department" as const, label: "Department" },
  { value: "status" as const, label: "Status" },
];

export const DEVICE_CATALOG_ROWS: DeviceCatalogRow[] = [];

export function filterDeviceCatalogRows(
  rows: DeviceCatalogRow[],
  searchQuery: string,
  department: DeviceCatalogDepartmentFilter,
  sort: DeviceCatalogSortFilter
): DeviceCatalogRow[] {
  const query = searchQuery.trim().toLowerCase();
  let filtered = rows.filter((row) => {
    if (department !== "all" && row.departmentKey !== department) {
      return false;
    }

    if (!query) {
      return true;
    }

    return (
      row.deviceName.toLowerCase().includes(query) ||
      row.serialKey.toLowerCase().includes(query) ||
      row.registeredUser.toLowerCase().includes(query) ||
      row.department.toLowerCase().includes(query)
    );
  });

  if (sort === "device-name") {
    filtered = [...filtered].sort((a, b) => a.deviceName.localeCompare(b.deviceName));
  } else if (sort === "registered-user") {
    filtered = [...filtered].sort((a, b) => a.registeredUser.localeCompare(b.registeredUser));
  } else if (sort === "department") {
    filtered = [...filtered].sort((a, b) => a.department.localeCompare(b.department));
  } else if (sort === "status") {
    filtered = [...filtered].sort((a, b) => a.status.localeCompare(b.status));
  }

  return filtered;
}

export function getDeviceCatalogTotalEntries(
  filteredCount: number,
  hasSearch: boolean,
  department: DeviceCatalogDepartmentFilter
): number {
  if (hasSearch || department !== "all") {
    return filteredCount;
  }

  return DEVICE_CATALOG_TOTAL;
}