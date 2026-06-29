import type { DateRangeValue } from "../components/ModernDatePicker";

export const USER_REGISTRATION_STATS = {
  assignedLicenseKeys: 0,
  registeredUsers: 0,
  activeAccounts: 0,
} as const;

export const USER_REGISTRATION_TOTAL = 0;
export const USER_REGISTRATION_PAGE_SIZE = 6;

export const USER_REGISTRATION_ASSIGNED_ORGANIZATION = {
  name: "",
  organizationKey: "",
} as const;

export const USER_REGISTRATION_DEPARTMENTS = [
  { value: "all", label: "Department" },
  { value: "Registrar", label: "Registrar" },
  { value: "Finance", label: "Finance" },
  { value: "Records", label: "Records" },
  { value: "Guidance", label: "Guidance" },
  { value: "Library", label: "Library" },
  { value: "Admissions", label: "Admissions" },
] as const;

export type UserRegistrationDepartmentFilter =
  (typeof USER_REGISTRATION_DEPARTMENTS)[number]["value"];

export type UserRegistrationRow = {
  id: number;
  name: string;
  username: string;
  initials: string;
  organization: string;
  organizationKey: string;
  department: string;
  serialKey: string;
  status: "activated" | "inactive" | "pending-revocation" | "revoked";
  registeredDate: string;
};

export function getUserRegistrationRow(_index: number): UserRegistrationRow {
  return {
    id: 0,
    name: "",
    username: "",
    initials: "",
    organization: "",
    organizationKey: "",
    department: "",
    serialKey: "",
    status: "activated",
    registeredDate: "",
  };
}

export function buildUserRegistrationCatalog(_total = USER_REGISTRATION_TOTAL): UserRegistrationRow[] {
  return [];
}

export function buildUserRegistrationCatalogForAssignedOrganization(
  _total = USER_REGISTRATION_TOTAL
): UserRegistrationRow[] {
  return [];
}

function matchesDateRange(date: string, range: DateRangeValue) {
  if (!range.start) {
    return true;
  }

  const end = range.end || range.start;
  const min = range.start <= end ? range.start : end;
  const max = range.start <= end ? end : range.start;
  return date >= min && date <= max;
}

export function filterUserRegistrationRows(
  rows: UserRegistrationRow[],
  query: string,
  department: UserRegistrationDepartmentFilter,
  dateRange: DateRangeValue
): UserRegistrationRow[] {
  const normalized = query.trim().toLowerCase();

  return rows.filter((row) => {
    if (department !== "all" && row.department !== department) {
      return false;
    }

    if (!matchesDateRange(row.registeredDate, dateRange)) {
      return false;
    }

    if (!normalized) {
      return true;
    }

    return (
      row.name.toLowerCase().includes(normalized) ||
      row.username.toLowerCase().includes(normalized) ||
      row.department.toLowerCase().includes(normalized) ||
      row.serialKey.toLowerCase().includes(normalized)
    );
  });
}
