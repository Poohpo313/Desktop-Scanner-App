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
  total: 1196,
  active: 1138,
  inactive: 44,
} as const;

export const DEVICE_CATALOG_TOTAL = 25;
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

const PAGE_ONE_ROWS: DeviceCatalogRow[] = [
  {
    id: 1,
    deviceName: "DESKTOP-01",
    serialKey: "DSK-574-B92",
    registeredUser: "John Doe",
    department: "Finance",
    departmentKey: "finance",
    status: "active",
  },
  {
    id: 2,
    deviceName: "DESKTOP-02",
    serialKey: "DSK-829-C45",
    registeredUser: "Jane Smith",
    department: "HR",
    departmentKey: "hr",
    status: "active",
  },
  {
    id: 3,
    deviceName: "DESKTOP-03",
    serialKey: "DSK-143-A78",
    registeredUser: "Michael Johnson",
    department: "IT",
    departmentKey: "it",
    status: "inactive",
  },
  {
    id: 4,
    deviceName: "DESKTOP-04",
    serialKey: "DSK-926-D31",
    registeredUser: "Emily Davis",
    department: "Operations",
    departmentKey: "operations",
    status: "active",
  },
  {
    id: 5,
    deviceName: "DESKTOP-05",
    serialKey: "DSK-687-E90",
    registeredUser: "David Wilson",
    department: "Finance",
    departmentKey: "finance",
    status: "inactive",
  },
];

const EXTRA_USERS = [
  "Olivia Brown",
  "James Miller",
  "Sophia Garcia",
  "William Martinez",
  "Ava Rodriguez",
  "Benjamin Lee",
  "Mia Walker",
  "Lucas Hall",
  "Charlotte Allen",
  "Henry Young",
  "Amelia King",
  "Sebastian Wright",
  "Harper Lopez",
  "Jack Hill",
  "Ella Scott",
  "Owen Green",
  "Scarlett Adams",
  "Leo Baker",
  "Chloe Nelson",
];

const EXTRA_DEPARTMENTS: Array<{ label: string; key: DeviceCatalogDepartmentFilter }> = [
  { label: "Finance", key: "finance" },
  { label: "HR", key: "hr" },
  { label: "IT", key: "it" },
  { label: "Operations", key: "operations" },
  { label: "Marketing", key: "marketing" },
];

function buildExtraRows(): DeviceCatalogRow[] {
  return Array.from({ length: DEVICE_CATALOG_TOTAL - PAGE_ONE_ROWS.length }, (_, index) => {
    const id = index + 6;
    const department = EXTRA_DEPARTMENTS[index % EXTRA_DEPARTMENTS.length];
    const status: DeviceCatalogStatus = index % 4 === 0 ? "inactive" : "active";

    return {
      id,
      deviceName: `DESKTOP-${String(id).padStart(2, "0")}`,
      serialKey: `DSK-${String(100 + id * 17).slice(-3)}-${String(40 + id * 11).slice(-2)}${id % 10}`,
      registeredUser: EXTRA_USERS[index % EXTRA_USERS.length],
      department: department.label,
      departmentKey: department.key,
      status,
    };
  });
}

export const DEVICE_CATALOG_ROWS: DeviceCatalogRow[] = [...PAGE_ONE_ROWS, ...buildExtraRows()];

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
